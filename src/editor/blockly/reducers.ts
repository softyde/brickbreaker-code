// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import { Reducer, combineReducers } from 'redux';
import {
    blocklyDidLoadSource,
    blocklyHighlightBlock,
    blocklyRemoveHighlightFromBlock,
} from './actions';

/** Indicates that the code editor is ready for use. */
const highlightedBlock: Reducer<string | null> = (state = null, action) => {
    // if (editorDidCreate.matches(action)) {
    //     return true;
    // }

    if (blocklyHighlightBlock.matches(action)) {
        return action.id;
    }

    if (blocklyRemoveHighlightFromBlock.matches(action)) {
        return null;
    }

    return state;
};

const sourceCode: Reducer<string | null> = (state = null, action) => {
    if (blocklyDidLoadSource.matches(action)) {
        return action.value;
    }

    return state;
};

export default combineReducers({
    highlightedBlock,
    sourceCode,
});
