// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

export const VAR_HUB_TOP_AXIS = 'HUB_TOP_AXIS';
export const VAR_HUB_FRONT_AXIS = 'HUB_FRONT_AXIS';

export const VAR_MOTOR_PORT = 'MOTOR_PORT';
export const VAR_MOTOR_DIRECTION = 'MOTOR_DIRECTION';

export const VAR_MOTOR_LEFT = 'MOTOR_LEFT';
export const VAR_MOTOR_RIGHT = 'MOTOR_RIGHT';

export const CONNECTION_MOTOR = 'connection.motor';

export enum Axis {
    X = 'Axis.X',
    Y = 'Axis.Y',
    Z = 'Axis.Z',
}
export enum Port {
    A = 'Port.A',
    B = 'Port.B',
    C = 'Port.C',
    D = 'Port.D',
    E = 'Port.E',
    F = 'Port.F',
}

export enum Direction {
    Clockwise = 'Direction.CLOCKWISE',
    Counterclockwise = 'Direction.COUNTERCLOCKWISE',
}

const blocks = [
    {
        type: 'start_program',
        message0: '%1 Programm starten',
        tooltip: 'Programm starten',
        nextStatement: null,
        style: 'event_category',
        extensions: ['add_my_custom_icon'],
        args0: [
            {
                type: 'field_vertical_separator',
                name: 'separator',
            },
        ],
    },
    {
        type: 'hub_block',
        message0: '%3Roboter mit Oberseite %1 und Vorderseite %2',
        nextStatement: null,
        previousStatement: null,
        style: 'hub_category',
        extensions: ['add_my_custom_icon'],

        args0: [
            {
                type: 'field_dropdown',
                name: VAR_HUB_TOP_AXIS,
                options: [
                    ['Z-Achse', Axis.Z],
                    ['X-Achse', Axis.X],
                    ['Y-Achse', Axis.Y],
                ],
            },
            {
                type: 'field_dropdown',
                name: VAR_HUB_FRONT_AXIS,
                options: [
                    ['X-Achse', Axis.X],
                    ['Y-Achse', Axis.Y],
                    ['Z-Achse', Axis.Z],
                ],
            },
            {
                type: 'field_vertical_separator',
            },
        ],
    },
    {
        type: 'drive_motor_block',
        message0: 'Motor an %1 dreht sich %2',
        output: CONNECTION_MOTOR,
        style: 'movement_category',

        args0: [
            {
                type: 'field_dropdown',
                name: VAR_MOTOR_PORT,
                options: [
                    ['Anschluss A', Port.A],
                    ['Anschluss B', Port.B],
                    ['Anschluss C', Port.C],
                    ['Anschluss D', Port.D],
                    ['Anschluss E', Port.E],
                    ['Anschluss F', Port.F],
                ],
            },
            {
                type: 'field_dropdown',
                name: VAR_MOTOR_DIRECTION,
                options: [
                    ['rechts', Direction.Clockwise],
                    ['links', Direction.Counterclockwise],
                ],
            },
        ],
    },
    {
        type: 'drive_hub',
        message0: '%1Initialisiere Fahrwerk mit',
        args0: [
            {
                type: 'field_vertical_separator',
            },
        ],
        message1: 'Rad links %1',
        args1: [
            {
                type: 'input_value',
                name: VAR_MOTOR_LEFT,
                check: CONNECTION_MOTOR,
            },
        ],
        message2: 'Rad rechts %1',
        args2: [
            {
                type: 'input_value',
                name: VAR_MOTOR_RIGHT,
                check: CONNECTION_MOTOR,
            },
        ],
        previousStatement: null,
        nextStatement: null,
        style: 'movement_category',
        extensions: ['add_my_custom_icon'],
    },

    /* ---------------------------------------------------------------------------------------------------- */
    {
        type: 'setup_program',
        message0: '%1 Roboter initialisieren',
        tooltip: 'tbd',
        nextStatement: null,
        style: 'event_category',
        extensions: ['add_my_custom_icon'],

        args0: [
            {
                type: 'field_vertical_separator',
                name: 'separator',
            },
        ],
    },
    {
        type: 'move_straight_block',
        message0: '%3 Fahre %1 %2cm',
        style: 'movement_category',
        extensions: ['add_my_custom_icon'],

        args0: [
            {
                type: 'field_variable',
                name: 'VAR1',
                variable: 'Vorwärts',
            },
            {
                type: 'field_input',
                name: 'VAR2',
                text: '10',
                check: 'Number',
            },
            {
                type: 'field_vertical_separator',
                name: 'separator',
            },
        ],
        nextStatement: null,
        previousStatement: null,
    },
    {
        type: 'move_curve_block',
        message0: '%2 Drehe um %1°',
        style: 'movement_category',
        extensions: ['add_my_custom_icon'],

        args0: [
            {
                type: 'field_variable',
                name: 'VAR1',
                variable: '90',
            },
            {
                type: 'field_vertical_separator',
                name: 'VAR2',
            },
        ],
        nextStatement: null,
        previousStatement: null,
    },
    {
        type: 'move_follow_line',
        message0: '%2 Folge der Linie für höchstens %1cm',
        style: 'movement_category',
        tooltip: 'Na was wohl: der Linie hinterherfahren.',
        extensions: ['add_my_custom_icon'],

        args0: [
            {
                type: 'field_variable',
                name: 'VAR1',
                variable: '10',
            },
            {
                type: 'field_vertical_separator',
                name: 'VAR2',
            },
        ],
        nextStatement: null,
        previousStatement: null,
    },
    {
        type: 'hub_beep',
        message0: '%1 Einen Ton abspielen',
        nextStatement: null,
        previousStatement: null,
        style: 'hub_category',
        extensions: ['add_my_custom_icon'],
        args0: [
            {
                type: 'field_vertical_separator',
                name: 'separator',
            },
        ],
    },

    {
        type: 'line_follow_block',
        message0: '%3 Sensoren zur Linienverfolgung an %1 und %2',
        nextStatement: null,
        previousStatement: null,
        style: 'hub_category',
        extensions: ['add_my_custom_icon'],

        args0: [
            {
                type: 'field_dropdown',
                name: 'PORT_1',
                options: [
                    ['Port A', 'PORTA'],
                    ['Port B', 'PORTB'],
                ],
            },
            {
                type: 'field_dropdown',
                name: 'PORT_2',
                options: [
                    ['Port A', 'PORTA'],
                    ['Port B', 'PORTB'],
                ],
            },
            {
                type: 'field_vertical_separator',
                name: 'VAR4',
            },
        ],
    },
    {
        type: 'drive_init',
        message0:
            '%3 Fahrwerk initialisieren mit %1 als Rad rechts und %2 als Rad links',
        nextStatement: null,
        previousStatement: null,
        style: 'movement_category',
        extensions: ['add_my_custom_icon'],

        args0: [
            {
                type: 'field_dropdown',
                name: 'MOTOR_1',
                options: [
                    ['Port A', 'PORTA'],
                    ['Port B', 'PORTB'],
                ],
            },
            {
                type: 'field_dropdown',
                name: 'MOTOR_2',
                options: [
                    ['Port A', 'PORTA'],
                    ['Port B', 'PORTB'],
                ],
            },
            {
                type: 'field_vertical_separator',
                name: 'VAR4',
            },
        ],
    },
];

export default blocks;
