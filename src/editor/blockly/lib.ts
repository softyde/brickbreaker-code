// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import * as Blockly from 'blockly/core';

type BlocklyWorkspaceListener = (workspace: Blockly.Workspace) => void;

const listeners = {
    didCreate: [] as BlocklyWorkspaceListener[],
};

export interface IDisposable {
    dispose(): void;
}

export function onDidCreateBlocklyEditor(
    listener: (workspace: Blockly.Workspace) => void,
): IDisposable {
    listeners.didCreate.push(listener);

    return {
        dispose: () => {
            const index = listeners.didCreate.indexOf(listener);
            if (index !== -1) {
                listeners.didCreate.splice(index, 1);
            } else {
                throw new Error('disposable not found');
            }
        },
    };
}

export function didCreateBlocklyEditor(workspace: Blockly.Workspace) {
    listeners.didCreate.forEach((listener) => listener(workspace));
}
