// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import * as Blockly from 'blockly/core';
import { pythonGenerator } from 'blockly/python';
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
    fileStorageDidFailToStoreTextFileValue,
    fileStorageDidInitialize,
    fileStorageDidLoadBlockly,
    fileStorageDidStoreTextFileValue,
    fileStorageLoadBlockly,
    fileStorageStoreBlocklyValue,
    fileStorageStoreTextFileValue,
} from '../../fileStorage/actions';
import { RootState } from '../../reducers';
import { defined, ensureError } from '../../utils';
import {
    editorActivateFile,
    editorDidFailToOpenFile,
    editorReplaceFile,
} from '../actions';
import { OpenFileManager } from '../lib';
import {
    blocklyDidChangeModel,
    blocklyDidDispose,
    blocklyGenerateSource,
} from './actions';
import * as notify from './lib';

pythonGenerator.forBlock['start_program'] = (_block, _generator) => {
    //    const nextCode = generator.blockToCode(block.getNextBlock());

    return '';
};

pythonGenerator.forBlock['hub_block'] = (_block, _generator) => {
    //const nextCode = generator.blockToCode(block.getNextBlock());

    return `
hub = PrimeHub(top_side=Axis.Z, front_side=Axis.X)
`;
};

pythonGenerator.forBlock['drive_init'] = (_block, _generator) => {
    return `
left_motor = Motor(Port.A, Direction.COUNTERCLOCKWISE)
right_motor = Motor(Port.B)

drive_base = DriveBase(left_motor, right_motor, wheel_diameter=56, axle_track=112)
drive_base.use_gyro(True)
`;
};

pythonGenerator.forBlock['move_curve_block'] = (_block, _generator) => {
    // Collect argument strings.
    // const fieldValue = block.getFieldValue('MY_FIELD');
    // const innerCode = generator.statementToCode(block, 'MY_STATEMENT_INPUT');

    // Return code.
    return `
drive_base.turn(90)
`;
};

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
    yield* put(blocklyGenerateSource(uuid));

    // failures are ignored
}

function* handleBlocklyGenerateSource(
    workspace: Blockly.Workspace,
    action: ReturnType<typeof blocklyGenerateSource>,
): Generator {
    console.debug('=== generate source');

    try {
        const blocks = workspace.getBlocksByType('start_program');

        pythonGenerator.init(workspace);
        let source = '';
        blocks.forEach((block) => {
            source += pythonGenerator.blockToCode(block);
        });

        if (source.length > 0) {
            source = `from pybricks.hubs import PrimeHub
from pybricks.pupdevices import Motor, ColorSensor, UltrasonicSensor, ForceSensor
from pybricks.parameters import Button, Color, Direction, Port, Side, Stop
from pybricks.robotics import DriveBase
from pybricks.tools import wait, StopWatch

${source}`;
        }

        yield* put(fileStorageStoreTextFileValue(action.uuid, source));

        const { didLoad, didFailToLoad } = yield* race({
            didLoad: take(
                fileStorageDidStoreTextFileValue.when((a) => a.uuid === action.uuid),
            ),
            didFailToLoad: take(
                fileStorageDidFailToStoreTextFileValue.when(
                    (a) => a.uuid === action.uuid,
                ),
            ),
        });

        if (didFailToLoad) {
            throw didFailToLoad.error;
        }

        defined(didLoad);

        yield* put(editorReplaceFile(action.uuid, source));

        console.debug(source);
    } catch (err) {
        console.error(err);
    }
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
            yield* takeEvery(
                blocklyGenerateSource,
                handleBlocklyGenerateSource,
                workspace,
            );

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
