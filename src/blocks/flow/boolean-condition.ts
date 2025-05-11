// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import { Order } from 'blockly/python';
import { BlockDefinition } from '../repository';

const block: BlockDefinition = {
    def: {
        type: 'boolean_condition',
        message0: 'flow.boolean-condition.message',
        style: 'flow_value_category',
        inputsInline: true,
        //extensions: ['add_shadow_fields'],
        args0: [
            {
                type: 'input_value',
                name: 'var_a',
                check: ['Boolean'],
            },
            {
                type: 'field_dropdown',
                name: 'var_condition',
                options: [
                    ['und', 'and'],
                    ['oder', 'or'],
                ],
            },
            {
                type: 'input_value',
                name: 'var_b',
                check: ['Boolean'],
            },
        ],
        output: 'Boolean',
    },
    func: (block, generator) => {
        const varA = generator.valueToCode(block, 'var_a', Order.ATOMIC).trim();
        const varB = generator.valueToCode(block, 'var_b', Order.ATOMIC).trim();

        const condition = block.getFieldValue('var_condition');

        return [
            `(${varA}) ${condition} (${varB})`,
            condition === 'and' ? Order.LOGICAL_AND : Order.LOGICAL_OR,
        ];
    },
};

export default block;
