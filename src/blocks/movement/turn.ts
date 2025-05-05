// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import { BlockDefinition } from '../repository';
import { Direction, defaultDirections, shadowNumber } from '../types';

const block: BlockDefinition = {
    def: {
        type: 'move_curve_block',
        message0: 'movement.turn.message',
        previousStatement: 'default',
        nextStatement: 'default',
        style: 'movement_category',
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
                type: 'input_value',
                name: 'VAR_DEGREES',
                check: ['Number', shadowNumber('degree', 90, 0.1, 360, 0.1)],
            },
            {
                type: 'field_dropdown',
                name: 'VAR_DIRECTION',
                options: defaultDirections(),
            },
        ],
    },
    func: (block, generator) => {
        const drive = block.getFieldValue('VALUE.DRIVE');
        const driveVar = generator.getVariableName(drive);

        let angle = parseFloat(generator.statementToCode(block, 'VAR_DEGREES').trim());

        const direction = block.getFieldValue('VAR_DIRECTION');

        if (direction === Direction.Counterclockwise) {
            angle *= -1;
        }

        return `${driveVar}.turn(${angle}, then=Stop.HOLD, wait=True)`;
    },
};

export default block;
