// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import * as Blockly from 'blockly';
import { createAction } from '../../actions';
import { UUID } from '../../fileStorage';

export const blocklyDidCreate = createAction((workspace: Blockly.Workspace) => ({
    type: 'blockly.action.didCreate',
    workspace,
}));

/** Action that indicates that a blockly editor was disposed. */
export const blocklyDidDispose = createAction(() => ({
    type: 'blockly.action.didDispose',
}));

export const blocklyDidChangeModel = createAction((value: string) => ({
    type: 'blockly.action.didChangeModel',
    value,
}));

export const blocklyDidLoadSource = createAction((value: string | null) => ({
    type: 'blockly.action.didLoadSource',
    value,
}));

export const blocklyDidChangeSourceCode = createAction(
    (uuid: UUID, value: string | null) => ({
        type: 'blockly.action.didChangeSourceCode',
        uuid,
        value,
    }),
);

export const blocklyGenerateSource = createAction((uuid: UUID) => ({
    type: 'blockly.action.generateSource',
    uuid,
}));

export const blocklyHighlightBlock = createAction((id: string) => ({
    type: 'blockly.action.highlightBlock',
    id,
}));

export const blocklyRemoveHighlightFromBlock = createAction(() => ({
    type: 'blockly.action.removeHighlightFromBlock',
}));

export const blocklyDidCreateBlock = createAction((blockId: string) => ({
    type: 'blockly.action.didCreateBlock',
    blockId,
}));

export const blocklyDidDeleteBlock = createAction((blockId: string) => ({
    type: 'blockly.action.didDeleteBlock',
    blockId,
}));

export const blocklyDidChangeVar = createAction(
    (blockId: string, name: string, oldValue: string, newValue: string) => ({
        type: 'blockly.action.didChangeVar',
        blockId,
        name,
        oldValue,
        newValue,
    }),
);
