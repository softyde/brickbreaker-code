// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import { Order } from 'blockly/python';
import { BlockDefinition } from '../repository';
import { shadowNumber, straightDirections } from '../types';

const block: BlockDefinition = {
    def: {
        type: 'contest_move_and_lift',
        message0: 'contest.move-and-lift.message',
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
                name: 'LIST.DRIVE',
            },
            {
                type: 'input_value',
                name: 'VAR_DISTANCE',
                check: ['Number', shadowNumber('cm', 10, 0.1, 200, 0.1)],
            },
            {
                type: 'field_dropdown',
                name: 'VAR_DIRECTION',
                options: straightDirections(),
            },
            {
                type: 'input_value',
                name: 'VAR_SPEED',
                check: ['Number', 'Speed', shadowNumber('speed', 100, 1, 500, 1)],
            },
        ],
        message1: 'contest.move-and-lift.message1',
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
