// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

export const Toolbox = {
    // There are two kinds of toolboxes. The simpler one is a flyout toolbox.
    kind: 'categoryToolbox',
    // The contents is the blocks and other items that exist in your toolbox.
    contents: [
        {
            kind: 'category',
            name: 'Ereignisse',
            categorystyle: 'event_category',
            contents: [
                {
                    kind: 'block',
                    type: 'setup_program',
                },
                {
                    kind: 'block',
                    type: 'start_program',
                },
            ],
        },
        {
            kind: 'category',
            name: 'Fahren',
            categorystyle: 'movement_category',
            contents: [
                {
                    kind: 'label',
                    text: 'Blöcke zum Initialisieren',
                    //                    'web-class': 'myLabelStyle',
                },
                {
                    kind: 'block',
                    type: 'move_motor_block',
                },
                {
                    kind: 'block',
                    type: 'move_hub_block',
                },
                {
                    kind: 'label',
                    text: 'Blöcke zum Fahren',
                },
                {
                    kind: 'block',
                    type: 'move_straight_block',
                },
                {
                    kind: 'block',
                    type: 'move_curve_block',
                },
                {
                    kind: 'block',
                    type: 'start_move_block',
                },
                {
                    kind: 'block',
                    type: 'stop_move_block',
                },
            ],
        },
        {
            kind: 'category',
            name: 'Motoren',
            categorystyle: 'motor_category',
            contents: [
                {
                    kind: 'label',
                    text: 'Motoren drehen',
                    //                    'web-class': 'myLabelStyle',
                },
                {
                    kind: 'block',
                    type: 'move_motor_block',
                },
                {
                    kind: 'block',
                    type: 'reset_relative_position',
                },
                {
                    kind: 'block',
                    type: 'move_to_position',
                },
                {
                    kind: 'block',
                    type: 'move_by',
                },
                {
                    kind: 'block',
                    type: 'motor_move_stop',
                },
                {
                    kind: 'block',
                    type: 'motor_move_rotate',
                },
                {
                    kind: 'block',
                    type: 'value.speed',
                },
            ],
        },
        {
            kind: 'category',
            name: 'Ablauf',
            categorystyle: 'flow_category',
            contents: [
                {
                    kind: 'block',
                    type: 'flow_wait',
                },
                {
                    kind: 'block',
                    type: 'flow-if',
                },
                {
                    kind: 'block',
                    type: 'flow-if-else',
                },
                {
                    kind: 'block',
                    type: 'flow-for',
                },
                {
                    kind: 'block',
                    type: 'flow-wait-until',
                },
                {
                    kind: 'block',
                    type: 'flow-while',
                },
                {
                    kind: 'block',
                    type: 'flow-do-while',
                },
                {
                    kind: 'block',
                    type: 'number_condition',
                },
                {
                    kind: 'block',
                    type: 'boolean_condition',
                },
                {
                    kind: 'block',
                    type: 'not_condition',
                },
                {
                    kind: 'block',
                    type: 'true_condition',
                },
                {
                    kind: 'block',
                    type: 'false_condition',
                },
            ],
        },
        {
            kind: 'category',
            name: 'Funktionen',
            categorystyle: 'function_category',
            custom: 'PROCEDURE',
        },
        {
            kind: 'category',
            name: 'Variablen',
            //custom: 'VARIABLE_DYNAMIC',
            custom: 'VARIABLE',
        },
        {
            kind: 'category',
            name: 'Hub',
            categorystyle: 'hub_category',
            contents: [
                {
                    kind: 'block',
                    type: 'hub_block',
                },
                {
                    kind: 'block',
                    type: 'line_follow_block',
                },
                {
                    kind: 'block',
                    type: 'hub_beep',
                },
            ],
        },

        {
            kind: 'category',
            name: 'Sensoren',
            categorystyle: 'sensor_category',
            contents: [
                {
                    kind: 'block',
                    type: 'sensor_light_sensor',
                },
                {
                    kind: 'block',
                    type: 'light_reflection',
                },
                {
                    kind: 'block',
                    type: 'distance_sensor_block',
                },
                {
                    kind: 'block',
                    type: 'distance_sensor_input',
                },
            ],
        },
    ],
};
