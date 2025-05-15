// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import { Order } from 'blockly/python';
import { BlockDefinition } from '../repository';
import { StraightDirection, shadowNumber, straightDirections } from '../types';

const block: BlockDefinition = {
    def: {
        type: 'move_to_line',
        message0: 'contest.move-to-line.message',
        previousStatement: 'default',
        nextStatement: 'default',
        style: 'movement_category',
        inputsInline: true,
        extensions: ['add_shadow_fields', 'dynamic_var_list'],

        args0: [
            {
                type: 'field_vertical_separator',
            },
            {
                type: 'input_dummy',
                name: 'LIST.DRIVE',
            },
            {
                type: 'field_dropdown',
                name: 'VAR_DIRECTION',
                options: straightDirections(),
            },
            {
                type: 'input_dummy',
                name: 'LIST.LIGHTSENSOR',
            },
            {
                type: 'input_value',
                name: 'REFLECTION',
                check: ['Number', shadowNumber('number', 50, 0, 100, 1)],
            },
        ],
    },
    func: (block, generator) => {
        const drive = block.getFieldValue('VALUE.DRIVE');
        const driveVar = generator.getVariableName(drive);

        const direction = block.getFieldValue('VAR_DIRECTION');
        const dir = direction === StraightDirection.Backward ? '-' : '';

        const reflection = generator
            .valueToCode(block, 'REFLECTION', Order.ATOMIC)
            .trim();

        const sensor = block.getFieldValue('VALUE.LIGHTSENSOR');
        const sensorVar = generator.getVariableName(sensor);

        return `await ${driveVar}.drive(${dir}${driveVar}.settings()[0], 0)
while await ${sensorVar}.reflection() >= ${reflection}:
  await wait(5)
${driveVar}.brake()`;
    },
};

export default block;
