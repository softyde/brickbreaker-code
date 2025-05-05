// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import { BlockDefinition } from '../repository';
import { StraightDirection, shadowNumber, straightDirections } from '../types';

const block: BlockDefinition = {
    def: {
        type: 'move_straight_block',
        message0: 'movement.straight.message',
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
                name: 'VAR_DISTANCE',
                check: ['Number', shadowNumber('cm', 10, 0.1, 200, 0.1)],
            },
            {
                type: 'field_dropdown',
                name: 'VAR_DIRECTION',
                options: straightDirections(),
            },
        ],
    },
    func: (block, generator) => {
        const drive = block.getFieldValue('VALUE.DRIVE');
        const driveVar = generator.getVariableName(drive);

        let distance =
            generator.statementToCode(block, 'VAR_DISTANCE').trim() + ' * 10';
        const direction = block.getFieldValue('VAR_DIRECTION');

        if (direction === StraightDirection.Backward) {
            distance = `-${distance}`;
        }

        return `${driveVar}.straight(${distance}, then=Stop.HOLD, wait=True)`;
    },
};

export default block;
