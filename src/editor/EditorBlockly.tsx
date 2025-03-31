// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import './editorBlockly.scss';

import * as BlocklyProcedures from '@blockly/block-shareable-procedures';
import * as Blockly from 'blockly/core';

import * as De from 'blockly/msg/de';

import React, { useRef } from 'react';

import { useEffectOnce } from 'usehooks-ts';
import defaultBlocks from './blockly/blocks';
import * as blocklyShadow from './blockly/extension_shadow';
import { registerExtensions } from './blockly/extensions';

import * as notify from './blockly/lib';
import * as BlocklyVars from './blockly/variables';

Blockly.setLocale(De as unknown as { [key: string]: string });

const BlocklyEditor: React.FunctionComponent = () => {
    const blocklyEditorRef = useRef<HTMLDivElement>(null);

    const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);

    useEffectOnce(() => {
        // istanbul ignore if: should never happen
        if (!blocklyEditorRef.current) {
            console.error('no blocklyEditorRef!');
            return;
        }

        // registerFirstContextMenuOptions();
        BlocklyProcedures.unregisterProcedureBlocks();
        Blockly.common.defineBlocks(BlocklyProcedures.blocks);

        BlocklyVars.initCustomVariableHandling();

        registerExtensions();

        const theme = Blockly.Theme.defineTheme('themeName', {
            name: 'themeName',
            base: Blockly.Themes.Classic,
            blockStyles: {
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
                movement_category$light: {
                    colourPrimary: '#D56BF8',
                },
                flow_category: {
                    colourPrimary: '#F2640C',
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
        });

        Blockly.defineBlocksWithJsonArray(defaultBlocks);

        /*
        const theme = Blockly.Theme.defineTheme('themeName', {
            base: Blockly.Themes.Classic,
            blockStyles: {
                logic_blocks: {
                    colourPrimary: '#4a148c',
                },
                math_blocks: {},
            },
            categoryStyles: {},
            componentStyles: {},
            fontStyle: {},
            startHats: true,
        });*/

        Blockly.ContextMenuItems.registerCommentOptions();

        const toolbox = {
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
                    name: 'Bewegung',
                    categorystyle: 'movement_category',
                    contents: [
                        {
                            kind: 'block',
                            type: 'drive_hub',
                        },
                        {
                            kind: 'block',
                            type: 'drive_motor_block',
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
                            type: 'move_follow_line',
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
                            type: 'repeat_xtimes_block',
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
        workspaceRef.current = Blockly.inject(blocklyEditorRef.current, {
            toolbox: toolbox,
            //renderer: 'thrasos',
            renderer: 'zelos',
            //renderer: 'geras',
            sounds: true,
            collapse: false,
            disable: false,
            comments: true,
            media: './blockly/',
            theme: theme,
            maxInstances: {
                setup_program: 1,
                start_program: 1,
            },
            grid: {
                spacing: 40,
                length: 41,
                colour: '#ddd',
                snap: true,
            },
            trashcan: true,
            zoom: {
                controls: true,
                wheel: true,
                startScale: 1.0,
                maxScale: 3,
                minScale: 0.3,
                scaleSpeed: 1.2,
                pinch: true,
            },
        });

        blocklyShadow.registerExtension();
        // Erstelle einen ResizeObserver, um auf Größenänderungen zu reagieren
        resizeObserverRef.current = new ResizeObserver(() => {
            // Debounce die Resize-Funktion
            /*if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }

            const resizeTimeout = setTimeout(() => {*/
            resizeBlockly();
            //}, 50); // 50ms Verzögerung
        });

        // Beobachte den Container für Größenänderungen
        resizeObserverRef.current.observe(blocklyEditorRef.current);

        // Führe initiales Resize durch
        resizeBlockly();

        notify.didCreateBlocklyEditor(workspaceRef.current);

        return () => {
            //setEditor(undefined);
        };
    });

    const resizeBlockly = () => {
        // Prüfe, ob der Workspace noch existiert
        if (!workspaceRef.current) {
            return;
        }

        // Füge eine kleine Verzögerung ein, um Flackern zu vermeiden
        window.requestAnimationFrame(() => {
            // Berechne die neue Größe basierend auf dem Container
            const metrics = workspaceRef.current!.getMetrics();

            // Resize nur durchführen, wenn Metrics verfügbar sind
            if (metrics) {
                Blockly.svgResize(workspaceRef.current!);
                workspaceRef.current!.render();
            }
        });
    };

    return (
        <>
            <div className={'pb-editor-blockly'} ref={blocklyEditorRef} />
        </>
    );
};

export default BlocklyEditor;
