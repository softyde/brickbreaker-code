// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import { Order } from 'blockly/python';
import { Severity } from '../../expert/codeIssue';
import i18next from '../../i18next';
import { BlockDefinition } from '../repository';
import { StraightDirection, shadowNumber, straightDirections } from '../types';

const block: BlockDefinition = {
    def: {
        type: 'contest_move_and_lift',
        message0: 'contest.move-and-lift.message',
        previousStatement: 'default',
        nextStatement: 'default',
        style: 'movement_category$light',
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
        ],
        message1: 'contest.move-and-lift.message1',
        message2: 'contest.move-and-lift.message2',
        args2: [
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
                name: 'VAR_MOTOR_SPEED',
                check: [
                    'Number',
                    'Speed',
                    shadowNumber('rotation-speed', 100, 1, 500, 1),
                ],
            },
        ],
    },
    func: (block, generator) => {
        const drive = block.getFieldValue('VALUE.DRIVE');
        const driveVar = generator.getVariableName(drive);

        let distance =
            generator.valueToCode(block, 'VAR_DISTANCE', Order.ATOMIC).trim() + ' * 10';
        const direction = block.getFieldValue('VAR_DIRECTION');

        if (direction === StraightDirection.Backward) {
            distance = `-${distance}`;
        }

        const motor = block.getFieldValue('VALUE.MOTOR');
        const motorVar = generator.getVariableName(motor);

        const position = generator
            .valueToCode(block, 'VAR_POSITION', Order.ATOMIC)
            .trim();
        const motorSpeed = generator
            .valueToCode(block, 'VAR_MOTOR_SPEED', Order.ATOMIC)
            .trim();

        const motorName = block.getField('VALUE.MOTOR')!.getText();
        const codeExpert = generator.codeExpert;

        if (codeExpert.isHubMotor(motorName)) {
            codeExpert.add(
                Severity.Warning,
                i18next.t('expert:warning.assignedHubMotor', {
                    motor: motorName,
                }),
                block,
            );
        }

        return `await multitask(${driveVar}.straight(${distance}, then=Stop.HOLD), ${motorVar}.run_target(speed=${motorSpeed}, target_angle=${position}, then=Stop.HOLD))`;
    },
};

export default block;
