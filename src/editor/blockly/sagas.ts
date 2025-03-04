// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import * as Blockly from 'blockly/core';
import { EventChannel, buffers, eventChannel } from 'redux-saga';
import { cancel } from 'redux-saga/effects';
import {
    delay,
    fork,
    put,
    race,
    select,
    take,
    takeEvery,
} from 'typed-redux-saga/macro';
import { UUID } from '../../fileStorage';
import {
    fileStorageDidFailToLoadBlockly,
    fileStorageDidInitialize,
    fileStorageDidLoadBlockly,
    fileStorageLoadBlockly,
    fileStorageStoreBlocklyValue,
} from '../../fileStorage/actions';
import { RootState } from '../../reducers';
import { defined, ensureError } from '../../utils';
import { editorActivateFile, editorDidFailToOpenFile } from '../actions';
import { OpenFileManager } from '../lib';
import { blocklyDidChangeModel, blocklyDidDispose } from './actions';
import * as notify from './lib';

function* handleBlocklyWorkspaceDidChange(
    ms: number,
    chan: EventChannel<Blockly.Events.Abstract>,
    workspace: Blockly.Workspace,
): Generator {
    for (;;) {
        const event = yield* take(chan);

        // ignoring ui events by now
        if (event.isUiEvent) {
            continue;
        }

        const state = Blockly.serialization.workspaces.save(workspace);

        const value = JSON.stringify(state);

        yield* put(blocklyDidChangeModel(value));

        // throttle the writes so we don't do it too often while user is editing quickly
        yield* delay(ms);
    }
}

function* handleBlocklyDidChangeModel(
    uuid: UUID,
    action: ReturnType<typeof blocklyDidChangeModel>,
): Generator {
    console.log('saving data for ', uuid, action.value);
    const data = action.value;
    // when the model changes, save it to storage.
    yield* put(fileStorageStoreBlocklyValue(uuid, data));
    // failures are ignored
}

function* handleEditorActivateFile(
    workspace: Blockly.Workspace,
    _openFiles: OpenFileManager,
    action: ReturnType<typeof editorActivateFile>,
): Generator {
    try {
        console.debug('blockly activate file', action.uuid);

        const defer: Array<() => void | Promise<void>> = [];

        try {
            yield* put(fileStorageLoadBlockly(action.uuid));

            const { didLoad, didFailToLoad } = yield* race({
                didLoad: take(
                    fileStorageDidLoadBlockly.when((a) => a.uuid === action.uuid),
                ),
                didFailToLoad: take(
                    fileStorageDidFailToLoadBlockly.when((a) => a.uuid === action.uuid),
                ),
            });

            if (didFailToLoad) {
                throw didFailToLoad.error;
            }

            defined(didLoad);

            if (didLoad.data !== null) {
                const data = JSON.parse(didLoad.data);

                Blockly.serialization.workspaces.load(data, workspace, {
                    recordUndo: false,
                });
            }

            const lis = yield* takeEvery(
                blocklyDidChangeModel,
                handleBlocklyDidChangeModel,
                action.uuid,
            );

            console.log('listening for ', action.uuid);

            yield* take(editorActivateFile.when((a) => a.uuid !== action.uuid));

            console.log('stop listening for ', action.uuid, lis);
            yield cancel(lis);

            console.log('stopped');
        } finally {
            for (const callback of defer.reverse()) {
                callback();
            }
        }
    } catch (err) {
        // FIXME das ist der falsche Typ!!!
        yield* put(editorDidFailToOpenFile(action.uuid, ensureError(err)));
    }
}

function* handleDidCreateBlockly(workspace: Blockly.Workspace): Generator {
    const isFileStorageInitialized = yield* select(
        (s: RootState) => s.fileStorage.isInitialized,
    );

    if (!isFileStorageInitialized) {
        yield* take(fileStorageDidInitialize);
    }

    // eslint-disable-next-line no-useless-catch
    try {
        const defer: Array<() => void | Promise<void>> = [];

        console.log('blockly created');

        try {
            const didWorkspaceChangeChan = eventChannel<Blockly.Events.Abstract>(
                (emit) => {
                    workspace.addChangeListener(emit);
                    return () => workspace.removeChangeListener(emit);
                },
                buffers.sliding(1),
            );

            defer.push(() => didWorkspaceChangeChan.close());

            // ... and then fork to function that looks like
            // https://github.com/redux-saga/redux-saga/issues/620#issuecomment-259161095
            yield* fork(
                handleBlocklyWorkspaceDidChange,
                1000,
                didWorkspaceChangeChan,
                workspace,
            );

            const openFiles = new OpenFileManager();

            yield* takeEvery(
                editorActivateFile,
                handleEditorActivateFile,
                workspace,
                openFiles,
            );

            console.log('waiting for dispose');
            yield* take(blocklyDidDispose);

            console.log('you should never see this');
        } finally {
            for (const callback of defer.reverse()) {
                callback();
            }
        }
    } catch (err) {
        // FIXME das ist der falsche Typ!!!
        //yield* put(editorDidFailToOpenFile(action.uuid, ensureError(err)));
        throw err;
    }
}

function* monitorBlockly(): Generator {
    const ch = eventChannel<Blockly.Workspace>((emit) => {
        const subscription = notify.onDidCreateBlocklyEditor(emit);
        return () => subscription.dispose();
    });

    try {
        yield* takeEvery(ch, handleDidCreateBlockly);

        yield* take('__never__');
    } finally {
        ch.close();
    }
}

export default function* (): Generator {
    yield* fork(monitorBlockly);
}
