// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

export enum Severity {
    Info = 'info',
    Warning = 'warning',
    Error = 'error',
}

export interface CodeIssue {
    severity: Severity;
    label: string;
    blockId: string;
}
