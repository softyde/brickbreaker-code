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

        Blockly.defineBlocksWithJsonArray([
            {
                type: 'string_length',
                message0: 'Sensorwert von %1',
                args0: [
                    {
                        type: 'input_value',
                        name: 'VALUE',
                        check: 'String',
                    },
                ],
                output: 'Number',
                colour: 160,
                tooltip: 'Returns number of letters in the provided text.',
                helpUrl: 'http://www.w3schools.com/jsref/jsref_length_string.asp',
            },
            {
                type: 'xxx',
                message0: 'Setze %1 auf %2',
                args0: [
                    {
                        type: 'field_variable',
                        name: 'VAR',
                        variable: 'Geschwindigkeit',
                        variableTypes: [''],
                    },
                    {
                        type: 'input_value',
                        name: 'VALUE',
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
                    name: 'Bla',
                    categorystyle: 'logic_category',
                    colour: '160',
                    contents: [
                        {
                            kind: 'block',
                            type: 'string_length',
                        },
                    ],
                },
                {
                    kind: 'category',
                    name: 'Fasel',
                    colour: '210',
                    contents: [
                        {
                            kind: 'block',
                            type: 'xxx',
                        },
                    ],
                },
            ],
        };

        Blockly.inject(blocklyEditorRef.current, {
            toolbox: toolbox,
            sounds: true,
            media: './blockly/',
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
