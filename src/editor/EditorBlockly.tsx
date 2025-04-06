// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import './editorBlockly.scss';

import * as BlocklyProcedures from '@blockly/block-shareable-procedures';
import * as Blockly from 'blockly/core';

import * as De from 'blockly/msg/de';

import React, { useEffect, useRef } from 'react';

import { useEffectOnce, useTernaryDarkMode } from 'usehooks-ts';
import defaultBlocks from './blockly/blocks';
import { RendererName, initRenderer } from './blockly/custom_renderer';
import * as blocklyShadow from './blockly/extension_shadow';
import { registerExtensions } from './blockly/extensions';

import * as notify from './blockly/lib';
import * as Themes from './blockly/themes';
import { Toolbox } from './blockly/toolbox';
import * as BlocklyVars from './blockly/variables';

Blockly.setLocale(De as unknown as { [key: string]: string });

const BlocklyEditor: React.FunctionComponent = () => {
    const blocklyEditorRef = useRef<HTMLDivElement>(null);

    const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);

    const { isDarkMode } = useTernaryDarkMode();

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
        initRenderer();

        workspaceRef.current = Blockly.inject(blocklyEditorRef.current, {
            toolbox: Toolbox,
            //renderer: 'thrasos',
            //renderer: 'zelos',
            renderer: RendererName,
            //renderer: 'geras',
            sounds: true,
            collapse: false,
            disable: false,
            comments: true,
            media: './blockly/',
            theme: isDarkMode ? Themes.darkTheme : Themes.defaultTheme,
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

    useEffect(() => {
        workspaceRef.current?.setTheme(
            isDarkMode ? Themes.darkTheme : Themes.defaultTheme,
        );
    }, [isDarkMode]);

    return (
        <>
            <div className={'pb-editor-blockly'} ref={blocklyEditorRef} />
        </>
    );
};

export default BlocklyEditor;
