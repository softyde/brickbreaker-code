// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import { BlockDefinition } from '../repository';
import { StraightDirection, straightDirections } from '../types';

const block: BlockDefinition = {
    def: {
        type: 'start_move_block',
        message0: 'movement.start.message',
        previousStatement: 'default',
        nextStatement: 'default',
        style: 'movement_category',
        extensions: ['dynamic_var_list'],
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
                type: 'field_dropdown',
                name: 'VAR_DIRECTION',
                options: straightDirections(),
            },
        ],
    },
    func: (block, generator) => {
        const drive = block.getFieldValue('VALUE.DRIVE');
        const driveVar = generator.getVariableName(drive);

        const direction = block.getFieldValue('VAR_DIRECTION');

        return `${driveVar}.drive(${
            direction === StraightDirection.Forward ? '' : '-'
        }${driveVar}.settings()[0], 0)`;
    },
};

export default block;
