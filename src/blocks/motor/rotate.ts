// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import { BlockDefinition } from '../repository';
import { Direction, defaultDirections, shadowNumber } from '../types';

const block: BlockDefinition = {
    def: {
        type: 'motor_move_rotate',
        message0: 'motor.rotate.message',
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
                type: 'field_dropdown',
                name: 'direction',
                options: defaultDirections(),
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

        let speed = generator.statementToCode(block, 'VAR_SPEED').trim();

        const direction = block.getFieldValue('direction');

        if (direction === Direction.Counterclockwise) {
            speed = `-${speed}`;
        }

        return `${motorVar}.run(speed=${speed})`;
    },
};

export default block;
