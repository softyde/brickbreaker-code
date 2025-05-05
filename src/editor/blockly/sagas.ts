// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import * as Blockly from 'blockly/core';
import { EventChannel, Task, buffers, eventChannel } from 'redux-saga';

import { cancel } from 'redux-saga/effects';
import {
    //delay,
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
    blocklyDidChangeVar,
    blocklyDidCreateBlock,
    blocklyDidDeleteBlock,
    blocklyDidDispose,
    blocklyGenerateSource,
    blocklyHighlightBlock,
    blocklyRemoveHighlightFromBlock,
} from './actions';
import pythonGenerator from './codegenerator';
import * as notify from './lib';
import { VAR_ENTRY_NONE } from './variables';

function* handleBlocklyWorkspaceDidChange(
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

        if (event.type === Blockly.Events.BLOCK_DELETE) {
            console.log('*** DELETED');

            const deleted = event as Blockly.Events.BlockDelete;

            if (!deleted.ids) {
                throw 'empty id list';
            }

            for (let i = 0; i < deleted.ids.length; i++) {
                yield* put(blocklyDidDeleteBlock(deleted.ids[i]));
            }
        }

        if (event.type === Blockly.Events.BLOCK_CREATE) {
            console.log('*** CREATED');

            const created = event as Blockly.Events.BlockCreate;

            if (!created.ids) {
                throw 'empty id list';
            }

            for (let i = 0; i < created.ids.length; i++) {
                yield* put(blocklyDidCreateBlock(created.ids[i]));
            }
        }

        if (event.type === Blockly.Events.BLOCK_CHANGE) {
            console.log('*** CHANGED');

            const changed = event as Blockly.Events.BlockChange;

            if (changed.element === 'field' && changed.name?.startsWith('VAR.')) {
                console.log(changed);
                yield* put(
                    blocklyDidChangeVar(
                        changed.blockId!,
                        changed.name,
                        changed.oldValue as string,
                        changed.newValue as string,
                    ),
                );
            }

            console.log(changed);
        }

        yield* put(editorHighlightBlockCode());

        const state = Blockly.serialization.workspaces.save(workspace);

        const value = JSON.stringify(state);

        yield* put(blocklyDidChangeModel(value));
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

    // throttle the writes so we don't do it too often while user is editing quickly
    //    yield* delay(ms);
    // failures are ignored
}

function* handleBlocklyGenerateSource(
    workspace: Blockly.Workspace,
    action: ReturnType<typeof blocklyGenerateSource>,
): Generator {
    //console.debug('=== generate source');

    try {
        const setupBlocks = workspace.getBlocksByType('setup_program');
        const startBlocks = workspace.getBlocksByType('start_program');

        const blocks = [...setupBlocks, ...startBlocks];

        pythonGenerator.init(workspace);

        let source = '';
        blocks.forEach((block) => {
            source += pythonGenerator.blockToCode(block);
        });

        if (source.length > 0) {
            source = `from pybricks.hubs import PrimeHub
from pybricks.pupdevices import Motor, ColorSensor, UltrasonicSensor, ForceSensor
from pybricks.parameters import Button, Color, Direction, Port, Side, Stop, Axis
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

                a[lineNumber] =
                    line.substring(0, startIndex) + line.substring(endIndex + 2);
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

const findVariableName = (
    workspace: Blockly.Workspace,
    variableName: string,
    varId: string,
    type: string,
): string => {
    for (;;) {
        const variable = workspace.getVariable(variableName, type);

        if (!variable || variable.getId() === varId) {
            return variableName;
        }

        const index = variableName.search(/(\d)+$/);
        if (index < 0) {
            variableName += ' 1';
        } else {
            let num = parseInt(variableName.substring(index), 10);

            num += 1;

            variableName = variableName.substring(0, index) + num;
        }
    }
};

function getVariableType(name: string) {
    if (name.startsWith('VAR.')) {
        name = name.substring(4);
    }

    const index = name.lastIndexOf('.');
    if (index >= 0) {
        name = name.substring(0, index);
    }

    return name;
}

function createVariable(
    workspace: Blockly.Workspace,
    varType: string,
    varId: string,
    value: string,
) {
    console.debug(`>>> create variable ${value} == ${varId}, type=${varType}`);

    const existingVar = workspace.getVariableById(varId);
    if (!existingVar) {
        workspace.createVariable(value, varType, varId);
    }
}

function handleBlocklyDidCreateBlock(
    workspace: Blockly.Workspace,
    action: ReturnType<typeof blocklyDidCreateBlock>,
) {
    const block = workspace.getBlockById(action.blockId);
    if (!block) {
        throw `block with id ${action.blockId} not found`;
    }

    if (block.type.startsWith('shadow_')) {
        const b = block as Blockly.BlockSvg;
        const c = b.getSvgRoot();

        c.classList.add('blockly-shadow-20');
    }

    console.debug(`created ${action.blockId} = ${block.type}, ${block.isShadow()}`);

    block.inputList
        //    .filter((i) => i.type === Blockly.inputs.inputTypes.DUMMY)
        .forEach((i) => {
            i.fieldRow
                .filter((b) => b.name && b.name.startsWith('VAR.'))
                .forEach((input) => {
                    const varType = getVariableType(input.name!);
                    let value = block.getFieldValue(input.name!);
                    const id = `${input.name}.${block.id}`;

                    const newValue = findVariableName(workspace, value, id, varType);

                    if (newValue !== value) {
                        value = newValue;
                        input.setValue(value, false);
                    }

                    createVariable(workspace, varType, id, value);

                    workspace.getAllBlocks().forEach((block) => {
                        block.inputList
                            .filter(
                                (input) =>
                                    input.type === Blockly.inputs.inputTypes.DUMMY &&
                                    input.name.startsWith('LIST.'),
                            )
                            .forEach((input) => {
                                const field = input.fieldRow.find(
                                    (f) => f.name?.startsWith('VALUE.'),
                                )! as Blockly.FieldDropdown;

                                const value = field.getValue();
                                if (!value || value === VAR_ENTRY_NONE) {
                                    const firstOptions = field.getOptions(false)[0];
                                    field.setValue(firstOptions[1]);
                                }
                            });
                    });
                });
        });
}

function handleBlocklyDidDeleteBlock(
    workspace: Blockly.Workspace,
    action: ReturnType<typeof blocklyDidCreateBlock>,
) {
    console.log(`deleted ${action.blockId}`);

    const deletedVarIds: string[] = [];

    const variables = workspace.getAllVariables();

    variables.forEach((variable) => {
        const id = variable.getId();
        console.log(`${id} = ${variable.name} / ${variable.type}`);

        if (id.startsWith('VAR.') && id.endsWith(`.${action.blockId}`)) {
            console.log(`delete var ${id}`);
            deletedVarIds.push(id);
            workspace.deleteVariableById(id);
        }
    });

    workspace.getAllBlocks().forEach((block) => {
        block.inputList
            .filter(
                (input) =>
                    input.type === Blockly.inputs.inputTypes.DUMMY &&
                    input.name.startsWith('LIST.'),
            )
            .forEach((input) => {
                const field = input.fieldRow.find(
                    (f) => f.name?.startsWith('VALUE.'),
                )! as Blockly.FieldDropdown;

                const value = field.getValue();
                if (value) {
                    if (deletedVarIds.indexOf(value) >= 0) {
                        const firstOptions = field.getOptions(false)[0];
                        field.setValue(firstOptions[1]);
                    }
                }
            });
    });
}

function handleBlocklyDidChangeVar(
    workspace: Blockly.Workspace,
    action: ReturnType<typeof blocklyDidChangeVar>,
) {
    const id = `${action.name}.${action.blockId}`; // TODO see above
    const varType = getVariableType(action.name!);

    let newValue = action.newValue || action.oldValue;

    newValue = findVariableName(workspace, newValue, id, varType);

    const variable = workspace.getVariableById(id);
    variable!.name = newValue;

    const block = workspace.getBlockById(action.blockId)!;
    const field = block.getField(action.name)!;
    field.setValue(newValue);

    workspace.getAllBlocks().forEach((block) => {
        block.inputList
            .filter(
                (input) =>
                    input.type === Blockly.inputs.inputTypes.DUMMY &&
                    input.name.startsWith('LIST.'),
            )
            .forEach((input) => {
                const field = input.fieldRow.find(
                    (f) => f.name?.startsWith('VALUE.'),
                )! as Blockly.FieldDropdown;

                const value = field.getValue();
                if (value === id) {
                    field.getOptions(false);
                    field.setValue(id);
                    field.forceRerender();
                }
            });
    });
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
                buffers.expanding(),
            );

            defer.push(() => didWorkspaceChangeChan.close());

            // ... and then fork to function that looks like
            // https://github.com/redux-saga/redux-saga/issues/620#issuecomment-259161095
            yield* fork(
                handleBlocklyWorkspaceDidChange,
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

            yield* takeEvery(
                blocklyDidCreateBlock,
                handleBlocklyDidCreateBlock,
                workspace,
            );

            yield* takeEvery(
                blocklyDidDeleteBlock,
                handleBlocklyDidDeleteBlock,
                workspace,
            );

            yield* takeEvery(blocklyDidChangeVar, handleBlocklyDidChangeVar, workspace);

            console.log('waiting for dispose');
            yield* take(blocklyDidDispose);

            console.error('you should never see this');
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
