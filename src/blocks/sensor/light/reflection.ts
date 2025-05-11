// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import { Order } from 'blockly/python';
import { BlockDefinition } from '../../repository';

const block: BlockDefinition = {
    def: {
        type: 'light_reflection',
        message0: 'sensor.light.reflection.message',
        output: 'Number',
        style: 'lightsensor_category',
        extensions: ['dynamic_var_list'],
        inputsInline: true,

        args0: [
            {
                type: 'input_dummy',
                name: 'LIST.LIGHTSENSOR',
            },
        ],
    },
    func: (block, generator) => {
        const sensor = block.getFieldValue('VALUE.LIGHTSENSOR');
        const sensorVar = generator.getVariableName(sensor);

        return [`${sensorVar}.reflection()`, Order.ATOMIC];
    },
};

export default block;
