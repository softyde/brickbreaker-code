// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

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
                    ['xor', '^'],
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
        const varA = generator.statementToCode(block, 'var_a').trim();
        const varB = generator.statementToCode(block, 'var_b').trim();

        const condition = block.getFieldValue('var_condition');

        return `(${varA}) ${condition} (${varB})`;
    },
};

export default block;
