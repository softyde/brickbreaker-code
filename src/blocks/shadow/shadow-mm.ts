// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import { Order } from 'blockly/python';
import { BlockDefinition } from '../repository';

const block: BlockDefinition = {
    def: {
        type: 'shadow_mm',
        message0: 'shadow.mm.message',
        style: 'shadow_blocks',
        args0: [
            {
                type: 'shadow-number-type',
                name: 'NUMBER',
                value: 1,
                min: -1000,
                max: 1000,
                precision: 1,
            },
        ],
        output: 'Number',
    },

    func: (block, _generator) => {
        const value = block.getFieldValue('NUMBER');

        return [`${value}`, Order.ATOMIC];
    },
};

export default block;
