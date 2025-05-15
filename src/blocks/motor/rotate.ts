// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import { Order } from 'blockly/python';
import { Severity } from '../../expert/codeIssue';
import i18next from '../../i18next';
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
                    shadowNumber('rotation-speed', 100, 1, 2000, 1),
                ],
            },
        ],
    },
    func: (block, generator) => {
        const motor = block.getFieldValue('VALUE.MOTOR');
        const motorVar = generator.getVariableName(motor);

        let speed = generator.valueToCode(block, 'VAR_SPEED', Order.ATOMIC).trim();

        const direction = block.getFieldValue('direction');

        if (direction === Direction.Counterclockwise) {
            speed = `-${speed}`;
        }

        const codeExpert = generator.codeExpert;
        const motorName = block.getField('VALUE.MOTOR')!.getText();

        if (codeExpert.isHubMotor(motorName)) {
            codeExpert.add(
                Severity.Warning,
                i18next.t('expert:warning.assignedHubMotor', {
                    motor: motorName,
                }),
                block,
            );
        }

        return `${motorVar}.run(speed=${speed})`;
    },
};

export default block;
