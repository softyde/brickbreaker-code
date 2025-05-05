// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import { BlockDefinition } from '../repository';

const block: BlockDefinition = {
    def: {
        type: 'motor_move_stop',
        message0: 'motor.move-stop.message',
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
        ],
    },
    func: (block, generator) => {
        const motor = block.getFieldValue('VALUE.MOTOR');
        const motorVar = generator.getVariableName(motor);

        return `${motorVar}.hold()`;
    },
};

export default block;
