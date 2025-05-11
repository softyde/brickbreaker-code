// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import { Order } from 'blockly/python';
import { BlockDefinition } from '../../repository';

const block: BlockDefinition = {
    def: {
        type: 'distance',
        message0: 'sensor.distance.distance.message',
        output: 'Number',
        style: 'distance_sensor_category',
        extensions: ['dynamic_var_list'],
        inputsInline: true,

        args0: [
            {
                type: 'input_dummy',
                name: 'LIST.DISTANCESENSOR',
            },
        ],
    },
    func: (block, generator) => {
        const sensor = block.getFieldValue('VALUE.DISTANCESENSOR');
        const sensorVar = generator.getVariableName(sensor);

        return [`(${sensorVar}.distance() / 10)`, Order.ATOMIC];
    },
};

export default block;
