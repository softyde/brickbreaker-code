// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import { Order } from 'blockly/python';
import { BlockDefinition } from '../repository';

const block: BlockDefinition = {
    def: {
        type: 'not_condition',
        message0: 'flow.not-condition.message',
        style: 'flow_value_category',
        inputsInline: true,
        //extensions: ['add_shadow_fields'],
        args0: [
            {
                type: 'input_value',
                name: 'var_a',
                check: ['Boolean'],
            },
        ],
        output: 'Boolean',
    },
    func: (block, generator) => {
        const varA = generator.valueToCode(block, 'var_a', Order.ATOMIC).trim();

        return [`not (${varA})`, Order.LOGICAL_NOT];
    },
};

export default block;
