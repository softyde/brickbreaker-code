// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import { Order } from 'blockly/python';
import { BlockDefinition } from '../repository';

const block: BlockDefinition = {
    def: {
        type: 'flow-while',
        message0: 'flow.while.message',
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
        message1: 'flow.while.statements',
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
        const condition = generator
            .valueToCode(block, 'condition', Order.ATOMIC)
            .trim();

        const statements = generator.statementToCode(block, 'VAR_STATEMENTS');

        return `while ${condition}:
${statements}`;
    },
};

export default block;
