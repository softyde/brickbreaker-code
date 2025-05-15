// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import * as Blockly from 'blockly/core';
import { Task } from 'redux-saga';

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
import { addIssue, clearAllIssues, showExpert } from '../../expert/actions';
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
    editorCloseFile,
    editorDidFailToOpenFile,
    editorReplaceFile,
    editorReplaceSourceMap,
} from '../actions';
import { OpenFileManager, SourceMapType } from '../lib';
import {
    blocklyDidChangeModel,
    blocklyDidChangeVar,
    blocklyDidCreate,
    blocklyDidCreateBlock,
    blocklyDidDeleteBlock,
    blocklyDidDispose,
    blocklyDidLoadSource,
    blocklyGenerateSource,
} from './actions';
import pythonGenerator from './codegenerator';
import { VAR_ENTRY_NONE } from './variables';

// function* handleBlocklyWorkspaceDidChange(
//     chan: EventChannel<Blockly.Events.Abstract>,
//     workspace: Blockly.Workspace,
// ): Generator {
//     console.debug('handleWorkspaceDidChange');

//     for (;;) {
//         const event = yield* take(chan);

//         if (event.isUiEvent) {
//             if (event.type === Blockly.Events.SELECTED) {
//                 const selected = event as Blockly.Events.Selected;

//                 let styleName: string | undefined;

//                 if (selected.newElementId) {
//                     const block = workspace.getBlockById(selected.newElementId);

//                     styleName = block?.getStyleName();
//                 }

//                 yield* put(editorHighlightBlockCode(selected.newElementId, styleName));
//             }

//             // ignoring other ui events by now
//             continue;
//         }

//         if (event.type === Blockly.Events.BLOCK_DELETE) {
//             console.log('*** DELETED');

//             const deleted = event as Blockly.Events.BlockDelete;

//             if (!deleted.ids) {
//                 throw 'empty id list';
//             }

//             for (let i = 0; i < deleted.ids.length; i++) {
//                 yield* put(blocklyDidDeleteBlock(deleted.ids[i]));
//             }
//         }

//         if (event.type === Blockly.Events.BLOCK_CREATE) {
//             console.log('*** CREATED');

//             const created = event as Blockly.Events.BlockCreate;

//             if (!created.ids) {
//                 throw 'empty id list';
//             }

//             for (let i = 0; i < created.ids.length; i++) {
//                 yield* put(blocklyDidCreateBlock(created.ids[i]));
//             }
//         }

//         if (event.type === Blockly.Events.BLOCK_CHANGE) {
//             console.log('*** CHANGED');

//             const changed = event as Blockly.Events.BlockChange;

//             if (changed.element === 'field' && changed.name?.startsWith('VAR.')) {
//                 console.log(changed);
//                 yield* put(
//                     blocklyDidChangeVar(
//                         changed.blockId!,
//                         changed.name,
//                         changed.oldValue as string,
//                         changed.newValue as string,
//                     ),
//                 );
//             }

//             console.log(changed);
//         }

//         yield* put(editorHighlightBlockCode());

//         const state = Blockly.serialization.workspaces.save(workspace);

//         const value = JSON.stringify(state);

//         yield* put(blocklyDidChangeModel(value));
//     }
// }

function* handleBlocklyDidChangeModel(
    uuid: UUID,
    action: ReturnType<typeof blocklyDidChangeModel>,
): Generator {
    //   console.debug('handleBlocklyDidChangeModel');

    const data = action.value;

    //console.debug(data);

    // when the model changes, save it to storage.
    yield* put(fileStorageStoreBlocklyValue(uuid, data));
    yield* put(blocklyGenerateSource(uuid));

    // throttle the writes so we don't do it too often while user is editing quickly
    //    yield* delay(ms);
    // failures are ignored
}

function wrapInMainFunction(code: string): string {
    // Jede Zeile einrücken
    const indentedCode = code
        .split('\n')
        .map((line) => '  ' + line)
        .join('\n');

    return `async def main():\n${indentedCode}\n\nrun_task(main())`;
}

function* handleBlocklyGenerateSource(
    workspace: Blockly.Workspace,
    action: ReturnType<typeof blocklyGenerateSource>,
): Generator {
    //console.debug('=== generate source');

    try {
        const setupBlocks = workspace.getBlocksByType('setup_program');

        const functionBlocks = [
            ...workspace.getBlocksByType('procedures_defnoreturn'),
            ...workspace.getBlocksByType('procedures_defreturn'),
        ];

        const startBlocks = workspace.getBlocksByType('start_program');

        const blocks = [...setupBlocks, ...functionBlocks];

        pythonGenerator.init(workspace);

        yield* put(clearAllIssues());

        let source = '';
        blocks.forEach((block) => {
            source += pythonGenerator.blockToCode(block);
        });

        startBlocks.forEach((block) => {
            source += wrapInMainFunction(pythonGenerator.blockToCode(block) as string);
        });

        for (let i = 0; i < pythonGenerator.codeExpert._codeIssues.length; i++) {
            const issue = pythonGenerator.codeExpert._codeIssues[i];

            yield* put(addIssue(issue.severity, issue.label, issue.blockId));
        }

        if (source.length > 0) {
            source = `from pybricks.hubs import PrimeHub
from pybricks.pupdevices import Motor, ColorSensor, UltrasonicSensor, ForceSensor
from pybricks.parameters import Button, Color, Direction, Port, Side, Stop, Axis
from pybricks.robotics import DriveBase
from pybricks.tools import wait, StopWatch, multitask, run_task

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

let activeUuid: string | null = null;

function* handleEditorActivateFile(
    workspace: Blockly.Workspace,
    _openFiles: OpenFileManager,
    action: ReturnType<typeof editorActivateFile>,
): Generator {
    try {
        if (action.uuid === activeUuid) {
            console.debug(`Ignore redundant file activation for ${activeUuid}`);
            return;
        }

        activeUuid = action.uuid;

        console.debug('blockly activate file', action.uuid);

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

        if (didLoad.data === null) {
            console.debug('Loaded blockly data is not set');
            yield* put(showExpert(false));

            return;
        }

        yield* put(showExpert(true));

        yield* put(blocklyDidLoadSource(didLoad.data));

        if (didLoad.data !== null) {
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
    } catch (err) {
        // FIXME das ist der falsche Typ!!!
        yield* put(editorDidFailToOpenFile(action.uuid, ensureError(err)));
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

    //   console.debug(`created ${action.blockId} = ${block.type}, ${block.isShadow()}`);

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

                    console.log(`created variable ${varType}:${id}:${value}`);

                    const variables = workspace.getVariablesOfType(varType);

                    const x = workspace.getAllVariables();
                    console.log(
                        `called for variable ${varType} ${variables
                            .map((v) => v.getId())
                            .join(',')}`,
                    );
                    console.log(
                        `called for all variable ${varType} ${x
                            .map((v) => v.getId())
                            .join(',')}`,
                    );

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
                                    console.log('VARIABLE ANPASSEN');
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
    action: ReturnType<typeof blocklyDidDeleteBlock>,
) {
    const deletedVarIds: string[] = [];

    const variables = workspace.getAllVariables();

    variables.forEach((variable) => {
        const id = variable.getId();
        //console.log(`${id} = ${variable.name} / ${variable.type}`);

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

function* handleDidCreateBlockly(
    action: ReturnType<typeof blocklyDidCreate>,
): Generator {
    console.debug('Blockly saga created');

    const workspace = action.workspace;

    const isFileStorageInitialized = yield* select(
        (s: RootState) => s.fileStorage.isInitialized,
    );

    if (!isFileStorageInitialized) {
        console.debug('Waiting for FileStorage...');
        yield* take(fileStorageDidInitialize);
    }

    console.debug('FileStorage is ready');

    // eslint-disable-next-line no-useless-catch
    try {
        const defer: Array<() => void | Promise<void>> = [];

        try {
            yield* takeEvery(
                blocklyGenerateSource,
                handleBlocklyGenerateSource,
                workspace,
            );

            // const didWorkspaceChangeChan = eventChannel<Blockly.Events.Abstract>(
            //     (emit) => {
            //         workspace.addChangeListener(emit);
            //         return () => workspace.removeChangeListener(emit);
            //     },
            //     buffers.expanding(),
            // );

            // defer.push(() => didWorkspaceChangeChan.close());

            // // ... and then fork to function that looks like
            // // https://github.com/redux-saga/redux-saga/issues/620#issuecomment-259161095
            // yield* fork(
            //     handleBlocklyWorkspaceDidChange,
            //     didWorkspaceChangeChan,
            //     workspace,
            // );

            const openFiles = new OpenFileManager();

            yield* takeEvery(
                editorActivateFile,
                handleEditorActivateFile,
                workspace,
                openFiles,
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

function* handleCloseFile(_action: ReturnType<typeof editorCloseFile>): Generator {
    yield* put(showExpert(false));
}

function* monitorBlockly(): Generator {
    // const ch = eventChannel<Blockly.Workspace>((emit) => {
    //     const subscription = notify.onDidCreateBlocklyEditor(emit);
    //     return () => subscription.dispose();
    // });

    yield* takeEvery(blocklyDidCreate, handleDidCreateBlockly);
    yield* takeEvery(editorCloseFile, handleCloseFile);

    yield* take('__never__');

    console.warn('You should never see this');
}

export default function* (): Generator {
    yield* fork(monitorBlockly);
}
