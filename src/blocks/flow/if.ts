// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import { BlockDefinition } from '../repository';

const block: BlockDefinition = {
    def: {
        type: 'flow-if',
        message0: 'flow.if.message',
        style: 'flow_category',
        args0: [
            {
                type: 'field_vertical_separator',
            },
            {
                type: 'input_value',
                name: 'condition',
                check: ['Boolean'],
            },
        ],
        message1: 'flow.if.statements',
        args1: [
            {
                type: 'input_statement',
                name: 'VAR_STATEMENTS',
                check: 'default',
            },
        ],
        nextStatement: 'default',
        previousStatement: 'default',
    },
    func: (block, generator) => {
        const condition = generator.statementToCode(block, 'condition').trim();

        const statements = generator.statementToCode(block, 'VAR_STATEMENTS');

        return `if ${condition}:
${statements}`;
    },
};

export default block;
