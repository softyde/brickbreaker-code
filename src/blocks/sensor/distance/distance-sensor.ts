// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import { Severity } from '../../../expert/codeIssue';
import i18next from '../../../i18next';
import { BlockDefinition } from '../../repository';
import { defaultPorts } from '../../types';

const block: BlockDefinition = {
    def: {
        type: 'sensor_distance_sensor',
        message0: 'sensor.distance.distance-sensor.message',
        previousStatement: 'init',
        nextStatement: 'init',
        style: 'distance_sensor_category',

        args0: [
            {
                type: 'field_vertical_separator',
            },
            {
                type: 'field_input',
                name: 'VAR.DISTANCESENSOR',
                text: 'Entfernungssensor 1',
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
        const sensor = block.getFieldValue('VAR.DISTANCESENSOR');
        const port = block.getFieldValue('sensor-port');

        const sensorVar = generator.getVariableName(sensor);

        const codeExpert = generator.codeExpert;
        if (!codeExpert.usePort(port)) {
            const portName = block.getField('sensor-port')?.getText();

            codeExpert.add(
                Severity.Error,
                i18next.t('expert:error.duplicatePort', {
                    item: sensor,
                    port: portName,
                }),
                block,
            );
        }

        return `${sensorVar} = UltrasonicSensor(${port})`;
    },
};

export default block;
