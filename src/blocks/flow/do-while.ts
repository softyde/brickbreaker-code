// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import { Order } from 'blockly/python';
import { BlockDefinition } from '../repository';

const block: BlockDefinition = {
    def: {
        type: 'flow-do-while',
        message0: 'flow.do-while.message',
        style: 'flow_category',
        args0: [
            {
                type: 'field_vertical_separator',
            },
        ],
        message1: 'flow.do-while.statements',
        args1: [
            {
                type: 'input_statement',
                name: 'VAR_STATEMENTS',
                check: 'default',
            },
        ],
        message2: 'flow.do-while.while',
        args2: [
            {
                type: 'input_value',
                name: 'condition',
                check: ['Boolean'],
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

        return `while True:
${statements}
  if not (${condition}):
    break`;
    },
};

export default block;
