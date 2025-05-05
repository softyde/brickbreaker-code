// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import { BlockDefinition } from '../repository';
import { shadowNumber } from '../types';

const block: BlockDefinition = {
    def: {
        type: 'move_hub_block',
        message0: 'movement.hub.message',
        inputsInline: true,
        previousStatement: 'init',
        nextStatement: 'init',
        style: 'movement_category',
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

        const diameter = generator.statementToCode(block, 'diameter').trim();
        const axleTrack = generator.statementToCode(block, 'axle-track').trim();

        const motor1 = block.getFieldValue('VALUE.MOTOR.1');
        const motor1Var = generator.getVariableName(motor1);
        const motor2 = block.getFieldValue('VALUE.MOTOR.2');
        const motor2Var = generator.getVariableName(motor2);

        return `${hubVar} = DriveBase(${motor1Var}, ${motor2Var}, ${diameter}, ${axleTrack})
${hubVar}.use_gyro(True)
${hubVar}.settings(straight_speed=200, straight_acceleration=100, turn_rate=30, turn_acceleration=100)
`;
    },
};

export default block;
