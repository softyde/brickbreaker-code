// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import { Order } from 'blockly/python';
import { BlockDefinition } from '../repository';
import { shadowNumber } from '../types';

const block: BlockDefinition = {
    def: {
        type: 'move_set_turn_speed',
        message0: 'movement.set-turn-speed.message',
        previousStatement: 'default',
        nextStatement: 'default',
        style: 'movement_category$light',
        extensions: ['add_shadow_fields', 'dynamic_var_list'],
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
                name: 'VAR_SPEED',
                check: ['Number', shadowNumber('rotation-speed', 100, 1, 1000, 1)],
            },
        ],
    },
    func: (block, generator) => {
        const drive = block.getFieldValue('VALUE.DRIVE');
        const driveVar = generator.getVariableName(drive);

        const distance = generator.valueToCode(block, 'VAR_SPEED', Order.ATOMIC).trim();

        return `${driveVar}.settings(turn_rate=${distance})`;
    },
};

export default block;
