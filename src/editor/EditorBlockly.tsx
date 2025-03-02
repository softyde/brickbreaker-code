// SPDX-License-Identifier: MIT
// Copyright (c) 2025 The Pybricks Authors

import * as Blockly from 'blockly/core';
import React, { useRef } from 'react';

import { useEffectOnce } from 'usehooks-ts';
//import { UUID } from '../fileStorage';
//import { useFileStoragePath } from '../fileStorage/hooks';
//import { blockyFileExtension } from '../pybricksMicropython/lib';
//import { useSelector } from '../reducers';

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

        const theme = Blockly.Theme.defineTheme('themeName', {
            name: 'themeName',
            base: Blockly.Themes.Classic,
            blockStyles: {
                logic_blocks: {
                    colourPrimary: '#4a148c',
                },
                hub_blocks: {
                    colourPrimary: '#0c74f2',
                    //colourSecondary: '#0c74f2',
                    //colourTertiary: '#0c74f2',
                },
                event_blocks: {
                    colourPrimary: '#f2bd0c',
                    //colourSecondary: '#f2d985',
                    //colourTertiary: '#735906',
                    hat: 'cap',
                },
                movement_blocks: {
                    colourPrimary: '#bc0cf2',
                },
            },
            categoryStyles: {
                event_category: {
                    colour: '#f2bd0c',
                },
                hub_category: {
                    colour: '#0c74f2',
                },
                movement_category: {
                    colour: '#bc0cf2',
                },
            },
            componentStyles: {
                toolboxBackgroundColour: '#c0c0c0',
                toolboxForegroundColour: '#000',

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
            //fontStyle: {},
            //startHats: true,
        });

        Blockly.defineBlocksWithJsonArray([
            {
                type: 'start_program',
                message0: 'Wenn Programm startet',
                tooltip: 'Wenn das Programm startet',
                nextStatement: null,
                style: 'event_blocks',
            },
            {
                type: 'setup_program',
                message0: 'Initialisierung',
                tooltip: 'tbd',
                nextStatement: null,
                style: 'event_blocks',
            },
            {
                type: 'move_straight_block',
                message0: 'Fahre %1 %2cm',
                style: 'movement_blocks',
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
                ],
                nextStatement: null,
                previousStatement: null,
            },
            {
                type: 'hub_block',
                message0: '%1 mit Oberseite %2 und Vorderseite %3',
                nextStatement: null,
                previousStatement: null,
                style: 'hub_blocks',
                args0: [
                    {
                        type: 'field_input',
                        name: 'VAR1',
                        text: 'Spike Prime',
                    },
                    {
                        type: 'field_variable',
                        name: 'VAR2',
                        variable: 'z-Achse',
                        variableTypes: [''],
                    },
                    {
                        type: 'field_variable',
                        name: 'VAR3',
                        variable: 'x-Achse',
                        variableTypes: [''],
                    },
                ],
            },
        ]);
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
                    name: 'Hub',
                    categorystyle: 'hub_category',
                    contents: [
                        {
                            kind: 'block',
                            type: 'hub_block',
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
                            type: 'move_straight_block',
                        },
                    ],
                },
            ],
        };

        workspaceRef.current = Blockly.inject(blocklyEditorRef.current, {
            toolbox: toolbox,
            sounds: true,
            media: './blockly/',
            theme: theme,
            grid: {
                spacing: 20,
                length: 3,
                colour: '#ccc',
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

        console.log('workspaceRef', workspaceRef);

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

    //const { activeFileUuid } = useSelector((s) => s.editor);
    //const fileName = useFileStoragePath(activeFileUuid ?? ('' as UUID));
    //const isBlocky = fileName?.endsWith(blockyFileExtension);

    //
    return (
        <>
            <div className={'pb-editor-blockly'} ref={blocklyEditorRef} />
        </>
    );
};

export default BlocklyEditor;
