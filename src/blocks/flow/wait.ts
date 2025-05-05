// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import { BlockDefinition } from '../repository';
import { shadowNumber } from '../types';

const block: BlockDefinition = {
    def: {
        type: 'flow_wait',
        message0: 'flow.wait.message',
        previousStatement: 'default',
        nextStatement: 'default',
        style: 'flow_category',
        extensions: ['add_shadow_fields'],

        args0: [
            {
                type: 'field_vertical_separator',
            },
            {
                type: 'input_value',
                name: 'VAR_TIME',
                check: ['Number', shadowNumber('sec', 1, 0.01, 60, 0.01)],
            },
        ],
    },
    func: (block, generator) => {
        const time =
            parseFloat(generator.statementToCode(block, 'VAR_TIME').trim()) * 1000;

        return `wait(${time})`;
    },
};

export default block;
