// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import { Order } from 'blockly/python';
import { BlockDefinition } from '../repository';

const block: BlockDefinition = {
    def: {
        type: 'flow-wait-until',
        message0: 'flow.wait-until.message',
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
        nextStatement: 'default',
        previousStatement: 'default',
    },
    func: (block, generator) => {
        const condition = generator
            .valueToCode(block, 'condition', Order.ATOMIC)
            .trim();

        return `while not (${condition}):
  wait(5)`;
    },
};

export default block;
