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

export const VAR_TIMES = 'TIMES';

export const VAR_NUMBER = 'NUMBER';

export const VAR_STATEMENTS = 'STATEMENTS';

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
    {
        type: 'repeat_xtimes_block',
        message0: '%1 Wiederhole %2 Mal',
        style: 'flow_category',
        extensions: ['add_my_custom_icon', 'add_shadow_number'],
        args0: [
            {
                type: 'field_vertical_separator',
                name: 'separator',
            },
            {
                type: 'input_value',
                name: VAR_TIMES,
                check: ['Number', 'shadow_Number_Int_gt_Zero'],
                /*   value: 2,
                min: 1,
                max: 1000,
                precision: 1,*/
            },
        ],
        message1: '%1',
        args1: [
            {
                type: 'input_statement',
                name: VAR_STATEMENTS,
            },
        ],
        nextStatement: null,
        previousStatement: null,
    },
    {
        type: 'shadow_Number_Int_gt_Zero',
        message0: '%1',
        style: 'flow_category',
        args0: [
            {
                type: 'field_number',
                name: VAR_NUMBER,
                value: 1,
                min: 1,
                max: 1000,
                precision: 1,
            },
        ],
        output: 'Number',
    },
    {
        type: 'distance_sensor_input',
        message0: '%1 Entfernung in cm',
        output: 'Number',
        inputsInline: true,
        style: 'distance_sensor_category',
        extensions: ['add_my_custom_icon', 'dynamic_var_list'],

        args0: [
            {
                type: 'input_dummy',
                name: 'LIST.DIST_SENSOR',
            },
        ],
    },
    {
        type: 'distance_sensor_block',
        message0: '%1 %2 an %3',
        style: 'sensor_category',
        extensions: ['add_my_custom_icon', 'xxx'],
        previousStatement: null,
        nextStatement: null,
        args0: [
            {
                type: 'field_vertical_separator',
            },
            {
                type: 'field_input',
                name: 'VAR.DIST_SENSOR.1',
                text: 'Entfernungssensor',
                spellcheck: false,
            },
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
        ],
    },
    /*

{
  "type": "dynamic_dropdown",
  "message0": "day %1",
  "args0": [
    {
      "type": "input_dummy",
      "name": "INPUT"
    }
  ],
  "extensions": ["dynamic_menu_extension"]
}

Blockly.Extensions.register('dynamic_menu_extension',
  function() {
    this.getInput('INPUT')
      .appendField(new Blockly.FieldDropdown(
        function() {
          var options = [];
          var now = Date.now();
          for(var i = 0; i < 7; i++) {
            var dateString = String(new Date(now)).substring(0, 3);
            options.push([dateString, dateString.toUpperCase()]);
            now += 24 * 60 * 60 * 1000;
          }
          return options;
        }), 'DAY');
  });


    */
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
