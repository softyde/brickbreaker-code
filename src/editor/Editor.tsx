// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2025 The Pybricks Authors

import './editor.scss';
import { Button, Tab, TabId, Tabs, Text } from '@blueprintjs/core';
import { Cross, Manual } from '@blueprintjs/icons';
import * as Blockly from 'blockly/core';
import React, { useCallback, useEffect, useRef } from 'react';
import { useId } from 'react-aria';
import { useDispatch } from 'react-redux';
import { useEffectOnce } from 'usehooks-ts';
import { UUID } from '../fileStorage';
import { useFileStoragePath } from '../fileStorage/hooks';
import { blockyFileExtension } from '../pybricksMicropython/lib';
import { useSelector } from '../reducers';
import { useSettingIsShowDocsEnabled } from '../settings/hooks';
import EditorText from './EditorText';
import { editorActivateFile, editorCloseFile } from './actions';
import { useI18n } from './i18n';

type FileNameProps = {
    /** The DOM ID. */
    id: string;
    /** The file UUID. */
    uuid: UUID;
    /** Called when the file name changes. */
    onNameChanged: () => void;
};

const TabLabel: React.FunctionComponent<FileNameProps> = ({
    id,
    uuid,
    onNameChanged,
}) => {
    const fileName = useFileStoragePath(uuid);

    useEffect(() => {
        onNameChanged?.();
    }, [fileName, onNameChanged]);

    return (
        <Text tagName="span" id={id} ellipsize={true}>
            {fileName}
        </Text>
    );
};

type TabCloseButtonProps = {
    /** The file UUID. */
    uuid: UUID;
};

const TabCloseButton: React.FunctionComponent<TabCloseButtonProps> = ({ uuid }) => {
    const fileName = useFileStoragePath(uuid) ?? '';
    const dispatch = useDispatch();
    const i18n = useI18n();

    return (
        <Button
            title={i18n.translate('closeFile.tooltip', {
                fileName,
            })}
            minimal={true}
            small={true}
            icon={<Cross />}
            // tabs are closed with delete button by keyboard, so
            // don't focus the close button
            tabIndex={-1}
            onFocus={(e) => e.preventDefault()}
            onClick={(e) => {
                dispatch(editorCloseFile(uuid));
                // prevent triggering Tabs onChange
                e.stopPropagation();
            }}
        />
    );
};

type EditorTabsProps = Readonly<{
    /** Called when the selected tab changes. */
    onChange?: () => void;
}>;

const EditorTabs: React.FunctionComponent<EditorTabsProps> = ({ onChange }) => {
    const openFiles = useSelector((s) => s.editor.openFileUuids);
    const activeFile = useSelector((s) => s.editor.activeFileUuid);
    const dispatch = useDispatch();

    const handleChange = useCallback(
        (newTabId: TabId) => {
            dispatch(editorActivateFile(newTabId as UUID));
            onChange?.();
        },
        [dispatch, onChange],
    );

    const labelId = useId();

    // close tab when delete key is pressed
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent, uuid: UUID) => {
            if (e.key === 'Delete') {
                dispatch(editorCloseFile(uuid));
                e.preventDefault();
                e.stopPropagation();
            }
        },
        [dispatch],
    );

    // close tab when middle-clicked
    // NB: this has to be on mouse up event to prevent middle-click paste on Linux
    const handleMouseUp = useCallback(
        (e: React.MouseEvent, uuid: UUID) => {
            if (e.button === 1) {
                dispatch(editorCloseFile(uuid));
                e.preventDefault();
                e.stopPropagation();
            }
        },
        [dispatch],
    );

    const tabsRef = useRef<Tabs>(null);

    // HACK: call private Tabs method to fix selection indicator animation when
    // a file is renamed
    const handleNameChanged = useCallback(() => {
        tabsRef.current?.['moveSelectionIndicator']();
    }, [tabsRef]);

    const i18n = useI18n();

    useEffect(() => {
        // @ts-expect-error: using private property
        const tablist: HTMLDivElement = tabsRef.current?.tablistElement;

        // istanbul-ignore-if: should not happen
        if (!tablist) {
            return;
        }

        tablist.setAttribute('aria-label', i18n.translate('tablist.label'));
    }, [i18n]);

    return (
        <Tabs
            className="pb-editor-tablist"
            selectedTabId={activeFile || undefined}
            ref={tabsRef}
            onChange={handleChange}
        >
            {openFiles.map((uuid) => (
                <Tab
                    className="pb-editor-tablist-tab"
                    aria-labelledby={`${labelId}.${uuid}`}
                    key={uuid}
                    id={uuid}
                    onKeyDown={(e) => handleKeyDown(e, uuid)}
                    onMouseUp={(e) => handleMouseUp(e, uuid)}
                >
                    <TabLabel
                        id={`${labelId}.${uuid}`}
                        uuid={uuid}
                        onNameChanged={handleNameChanged}
                    />
                    <TabCloseButton uuid={uuid} />
                </Tab>
            ))}
        </Tabs>
    );
};

const Editor: React.FunctionComponent = () => {
    const { isSettingShowDocsEnabled, toggleIsSettingShowDocsEnabled } =
        useSettingIsShowDocsEnabled();

    const i18n = useI18n();

    const blocklyEditorRef = useRef<HTMLDivElement>(null);

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

        Blockly.inject(blocklyEditorRef.current, {
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

        return () => {
            //setEditor(undefined);
        };
    });

    //const isEmpty = useSelector((s) => s.editor.openFileUuids.length === 0);
    const { activeFileUuid } = useSelector((s) => s.editor);
    const fileName = useFileStoragePath(activeFileUuid ?? ('' as UUID));
    const isBlocky = fileName?.endsWith(blockyFileExtension);

    return (
        <div className="pb-editor">
            <EditorTabs /* onChange={() => editor?.focus()} */ />
            <div
                className={isBlocky ? 'pb-editor-blockly' : 'pb-editor-hidden'}
                ref={blocklyEditorRef}
            />
            <EditorText></EditorText>

            <Button
                className="pb-editor-doc-button"
                minimal
                large
                icon={<Manual />}
                title={
                    isSettingShowDocsEnabled
                        ? i18n.translate('docs.hide')
                        : i18n.translate('docs.show')
                }
                onClick={toggleIsSettingShowDocsEnabled}
            />
        </div>
    );
};

export default Editor;
