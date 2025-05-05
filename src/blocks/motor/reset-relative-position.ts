// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import { BlockDefinition } from '../repository';
import { shadowNumber } from '../types';

const block: BlockDefinition = {
    def: {
        type: 'reset_relative_position',
        message0: 'motor.reset-relative-position.message',
        previousStatement: 'default',
        nextStatement: 'default',
        style: 'motor_category',
        extensions: ['dynamic_var_list', 'add_shadow_fields'],
        inputsInline: true,

        args0: [
            {
                type: 'field_vertical_separator',
            },
            {
                type: 'input_dummy',
                name: 'LIST.MOTOR',
            },
            {
                type: 'input_value',
                name: 'VAR_POSITION',
                check: ['Number', shadowNumber('degree', 0, -1000, 1000, 1)],
            },
        ],
    },
    func: (block, generator) => {
        const motor = block.getFieldValue('VALUE.MOTOR');
        const motorVar = generator.getVariableName(motor);

        const position = generator.statementToCode(block, 'VAR_POSITION').trim();

        return `${motorVar}.reset_angle(angle=${position})`;
    },
};

export default block;
