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
