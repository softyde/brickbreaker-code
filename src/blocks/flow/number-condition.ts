// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import { Order } from 'blockly/python';
import { BlockDefinition } from '../repository';
import { shadowNumber } from '../types';

const block: BlockDefinition = {
    def: {
        type: 'number_condition',
        message0: 'flow.number-condition.message',
        style: 'flow_value_category',
        inputsInline: true,
        extensions: ['add_shadow_fields'],
        args0: [
            {
                type: 'input_value',
                name: 'var_a',
                check: ['Number', shadowNumber('number', 1, -10000, 10000, 0.1)],
            },
            {
                type: 'field_dropdown',
                name: 'var_condition',
                options: [
                    ['<', '<'],
                    ['≤', '<='],
                    ['=', '=='],
                    ['≠', '!='],
                    ['≥', '>='],
                    ['>', '>'],
                ],
            },
            {
                type: 'input_value',
                name: 'var_b',
                check: ['Number', shadowNumber('number', 2, -10000, 10000, 0.1)],
            },
        ],
        output: 'Boolean',
    },
    func: (block, generator) => {
        const varA = generator.valueToCode(block, 'var_a', Order.ATOMIC).trim();
        const varB = generator.valueToCode(block, 'var_b', Order.ATOMIC).trim();

        const condition = block.getFieldValue('var_condition');

        return [`(${varA}) ${condition} (${varB})`, Order.RELATIONAL];
    },
};

export default block;
