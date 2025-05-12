// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import { Reducer, combineReducers } from 'redux';
import { addIssue, clearAllIssues } from './actions';
import { CodeIssue } from './codeIssue';

export interface IIssue {
    label: string;
    blockId: string;
}

/** Indicated that the code editor is shown for blockly sources. */
const foundIssues: Reducer<readonly CodeIssue[]> = (state = [], action) => {
    /*if (editorToggleSource.matches(action)) {
        console.log('triggered by editorToggleSource');
        return !state;
    }*/

    if (clearAllIssues.matches(action)) {
        return [];
    }

    if (addIssue.matches(action)) {
        return [
            ...state,
            { severity: action.severity, label: action.label, blockId: action.blockId },
        ];
    }

    return state;
};

export default combineReducers({
    foundIssues,
});
