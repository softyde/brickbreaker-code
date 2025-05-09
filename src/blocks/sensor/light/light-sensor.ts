// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import { BlockDefinition } from '../../repository';
import { defaultPorts } from '../../types';

const block: BlockDefinition = {
    def: {
        type: 'sensor_light_sensor',
        message0: 'sensor.light.light-sensor.message',
        previousStatement: 'init',
        nextStatement: 'init',
        style: 'lightsensor_category',

        args0: [
            {
                type: 'field_vertical_separator',
            },
            {
                type: 'field_input',
                name: 'VAR.LIGHTSENSOR',
                text: 'Lichtsensor 1',
                spellcheck: false,
            },
            {
                type: 'field_dropdown',
                name: 'sensor-port',
                options: defaultPorts(),
            },
        ],
    },
    func: (block, generator) => {
        const sensor = block.getFieldValue('VAR.LIGHTSENSOR');
        const port = block.getFieldValue('sensor-port');

        const sensorVar = generator.getVariableName(sensor);

        return `${sensorVar} = ColorSensor(${port})`;
    },
};

export default block;
