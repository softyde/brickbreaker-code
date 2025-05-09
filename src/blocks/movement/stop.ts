// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import { BlockDefinition } from '../repository';

const block: BlockDefinition = {
    def: {
        type: 'stop_move_block',
        message0: 'movement.stop.message',
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
        ],
    },
    func: (block, generator) => {
        const drive = block.getFieldValue('VALUE.DRIVE');
        const driveVar = generator.getVariableName(drive);

        return `${driveVar}.brake()`;
    },
};

export default block;
