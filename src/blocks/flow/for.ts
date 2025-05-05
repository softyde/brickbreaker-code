// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import { BlockDefinition } from '../repository';
import { shadowNumber } from '../types';

const block: BlockDefinition = {
    def: {
        type: 'flow-for',
        message0: 'flow.for.message',
        style: 'flow_category',
        extensions: ['add_shadow_fields'],
        args0: [
            {
                type: 'field_vertical_separator',
            },
            {
                type: 'input_value',
                name: 'VAR_TIMES',
                check: ['Number', shadowNumber('number', 2, 1, 1000, 1)],
            },
        ],
        message1: 'flow.for.statements',
        args1: [
            {
                type: 'input_statement',
                name: 'VAR_STATEMENTS',
                check: 'default',
            },
        ],
        nextStatement: 'default',
        previousStatement: 'default',
    },
    func: (block, generator) => {
        const times = generator.statementToCode(block, 'VAR_TIMES').trim();

        const statements = generator.statementToCode(block, 'VAR_STATEMENTS');

        return `for _ in range(int(${times})):
${statements}`;
    },
};

export default block;
