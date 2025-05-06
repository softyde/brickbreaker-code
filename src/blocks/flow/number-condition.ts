// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

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
        const varA = generator.statementToCode(block, 'var_a').trim();
        const varB = generator.statementToCode(block, 'var_b').trim();

        const condition = block.getFieldValue('var_condition');

        return `(${varA}) ${condition} (${varB})`;
    },
};

export default block;
