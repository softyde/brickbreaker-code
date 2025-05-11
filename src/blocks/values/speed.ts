// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import { Order } from 'blockly/python';
import { BlockDefinition } from '../repository';
import { Speed, defaultSpeeds } from '../types';

const block: BlockDefinition = {
    def: {
        type: 'value.speed',
        message0: 'value.speed.message',
        style: 'value_blocks',
        args0: [
            {
                type: 'field_dropdown',
                name: 'speed',
                options: defaultSpeeds(),
            },
        ],
        output: 'Speed',
    },

    func: (block, _generator) => {
        const speed = block.getFieldValue('speed') as Speed;

        let value: number;

        switch (speed) {
            case Speed.VerySlow:
                value = 10;
                break;
            case Speed.Slow:
                value = 50;
                break;
            case Speed.Medium:
                value = 100;
                break;
            case Speed.Fast:
                value = 200;
                break;
            case Speed.VeryFast:
                value = 500;
                break;
        }

        return [`${value}`, Order.ATOMIC];
    },
};

export default block;
