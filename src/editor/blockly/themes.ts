// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import * as Blockly from 'blockly';

const defaultThemeDefinition = {
    name: 'themeName',
    base: Blockly.Themes.Classic,
    blockStyles: {
        shadow_blocks: {
            colourPrimary: '#c0c0d0',
        },
        value_blocks: {
            colourPrimary: '#309BC0',
        },
        logic_blocks: {
            colourPrimary: '#4a148c',
        },
        hub_category: {
            colourPrimary: '#0c74f2',
            //colourSecondary: '#0c74f2',
            //colourTertiary: '#0c74f2',
        },
        event_category: {
            colourPrimary: '#f2bd0c',
            //colourSecondary: '#f2d985',
            //colourTertiary: '#735906',
            hat: 'cap',
        },
        movement_category: {
            colourPrimary: '#bc0cf2',
        },
        motor_category: {
            colourPrimary: '#0CB8F2',
        },
        movement_category$light: {
            colourPrimary: '#D56BF8',
        },
        flow_category: {
            colourPrimary: '#F2640C',
        },
        flow_value_category: {
            colourPrimary: '#F29A0D',
        },
        distance_sensor_category: {
            colourPrimary: '#6B9DF8',
        },
        sensor_category: {
            colourPrimary: '#6B9DF8',
        },
        procedure_blocks: {
            // Name is defined by plugin

            colourPrimary: '#0AB50A',
        },
        lightsensor_category: {
            colourPrimary: '#2DABBD',
        },
    },
    categoryStyles: {
        event_category: {
            colour: '#f2bd0c',
        },
        function_category: {
            colour: '#0AB50A',
        },
        hub_category: {
            colour: '#0c74f2',
        },
        movement_category: {
            colour: '#bc0cf2',
        },
        motor_category: {
            colour: '#0CB8F2',
        },
        flow_category: {
            colour: '#F2640C',
        },
        sensor_category: {
            colour: '#6B9DF8',
        },
    },
    componentStyles: {
        toolboxBackgroundColour: '#e4e7ed',
        toolboxForegroundColour: '#000',
        flyoutBackgroundColour: '#e4e7ed',
        flyoutOpacity: 0.85,

        workspaceBackgroundColour: '#fcfcfc',
        scrollbarColour: '#000000',
        scrollbarOpacity: 0.5,

        /*workspaceBackgroundColour: '#1e1e1e',
        toolboxBackgroundColour: 'blackBackground',
        toolboxForegroundColour: '#fff',
        flyoutBackgroundColour: '#252526',
        flyoutForegroundColour: '#ccc',
        flyoutOpacity: 1,
        scrollbarColour: '#797979',
        insertionMarkerColour: '#fff',
        insertionMarkerOpacity: 0.3,
        scrollbarOpacity: 0.4,
        cursorColour: '#d0d0d0',*/
        //blackBackground: '#333',
    },
    fontStyle: {
        family: '-apple-system, "BlinkMacSystemFont", "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Open Sans", "Helvetica Neue", sans-serif',
        weight: 'normal',
        size: 14,
    },
    //startHats: true,
} as const;

export const defaultTheme = Blockly.Theme.defineTheme(
    'themeName',
    defaultThemeDefinition,
);

export type BlockStyles = keyof typeof defaultThemeDefinition.blockStyles;

export const darkTheme = Blockly.Theme.defineTheme('themeDarkName', {
    name: 'themeDarkName',
    base: defaultTheme,

    componentStyles: {
        toolboxBackgroundColour: '#303030',
        toolboxForegroundColour: '#fff',
        flyoutBackgroundColour: '#303030',
        flyoutOpacity: 0.85,

        workspaceBackgroundColour: '#202020',
        scrollbarColour: '#ffffff',
        scrollbarOpacity: 0.5,

        /*workspaceBackgroundColour: '#1e1e1e',
        toolboxBackgroundColour: 'blackBackground',
        toolboxForegroundColour: '#fff',
        flyoutBackgroundColour: '#252526',
        flyoutForegroundColour: '#ccc',
        flyoutOpacity: 1,
        scrollbarColour: '#797979',
        insertionMarkerColour: '#fff',
        insertionMarkerOpacity: 0.3,
        scrollbarOpacity: 0.4,
        cursorColour: '#d0d0d0',*/
        //blackBackground: '#333',
    },

    //startHats: true,
});
