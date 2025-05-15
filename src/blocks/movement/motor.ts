// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import { Severity } from '../../expert/codeIssue';
import i18next from '../../i18next';

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

        const codeExpert = generator.codeExpert;

        codeExpert.addMotor(motor, direction);

        if (!codeExpert.usePort(port)) {
            const portName = block.getField('motor-port')?.getText();

            codeExpert.add(
                Severity.Error,
                i18next.t('expert:error.duplicatePort', {
                    item: motor,
                    port: portName,
                }),
                block,
            );
        }

        return `${motorVar} = Motor(${port}, ${direction})
${motorVar}.reset_angle(0)        
`;
    },
};

export default block;
