// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import { BlockDefinition } from '../repository';
import { shadowNumber } from '../types';

const block: BlockDefinition = {
    def: {
        type: 'move_set_turn_acc',
        message0: 'movement.set-turn-acc.message',
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
                name: 'VAR_ACC',
                check: ['Number', shadowNumber('rotation-acc', 100, 1, 1000, 1)],
            },
        ],
    },
    func: (block, generator) => {
        const drive = block.getFieldValue('VALUE.DRIVE');
        const driveVar = generator.getVariableName(drive);

        const distance = generator.statementToCode(block, 'VAR_ACC').trim();

        return `${driveVar}.settings(turn_acceleration=${distance})`;
    },
};

export default block;
