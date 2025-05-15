// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import { Order } from 'blockly/python';
import { Severity } from '../../expert/codeIssue';
import i18next from '../../i18next';
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
                check: ['Number', shadowNumber('degree', 0, -5000, 5000, 1)],
            },
        ],
    },
    func: (block, generator) => {
        const motor = block.getFieldValue('VALUE.MOTOR');
        const motorVar = generator.getVariableName(motor);

        const position = generator
            .valueToCode(block, 'VAR_POSITION', Order.ATOMIC)
            .trim();

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

        return `${motorVar}.reset_angle(angle=${position})`;
    },
};

export default block;
