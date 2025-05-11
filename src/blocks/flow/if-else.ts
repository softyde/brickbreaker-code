// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import { Order } from 'blockly/python';
import { BlockDefinition } from '../repository';

const block: BlockDefinition = {
    def: {
        type: 'flow-if-else',
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
                name: 'VAR_IF_STATEMENTS',
                check: 'default',
            },
        ],
        message2: 'flow.if.else',
        message3: 'flow.if.statements',
        args3: [
            {
                type: 'input_statement',
                name: 'VAR_ELSE_STATEMENTS',
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

        const ifStatements = generator.statementToCode(block, 'VAR_IF_STATEMENTS');
        const elseStatements = generator.statementToCode(block, 'VAR_ELSE_STATEMENTS');

        return `if ${condition}:
${ifStatements}else
${elseStatements}`;
    },
};

export default block;
