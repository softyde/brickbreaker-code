// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import { Order } from 'blockly/python';
import { BlockDefinition } from '../repository';
import { shadowNumber } from '../types';

const block: BlockDefinition = {
    def: {
        type: 'move_to_position',
        message0: 'motor.move-to-position.message',
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
            {
                type: 'input_value',
                name: 'VAR_SPEED',
                check: [
                    'Number',
                    'Speed',
                    shadowNumber('rotation-speed', 100, 1, 500, 1),
                ],
            },
        ],
    },
    func: (block, generator) => {
        const motor = block.getFieldValue('VALUE.MOTOR');
        const motorVar = generator.getVariableName(motor);

        const position = generator
            .valueToCode(block, 'VAR_POSITION', Order.ATOMIC)
            .trim();
        const speed = generator.valueToCode(block, 'VAR_SPEED', Order.ATOMIC).trim();

        return `await ${motorVar}.run_target(speed=${speed}, target_angle=${position}, then=Stop.HOLD)`;
    },
};

export default block;
