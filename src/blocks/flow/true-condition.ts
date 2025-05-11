// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import { Order } from 'blockly/python';
import { BlockDefinition } from '../repository';

const block: BlockDefinition = {
    def: {
        type: 'true_condition',
        message0: 'flow.true-condition.message',
        style: 'flow_value_category',
        inputsInline: true,
        //extensions: ['add_shadow_fields'],

        output: 'Boolean',
    },
    func: (_block, _generator) => {
        return [`True`, Order.ATOMIC];
    },
};

export default block;
