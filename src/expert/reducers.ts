// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import { Reducer, combineReducers } from 'redux';
import { addIssue, clearAllIssues, showExpert } from './actions';
import { CodeIssue } from './codeIssue';

export interface IIssue {
    label: string;
    blockId: string;
}

/** Indicated that the code editor is shown for blockly sources. */
const foundIssues: Reducer<readonly CodeIssue[]> = (state = [], action) => {
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

/** Indicated that the code editor is shown for blockly sources. */
const isExpertVisibe: Reducer<boolean> = (state = false, action) => {
    if (showExpert.matches(action)) {
        return action.visible;
    }

    return state;
};

export default combineReducers({
    foundIssues,
    isExpertVisibe,
});
