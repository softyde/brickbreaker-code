// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

export const VAR_HUB_TOP_AXIS = 'HUB_TOP_AXIS';
export const VAR_HUB_FRONT_AXIS = 'HUB_FRONT_AXIS';

export const VAR_MOTOR_PORT = 'MOTOR_PORT';
export const VAR_MOTOR_DIRECTION = 'MOTOR_DIRECTION';

export const VAR_MOTOR_LEFT = 'MOTOR_LEFT';
export const VAR_MOTOR_RIGHT = 'MOTOR_RIGHT';

export const VAR_DIAMETER = 'DIAMETER';
export const VAR_AXLE_TRACK = 'AXLE_TRACK';

export const VAR_DISTANCE = 'DISTANCE';
export const VAR_DIRECTION = 'DIRECTION';

export const VAR_DEGREES = 'DEGREES';

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
export enum StraightDirection {
    Forward = 'Forward',
    Backward = 'Backward',
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
        message0: '%1 Roboter mit Oberseite %2 und Vorderseite %3',
        nextStatement: null,
        previousStatement: null,
        style: 'hub_category',
        extensions: ['add_my_custom_icon'],

        args0: [
            {
                type: 'field_vertical_separator',
            },
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
        ],
    },
    {
        type: 'drive_motor_block',
        message0: 'Motor an %1 dreht sich %2',
        output: CONNECTION_MOTOR,
        style: 'movement_category$light',

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
                    ['rechts ↻', Direction.Clockwise],
                    ['links ↺', Direction.Counterclockwise],
                ],
            },
        ],
    },
    {
        type: 'drive_hub',
        message0: '%1 Fahrwerk mit Raddurchmesser %2mm und Abstand %3mm',
        args0: [
            {
                type: 'field_vertical_separator',
            },
            {
                type: 'field_number',
                name: VAR_DIAMETER,
                value: 56,
                min: 8,
                max: 120,
                precision: 1,
            },
            {
                type: 'field_number',
                name: VAR_AXLE_TRACK,
                value: 112,
                min: 16,
                max: 240,
                precision: 1,
            },
        ],
        message1: 'mit Rad links %1',
        args1: [
            {
                type: 'input_value',
                name: VAR_MOTOR_LEFT,
                check: CONNECTION_MOTOR,
            },
        ],
        message2: 'und Rad rechts %1',
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
    {
        type: 'move_straight_block',
        message0: '%1 Fahre %2cm %3',
        style: 'movement_category',
        extensions: ['add_my_custom_icon'],

        args0: [
            {
                type: 'field_vertical_separator',
                name: 'separator',
            },
            {
                type: 'field_number',
                name: VAR_DISTANCE,
                value: 10.0,
                min: 0.1,
                max: 200.0,
                precision: 0.1,
            },
            {
                type: 'field_dropdown',
                name: VAR_DIRECTION,
                options: [
                    ['vorwärts ↑', StraightDirection.Forward],
                    ['rückwärts ↓', StraightDirection.Backward],
                ],
            },
        ],
        nextStatement: null,
        previousStatement: null,
    },
    {
        type: 'move_curve_block',
        message0: '%1 Drehe %2° nach %3',
        style: 'movement_category',
        extensions: ['add_my_custom_icon'],

        args0: [
            {
                type: 'field_vertical_separator',
                name: 'separator',
            },
            {
                type: 'field_number',
                name: VAR_DEGREES,
                value: 90.0,
                min: 0.1,
                max: 360.0,
                precision: 0.1,
            },
            {
                type: 'field_dropdown',
                name: VAR_DIRECTION,
                options: [
                    ['rechts ↻', Direction.Clockwise],
                    ['links ↺', Direction.Counterclockwise],
                ],
            },
        ],
        nextStatement: null,
        previousStatement: null,
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
