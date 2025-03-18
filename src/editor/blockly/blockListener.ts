// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import * as Blockly from 'blockly';

export enum EventType {
    CREATE,
    DELETE,
}

let nextId = 1;

export type EventListener = (id: string, type: EventType) => void;

const _listeners = new Map<number, [string, EventListener]>();

export const addLifecycleListener = (id: string, listener: EventListener): number => {
    const listenerId = nextId++;

    _listeners.set(listenerId, [id, listener]);
    console.debug(`adding new listener for block ${id} with id ${listenerId}`);

    return listenerId;
};

export const removeLifecycleListener = (id: number): void => {
    if (_listeners.has(id)) {
        _listeners.delete(id);
        console.debug(`removed listener with id ${id}`);
    } else {
        console.warn(`no listener found for id ${id}`);
    }
};

const changeListener = (event: Blockly.Events.Abstract): void => {
    let blockEvent: Blockly.Events.BlockDelete | Blockly.Events.BlockCreate | undefined;

    if (event.type === Blockly.Events.BLOCK_CREATE) {
        blockEvent = event as Blockly.Events.BlockCreate;
    } else if (event.type === Blockly.Events.BLOCK_DELETE) {
        blockEvent = event as Blockly.Events.BlockDelete;
    }

    if (blockEvent) {
        if (!blockEvent.ids) {
            console.warn('block event without ids occured');
            return;
        }

        blockEvent.ids.forEach((id) => {
            _listeners.forEach((listenerRef, key, object) => {
                const [listenerId, listener] = listenerRef;

                if (listenerId === id) {
                    if (listener) {
                        console.debug(`block event ${event.type} for ${id}`);
                        listener(
                            id,
                            event.type === Blockly.Events.BLOCK_CREATE
                                ? EventType.CREATE
                                : EventType.DELETE,
                        );
                    }
                }

                if (event.type === Blockly.Events.BLOCK_DELETE) {
                    object.delete(key);
                }
            });
        });
    }
};

// Funktion um die Dropdown-Menüs zu aktualisieren
// function refreshVariableDropdowns(_workspace: Blockly.Workspace) {
//     /* const blocks = workspace.getAllBlocks(false);
//     blocks.forEach(block => {
//       if (block.type === 'use_variable') {
//         const field = block.getField('VAR_SELECT');
//         if (field) {
//           const currentValue = field.getValue();
//           const variables = getVariableStore(workspace);

//           // Prüfe, ob der aktuelle Wert noch existiert
//           if (!variables.includes(currentValue) && currentValue !== 'NO_VAR') {
//             // Setze auf den ersten verfügbaren Wert oder 'NO_VAR'
//             if (variables.length > 0) {
//               field.setValue(variables[0]);
//             } else {
//               field.setValue('NO_VAR');
//             }
//           }

//           // Erzwinge eine Aktualisierung des Dropdowns
//           field.forceRerender();
//         }
//       }
//     });*/
// }

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

// function getVariableId(name: string, blockId: string) {
//     return `${name}.${blockId}`;
// }

// // Funktion, um Variablen im Workspace zu speichern und zu verwalten
// function updateVariableStore(
//     workspace: Blockly.Workspace,
//     varId: string,
//     varType: string,
//     add: boolean,
// ) {
//     if (add) {
//         // Füge Variable hinzu, wenn sie noch nicht existiert
//         // if (!workspace.variableStore.includes(varName)) {
//         //     workspace.variableStore.push(varName);
//         // }
//     } else {
//         // Entferne Variable
//         console.debug('delete by id');
//         workspace.deleteVariableById(varId);

//         // Aktualisiere alle Dropdown-Menüs
//         refreshVariableDropdowns(workspace);
//     }
// }

// function deleteVariables(workspace: Blockly.Workspace, blockId: string) {
//     const variables = workspace.getAllVariables();

//     variables
//         .filter(
//             (v) => v.getId().startsWith('VAR.') && v.getId().endsWith(`.${blockId}`),
//         )
//         .forEach((v) => {
//             console.debug(`>>> delete variable ${v.name} == ${v.getId()}`);
//             workspace.deleteVariableById(v.getId());
//         });
// }

// function createVariable(
//     workspace: Blockly.Workspace,
//     varType: string,
//     varId: string,
//     value: string,
// ) {
//     console.debug(`>>> create variable ${value} == ${varId}, type=${varType}`);
//     workspace.createVariable(value, varType, varId);
// }

// const findVariableName = (
//     workspace: Blockly.Workspace,
//     variableName: string,
//     varId: string,
//     type: string,
// ): string => {
//     // eslint-disable-next-line no-constant-condition
//     while (true) {
//         const variable = workspace.getVariable(variableName, type);

//         if (!variable || variable.getId() === varId) {
//             return variableName;
//         }

//         const index = variableName.search(/(\d)+$/);
//         if (index < 0) {
//             variableName += ' 1';
//         } else {
//             let num = parseInt(variableName.substring(index), 10);

//             num += 1;

//             variableName = variableName.substring(0, index) + num;
//         }
//     }
// };

function xxx(this: Blockly.Block) {
    console.debug(`extension for block ${this.id}`);

    this.inputList
        .filter((i) => i.type === Blockly.inputs.inputTypes.DUMMY)
        .forEach((i) => {
            i.fieldRow
                .filter((b) => b.name && b.name.startsWith('VAR.'))
                .forEach((input) => {
                    const varType = getVariableType(input.name!);
                    //const _value = this.getFieldValue(input.name!);
                    //const _id = `${input.name}.${this.id}`;
                    //createVariable(workspace, varType, id, value);

                    input.setValidator((_value: string) => {
                        console.log('validator called for ' + varType);
                    });
                });
        });

    // this.setOnChange((changeEvent) => {
    //     //  console.log(`--> ${changeEvent.type} (received via ${this.id})`);

    //     const workspace = this.workspace;

    //     if (changeEvent.type === Blockly.Events.FINISHED_LOADING) {
    //         const createEvent = changeEvent as Blockly.Events.BlockCreate;

    //         console.log(`creating ${createEvent.blockId} vs ${createEvent.ids}`);

    //         if (createEvent.blockId === this.id) {
    //             const b = workspace.getBlockById(this.id);

    //             console.log(`isInFlyout=${b?.isInFlyout}`);

    //             if (!b?.isInFlyout) {
    //                 console.log(
    //                     `create event for ${createEvent.blockId} <-> ${this.id}`,
    //                 );

    //                 this.inputList
    //                     .filter((i) => i.type === Blockly.inputs.inputTypes.DUMMY)
    //                     .forEach((i) => {
    //                         i.fieldRow
    //                             .filter((b) => b.name && b.name.startsWith('VAR.'))
    //                             .forEach((input) => {
    //                                 const varType = getVariableType(input.name!);
    //                                 let value = this.getFieldValue(input.name!);
    //                                 const id = `${input.name}.${this.id}`;

    //                                 const newValue = findVariableName(
    //                                     workspace,
    //                                     value,
    //                                     id,
    //                                     varType,
    //                                 );

    //                                 if (newValue !== value) {
    //                                     console.log(
    //                                         `replace value ${value} -> ${newValue}`,
    //                                     );
    //                                     value = newValue;
    //                                     input.setValue(value, true);
    //                                 }

    //                                 createVariable(workspace, varType, id, value);
    //                             });
    //                     });
    //             }
    //         }
    //     }

    //     if (changeEvent.type === Blockly.Events.BLOCK_CHANGE) {
    //         const ev = changeEvent as Blockly.Events.BlockChange;

    //         if (ev.element === 'field' && ev.blockId === this.id) {
    //             console.log(`field changed ${ev.name}`);
    //         }
    //     }

    //     /*if (
    //         changeEvent.type === Blockly.Events.BLOCK_CREATE ||
    //         (changeEvent.type === Blockly.Events.BLOCK_CHANGE &&
    //             changeEvent.element === 'field' &&
    //             changeEvent.name === 'VAR_NAME')
    //     ) {
    //         const workspace = this.workspace;
    //         const varName = this.getFieldValue('VAR_NAME');
    //         updateVariableStore(workspace, varName, true);
    //     }

    //     if (
    //         changeEvent.type === Blockly.Events.BLOCK_DELETE &&
    //         changeEvent.blockId === this.id
    //     ) {
    //         const workspace = this.workspace;
    //         const varName = this.getFieldValue('VAR_NAME');
    //         updateVariableStore(workspace, varName, false);
    //     }*/

    //     // Wenn Block gelöscht wird, entferne Variable aus der Liste
    //     if (changeEvent.type === Blockly.Events.BLOCK_DELETE) {
    //         const deleteEvent = changeEvent as Blockly.Events.BlockDelete;

    //         console.debug(`DELETE ${deleteEvent.ids}`);

    //         deleteEvent.ids!.forEach((id) => {
    //             deleteVariables(workspace, id);
    //         });
    //     }
    // });
}

export const init = (workspace: Blockly.Workspace) => {
    workspace.addChangeListener(changeListener);

    Blockly.Extensions.register('xxx', xxx);
};
