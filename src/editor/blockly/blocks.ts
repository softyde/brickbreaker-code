// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

export const VAR_HUB_TOP_AXIS = 'HUB_TOP_AXIS';
export const VAR_HUB_FRONT_AXIS = 'HUB_FRONT_AXIS';

export const VAR_MOTOR_PORT = 'MOTOR_PORT';
export const VAR_MOTOR_DIRECTION = 'MOTOR_DIRECTION';

export const var_port = 'port';

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

export const STATEMENT_INIT = 'init';
export const STATEMENT_DEFAULT = 'default';

export const shadow = 'shadow_';
export const shadow_number = `${shadow}number`;
export const add_shadow_fields = 'add_shadow_fields';

export const shadow_number_type = 'shadow-number-type';

function shadowNumber(
    value: number,
    min: number,
    max: number,
    precision: number,
): string {
    return `${shadow_number}/${value}/${min}/${max}/${precision}`;
}

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
        type: 'move_straight_block',
        message0: '%1 %2 fahre %3cm %4',
        style: 'movement_category',
        extensions: ['add_my_custom_icon', 'dynamic_var_list', add_shadow_fields],
        inputsInline: true,

        args0: [
            {
                type: 'field_vertical_separator',
                name: 'separator',
            },
            {
                type: 'input_dummy',
                name: 'LIST.DRIVE',
            },
            {
                type: 'input_value',
                name: VAR_DISTANCE,
                check: ['Number', shadowNumber(10, 0.1, 200, 0.1)],
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
        nextStatement: STATEMENT_DEFAULT,
        previousStatement: STATEMENT_DEFAULT,
    },
    {
        type: 'start_move_block',
        message0: '%1 %2 fahre %3',
        style: 'movement_category',
        extensions: ['add_my_custom_icon', 'dynamic_var_list'],
        inputsInline: true,

        args0: [
            {
                type: 'field_vertical_separator',
                name: 'separator',
            },
            {
                type: 'input_dummy',
                name: 'LIST.DRIVE',
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
        nextStatement: STATEMENT_DEFAULT,
        previousStatement: STATEMENT_DEFAULT,
    },
    {
        type: 'stop_move_block',
        message0: '%1 %2 halte an',
        style: 'movement_category',
        extensions: ['add_my_custom_icon', 'dynamic_var_list'],
        inputsInline: true,

        args0: [
            {
                type: 'field_vertical_separator',
                name: 'separator',
            },
            {
                type: 'input_dummy',
                name: 'LIST.DRIVE',
            },
        ],
        nextStatement: STATEMENT_DEFAULT,
        previousStatement: STATEMENT_DEFAULT,
    },
    {
        type: 'move_curve_block',
        message0: '%1 %2 drehe %3° nach %4',
        style: 'movement_category',
        extensions: ['add_my_custom_icon', 'dynamic_var_list', add_shadow_fields],

        args0: [
            {
                type: 'field_vertical_separator',
                name: 'separator',
            },
            {
                type: 'input_dummy',
                name: 'LIST.DRIVE',
            },
            {
                type: 'input_value',
                name: VAR_DEGREES,
                check: ['Number', shadowNumber(90, 0.1, 360, 0.1)],
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
        nextStatement: STATEMENT_DEFAULT,
        previousStatement: STATEMENT_DEFAULT,
    },
    {
        type: 'repeat_xtimes_block',
        message0: '%1 Wiederhole %2 Mal',
        style: 'flow_category',
        extensions: ['add_my_custom_icon', add_shadow_fields],
        args0: [
            {
                type: 'field_vertical_separator',
                name: 'separator',
            },
            {
                type: 'input_value',
                name: VAR_TIMES,
                check: ['Number', shadowNumber(2, 1, 1000, 1)],
            },
        ],
        message1: '%1',
        args1: [
            {
                type: 'input_statement',
                name: VAR_STATEMENTS,
            },
        ],
        nextStatement: STATEMENT_DEFAULT,
        previousStatement: STATEMENT_DEFAULT,
    },
    {
        type: 'number_condition',
        message0: '%1 %2 %3',
        style: 'flow_category',
        inputsInline: true,
        extensions: [add_shadow_fields],
        args0: [
            {
                type: 'input_value',
                name: 'var_a',
                check: ['Number', shadowNumber(1, -10000, 10000, 0.1)],
            },
            {
                type: 'field_dropdown',
                name: 'var_condition',
                options: [
                    ['<', '<'],
                    ['≤', '<='],
                    ['=', '=='],
                    ['≥', '>='],
                    ['>', '>'],
                ],
            },
            {
                type: 'input_value',
                name: 'var_b',
                check: ['Number', shadowNumber(2, -10000, 10000, 0.1)],
            },
        ],
        output: 'Boolean',
    },
    {
        type: 'if_block',
        message0: '%1 Wenn %2, dann',
        style: 'flow_category',
        extensions: ['add_my_custom_icon'],
        args0: [
            {
                type: 'field_vertical_separator',
                name: 'separator',
            },
            {
                type: 'input_value',
                name: 'condition',
                check: ['Boolean'],
            },
        ],
        message1: '%1',
        args1: [
            {
                type: 'input_statement',
                name: VAR_STATEMENTS,
            },
        ],
        nextStatement: STATEMENT_DEFAULT,
        previousStatement: STATEMENT_DEFAULT,
    },
    {
        type: shadow_number,
        message0: '%1',
        style: 'flow_category',
        args0: [
            {
                type: shadow_number_type,
                name: VAR_NUMBER,
                value: 1,
                min: -1000,
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
        style: 'distance_sensor_category',
        extensions: ['add_my_custom_icon'],
        previousStatement: STATEMENT_INIT,
        nextStatement: STATEMENT_INIT,
        args0: [
            {
                type: 'field_vertical_separator',
            },
            {
                type: 'field_input',
                name: 'VAR.DIST_SENSOR',
                text: 'Entfernungssensor',
                spellcheck: false,
            },
            {
                type: 'field_dropdown',
                name: var_port,
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

    // Block for variable setter.
    {
        type: 'variables_set',
        message0: '%{BKY_VARIABLES_SET}',
        extensions: [add_shadow_fields],
        previousStatement: null,
        nextStatement: null,
        args0: [
            {
                type: 'field_variable',
                name: 'VAR',
                variable: '%{BKY_VARIABLES_DEFAULT_NAME}',
            },
            {
                type: 'input_value', // This expects an input of any type
                name: 'VALUE',
                check: ['Number', shadow_number],
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
