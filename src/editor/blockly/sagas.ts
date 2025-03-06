// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import * as Blockly from 'blockly/core';
import { PythonGenerator } from 'blockly/python';
import { EventChannel, Task, buffers, eventChannel } from 'redux-saga';

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
    editorHighlightBlockCode,
    editorReplaceFile,
    editorReplaceSourceMap,
} from '../actions';
import { OpenFileManager, SourceMapType } from '../lib';
import {
    blocklyDidChangeModel,
    blocklyDidDispose,
    blocklyGenerateSource,
    blocklyHighlightBlock,
    blocklyRemoveHighlightFromBlock,
} from './actions';
import * as notify from './lib';

class MyPythonGenerator extends PythonGenerator {
    prefixWithBlock(v: string, b: Blockly.Block): string {
        if (v === null || v.trim().length === 0) {
            return v;
        }

        let line = v
            .split('\n')
            .map((l) => (l.trim().length > 0 ? `<<${b.id}>>${l}` : l))
            .join('\n');

        if (!line.endsWith('\n')) {
            line = `${line}\n`;
        }
        line = `${line}\n`;

        return line;
    }

    /**
     * Common tasks for generating Python from blocks.
     * Handles comments for the specified block and any connected value blocks.
     * Calls any statements following this block.
     *
     * @param block The current block.
     * @param code The Python code created for this block.
     * @param thisOnly True to generate code for only this statement.
     * @returns Python code with comments and subsequent blocks added.
     */
    scrub_(block: Blockly.Block, code: string, thisOnly = false): string {
        let commentCode = '';
        // Only collect comments for blocks that aren't inline.
        if (!block.outputConnection || !block.outputConnection.targetConnection) {
            // Collect comment for this block.
            let comment = block.getCommentText();
            if (comment) {
                comment = Blockly.utils.string.wrap(comment, this.COMMENT_WRAP - 3);
                commentCode += this.prefixLines(comment + '\n', '# ');
            }
            // Collect comments for all value arguments.
            // Don't collect comments for nested statements.
            for (let i = 0; i < block.inputList.length; i++) {
                if (block.inputList[i].type === Blockly.inputs.inputTypes.VALUE) {
                    const childBlock = block.inputList[i].connection!.targetBlock();
                    if (childBlock) {
                        comment = this.allNestedComments(childBlock);
                        if (comment) {
                            commentCode += this.prefixLines(comment, '# ');
                        }
                    }
                }
            }
        }
        const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
        const nextCode = thisOnly ? '' : this.blockToCode(nextBlock);
        return (
            this.prefixWithBlock(commentCode, block) +
            this.prefixWithBlock(code, block) +
            nextCode
        );
    }
}

const pythonGenerator = new MyPythonGenerator('python');

pythonGenerator.forBlock['start_program'] = (_block, _generator) => {
    //    const nextCode = generator.blockToCode(block.getNextBlock());

    return '';
};

pythonGenerator.forBlock['hub_block'] = (_block, _generator) => {
    //const nextCode = generator.blockToCode(block.getNextBlock());

    return `hub = PrimeHub()`;
};

pythonGenerator.forBlock['hub_beep'] = (_block, _generator) => {
    //const nextCode = generator.blockToCode(block.getNextBlock());

    return `hub.speaker.beep(440, 75)`;
};

pythonGenerator.forBlock['drive_init'] = (_block, _generator) => {
    return `left_motor = Motor(Port.A, Direction.COUNTERCLOCKWISE)
right_motor = Motor(Port.B)

drive_base = DriveBase(left_motor, right_motor, wheel_diameter=56, axle_track=112)
drive_base.use_gyro(True)`;
};

pythonGenerator.forBlock['move_curve_block'] = (_block, _generator) => {
    // Collect argument strings.
    // const fieldValue = block.getFieldValue('MY_FIELD');
    // const innerCode = generator.statementToCode(block, 'MY_STATEMENT_INPUT');

    return `drive_base.turn(90)`;
};

function* handleBlocklyWorkspaceDidChange(
    ms: number,
    chan: EventChannel<Blockly.Events.Abstract>,
    workspace: Blockly.Workspace,
): Generator {
    for (;;) {
        const event = yield* take(chan);

        if (event.isUiEvent) {
            if (event.type === Blockly.Events.SELECTED) {
                const selected = event as Blockly.Events.Selected;

                let styleName: string | undefined;

                if (selected.newElementId) {
                    const block = workspace.getBlockById(selected.newElementId);

                    styleName = block?.getStyleName();
                }

                yield* put(editorHighlightBlockCode(selected.newElementId, styleName));
            }

            // ignoring other ui events by now
            continue;
        }

        yield* put(editorHighlightBlockCode());

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

        const sourceMap: SourceMapType = [];
        const a = source.split('\n');
        for (let lineNumber = 0; lineNumber < a.length; lineNumber++) {
            const line = a[lineNumber];

            const startIndex = line.indexOf('<<');

            if (startIndex >= 0) {
                const endIndex = line.indexOf('>>', startIndex);

                const id = line.substring(startIndex + 2, endIndex);

                sourceMap.push({ line: lineNumber, id });

                a[lineNumber] = line.substring(endIndex + 2);
            }
        }

        source = a.join('\n');

        yield* put(editorReplaceSourceMap(action.uuid, sourceMap));
        yield* put(editorReplaceFile(action.uuid, source));
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

            let lis: Task | undefined;

            if (didLoad.data !== null) {
                console.debug('data loaded', didLoad.data);
                const data = JSON.parse(didLoad.data);

                Blockly.serialization.workspaces.load(data, workspace, {
                    recordUndo: false,
                });

                lis = yield* takeEvery(
                    blocklyDidChangeModel,
                    handleBlocklyDidChangeModel,
                    action.uuid,
                );
            }

            console.log('listening for ', action.uuid);

            yield* take(editorActivateFile.when((a) => a.uuid !== action.uuid));

            console.log('stop listening for ', action.uuid, lis);
            if (lis) {
                console.debug('stopping model change listener');
                yield cancel(lis);
            } else {
                console.debug('no model change listener to stop');
            }

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

function handleBlocklyHighlightBlock(
    workspace: Blockly.Workspace,
    action: ReturnType<typeof blocklyHighlightBlock>,
) {
    const block = workspace.getBlockById(action.id);

    if (block) {
        const svgWorkspace = workspace as Blockly.WorkspaceSvg;
        svgWorkspace.highlightBlock(block.id);
    }
}

function handleBlocklyRemoveHighlightFromBlock(workspace: Blockly.Workspace) {
    const block = workspace.getAllBlocks();

    if (block.length > 0) {
        const svgWorkspace = workspace as Blockly.WorkspaceSvg;

        svgWorkspace.highlightBlock(block[0].id);
        svgWorkspace.highlightBlock(block[0].id, false);
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

            yield* takeEvery(
                blocklyRemoveHighlightFromBlock,
                handleBlocklyRemoveHighlightFromBlock,
                workspace,
            );

            yield* takeEvery(
                blocklyHighlightBlock,
                handleBlocklyHighlightBlock,
                workspace,
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
