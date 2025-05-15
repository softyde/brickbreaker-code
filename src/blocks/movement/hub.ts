// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import { Order } from 'blockly/python';
import { Severity } from '../../expert/codeIssue';
import i18next from '../../i18next';
import { BlockDefinition } from '../repository';
import { shadowNumber } from '../types';

const block: BlockDefinition = {
    def: {
        type: 'move_hub_block',
        message0: 'movement.hub.message',
        inputsInline: true,
        previousStatement: 'init',
        nextStatement: 'init',
        style: 'movement_category$light',
        extensions: ['add_shadow_fields', 'dynamic_var_list'],

        args0: [
            {
                type: 'field_vertical_separator',
            },
            {
                type: 'field_input',
                name: 'VAR.DRIVE',
                text: 'Fahrwerk',
                spellcheck: false,
            },
            {
                type: 'input_value',
                name: 'diameter',
                check: ['Number', shadowNumber('mm', 56, 8, 120, 1)],
            },
            {
                type: 'input_value',
                name: 'axle-track',
                check: ['Number', shadowNumber('mm', 112, 16, 240, 1)],
            },
            {
                type: 'input_dummy',
                name: 'LIST.MOTOR.1',
            },
            {
                type: 'input_dummy',
                name: 'LIST.MOTOR.2',
            },
        ],
    },
    func: (block, generator) => {
        const hub = block.getFieldValue('VAR.DRIVE');
        const hubVar = generator.getVariableName(hub);

        const diameter = generator.valueToCode(block, 'diameter', Order.ATOMIC).trim();
        const axleTrack = generator
            .valueToCode(block, 'axle-track', Order.ATOMIC)
            .trim();

        const motor1 = block.getFieldValue('VALUE.MOTOR.1');
        const motor1Var = generator.getVariableName(motor1);
        const motor2 = block.getFieldValue('VALUE.MOTOR.2');
        const motor2Var = generator.getVariableName(motor2);

        const codeExpert = generator.codeExpert;

        const hubName = block.getField('VAR.DRIVE')?.getText();

        const motor1Name = block.getField('VALUE.MOTOR.1')!.getText();
        const motor2Name = block.getField('VALUE.MOTOR.2')!.getText();

        let isOk = true;

        if (motor1 === 'NONE' || motor2 === 'NONE') {
            isOk = false;
            codeExpert.add(
                Severity.Error,
                i18next.t('expert:error.unassignedMotor', {
                    item: hubName,
                }),
                block,
            );
        } else {
            if (motor1Var === motor2Var) {
                isOk = false;
                codeExpert.add(
                    Severity.Error,
                    i18next.t('expert:error.duplicateMotor', {
                        item: hubName,
                    }),
                    block,
                );
            } else {
                if (!codeExpert.isMotorDefined(motor1Name)) {
                    isOk = false;
                    codeExpert.add(
                        Severity.Error,
                        i18next.t('expert:error.wrongOrderMotor', {
                            item: hubName,
                            motor: motor1Name,
                        }),
                        block,
                    );
                }
                if (!codeExpert.isMotorDefined(motor2Name)) {
                    isOk = false;
                    codeExpert.add(
                        Severity.Error,
                        i18next.t('expert:error.wrongOrderMotor', {
                            item: hubName,
                            motor: motor2Name,
                        }),
                        block,
                    );
                }

                if (codeExpert.haveSameDirection(motor1Name, motor2Name)) {
                    codeExpert.add(
                        Severity.Warning,
                        i18next.t('expert:warning.motorSameDirection', {
                            item: hubName,
                        }),
                        block,
                    );
                }
            }
        }

        if (diameter !== '56' && diameter !== '88') {
            codeExpert.add(
                Severity.Warning,
                i18next.t('expert:warning.uncommonDiameter', {
                    item: hubName,
                }),
                block,
            );
        }

        if (isOk) {
            codeExpert.addHubMotors([motor1Name, motor2Name]);
        }

        return `${hubVar} = DriveBase(${motor1Var}, ${motor2Var}, ${diameter}, ${axleTrack})
${hubVar}.use_gyro(True)
${hubVar}.settings(straight_speed=400, straight_acceleration=200, turn_rate=50, turn_acceleration=200)
${hubVar}.reset()
`;
    },
};

export default block;
