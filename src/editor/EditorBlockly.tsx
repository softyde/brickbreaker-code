// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import './editorBlockly.scss';

import * as BlocklyProcedures from '@blockly/block-shareable-procedures';
import { registerFieldMultilineInput } from '@blockly/field-multilineinput';
import { PositionedMinimap } from '@blockly/workspace-minimap';
import { ZoomToFitControl } from '@blockly/zoom-to-fit';

import * as Blockly from 'blockly/core';

import * as De from 'blockly/msg/de';

import React, { useEffect, useRef } from 'react';

import { useDispatch } from 'react-redux';
import { useEffectOnce, useTernaryDarkMode } from 'usehooks-ts';
import Repository from '../blocks/repository';
import { useSelector } from '../reducers';
import { editorHighlightBlockCode, editorToggleSource } from './actions';
import {
    blocklyDidChangeModel,
    blocklyDidChangeVar,
    blocklyDidCreate,
    blocklyDidCreateBlock,
    blocklyDidDeleteBlock,
} from './blockly/actions';
import defaultBlocks from './blockly/blocks';
import { RendererName, initRenderer } from './blockly/custom_renderer';
import * as blocklyShadow from './blockly/extension_shadow';
import { registerExtensions } from './blockly/extensions';

import { ShowSourceControl } from './blockly/show-source-control';
import * as Themes from './blockly/themes';
import { Toolbox } from './blockly/toolbox';
import * as BlocklyVars from './blockly/variables';

Blockly.setLocale(De as unknown as { [key: string]: string });

const BlocklyEditor: React.FunctionComponent = () => {
    const blocklyEditorRef = useRef<HTMLDivElement>(null);

    const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);

    const { highlightedBlock, sourceCode } = useSelector((s) => s.blockly);

    //const { toggleIsSettingShowSourceEnabled } = useSettingIsShowSourceEnabled();

    const { isDarkMode } = useTernaryDarkMode();
    const dispatch = useDispatch();

    function onWorkspaceChange(event: Blockly.Events.Abstract) {
        const workspace = workspaceRef.current;
        if (!workspace) {
            console.warn('WokspaceRef not set');
            return;
        }

        if (event.isUiEvent) {
            if (event.type === Blockly.Events.SELECTED) {
                const selected = event as Blockly.Events.Selected;

                let styleName: string | undefined;

                if (selected.newElementId) {
                    const block = workspace.getBlockById(selected.newElementId);

                    styleName = block?.getStyleName();
                }

                dispatch(editorHighlightBlockCode(selected.newElementId, styleName));
            }
        }

        if (event.type === Blockly.Events.BLOCK_DELETE) {
            console.log('*** DELETED');

            const deleted = event as Blockly.Events.BlockDelete;

            if (!deleted.ids) {
                throw 'empty id list';
            }

            for (let i = 0; i < deleted.ids.length; i++) {
                dispatch(blocklyDidDeleteBlock(deleted.ids[i]));
            }
        }

        if (event.type === Blockly.Events.BLOCK_CREATE) {
            console.log('*** CREATED');

            const created = event as Blockly.Events.BlockCreate;

            if (!created.ids) {
                throw 'empty id list';
            }

            for (let i = 0; i < created.ids.length; i++) {
                dispatch(blocklyDidCreateBlock(created.ids[i]));
            }
        }

        if (event.type === Blockly.Events.BLOCK_CHANGE) {
            console.log('*** CHANGED');

            const changed = event as Blockly.Events.BlockChange;

            if (changed.element === 'field' && changed.name?.startsWith('VAR.')) {
                console.log(changed);
                dispatch(
                    blocklyDidChangeVar(
                        changed.blockId!,
                        changed.name,
                        changed.oldValue as string,
                        changed.newValue as string,
                    ),
                );
            }

            console.log(changed);
        }

        dispatch(editorHighlightBlockCode());

        if (!event.isUiEvent) {
            const state = Blockly.serialization.workspaces.save(workspace);

            const value = JSON.stringify(state);

            dispatch(blocklyDidChangeModel(value));
        }
    }

    useEffect(() => {
        if (!workspaceRef.current) {
            return;
        }

        if (highlightedBlock !== null) {
            const block = workspaceRef.current.getBlockById(highlightedBlock);

            if (block) {
                const svgWorkspace = workspaceRef.current as Blockly.WorkspaceSvg;
                svgWorkspace.highlightBlock(block.id);
            }
        } else {
            const block = workspaceRef.current.getAllBlocks();

            if (block.length > 0) {
                const svgWorkspace = workspaceRef.current as Blockly.WorkspaceSvg;

                svgWorkspace.highlightBlock(block[0].id);
                svgWorkspace.highlightBlock(block[0].id, false);
            }
        }
    }, [highlightedBlock]);

    useEffect(() => {
        if (!workspaceRef.current) {
            return;
        }

        console.debug('Load blockly source code');

        const data = sourceCode !== null ? JSON.parse(sourceCode) : {};

        Blockly.serialization.workspaces.load(data, workspaceRef.current, {
            recordUndo: false,
        });
    }, [sourceCode]);

    useEffectOnce(() => {
        // istanbul ignore if: should never happen
        if (!blocklyEditorRef.current) {
            console.error('no blocklyEditorRef!');
            return;
        }

        // registerFirstContextMenuOptions();
        BlocklyProcedures.unregisterProcedureBlocks();
        Blockly.common.defineBlocks(BlocklyProcedures.blocks);
        BlocklyProcedures.registerProcedureSerializer();

        BlocklyVars.initCustomVariableHandling();

        blocklyShadow.registerExtension();

        registerExtensions();

        registerFieldMultilineInput();

        const blocks = [...defaultBlocks, ...Repository.getBlocks()];

        Blockly.defineBlocksWithJsonArray(blocks);

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

        //  Blockly.ContextMenuItems.registerCommentOptions();
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
            comments: false,
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

        // Initialize plugin.
        const minimap = new PositionedMinimap(workspaceRef.current);
        minimap.init();

        // Initialize plugin.
        const zoomToFit = new ZoomToFitControl(workspaceRef.current);
        zoomToFit.init();

        const showSource = new ShowSourceControl(workspaceRef.current, () => {
            dispatch(editorToggleSource());
        });
        showSource.init();

        // Führe initiales Resize durch
        resizeBlockly();

        /*window.setTimeout(function () {
            console.log('sadfsdfasdf');
            resizeBlockly();
        }, 5000);*/

        console.debug('Blockly workspaceRef created');

        console.debug('Adding workspace change listener');
        workspaceRef.current.addChangeListener(onWorkspaceChange);

        dispatch(blocklyDidCreate(workspaceRef.current));

        return () => {
            console.debug('Removing workspace change listener');
            workspaceRef.current?.removeChangeListener(onWorkspaceChange);
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
            if (metrics && metrics.contentHeight > 0) {
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
