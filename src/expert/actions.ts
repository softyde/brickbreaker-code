// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import { createAction } from '../actions';
import { Severity } from './codeIssue';

/** Action that indicates that a code editor was created. */
export const clearAllIssues = createAction(() => ({
    type: 'expert.action.clearAllIssues',
}));

/** Action that indicates that a code editor was created. */
export const addIssue = createAction(
    (severity: Severity, label: string, blockId: string) => ({
        type: 'expert.action.addIssue',
        severity,
        label,
        blockId,
    }),
);
