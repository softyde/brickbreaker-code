// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import { BlockDefinition } from '../repository';
import { defaultDirections, defaultPorts } from '../types';

const block: BlockDefinition = {
    def: {
        type: 'move_motor_block',
        message0: 'movement.motor.message',
        previousStatement: 'init',
        nextStatement: 'init',
        style: 'motor_category$light',

        args0: [
            {
                type: 'field_vertical_separator',
            },
            {
                type: 'field_input',
                name: 'VAR.MOTOR',
                text: 'Motor 1',
                spellcheck: false,
            },
            {
                type: 'field_dropdown',
                name: 'motor-port',
                options: defaultPorts(),
            },
            {
                type: 'field_dropdown',
                name: 'motor-direction',
                options: defaultDirections(),
            },
        ],
    },
    func: (block, generator) => {
        const motor = block.getFieldValue('VAR.MOTOR');
        const port = block.getFieldValue('motor-port');
        const direction = block.getFieldValue('motor-direction');

        const motorVar = generator.getVariableName(motor);

        return `${motorVar} = Motor(${port}, ${direction})`;
    },
};

export default block;
