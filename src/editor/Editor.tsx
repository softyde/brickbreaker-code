// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2025 The Pybricks Authors

import './editor.scss';
import { Button, Tab, TabId, Tabs, Text } from '@blueprintjs/core';
import { Cross } from '@blueprintjs/icons';
import React, { useCallback, useEffect, useRef } from 'react';
import { useId } from 'react-aria';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import SplitterLayout from 'react-splitter-layout';
import { useLocalStorage } from 'usehooks-ts';
import { UUID } from '../fileStorage';
import { useFileStoragePath } from '../fileStorage/hooks';
import { blocklyFileExtension } from '../pybricksMicropython/lib';
import { useSelector } from '../reducers';
import BlocklyEditor from './EditorBlockly';
import EditorText from './EditorText';
import { editorActivateFile, editorCloseFile } from './actions';

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
    const { t } = useTranslation('editor');

    return (
        <Button
            title={t('closeFile.tooltip', {
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

    const { t } = useTranslation('editor');

    useEffect(() => {
        // @ts-expect-error: using private property
        const tablist: HTMLDivElement = tabsRef.current?.tablistElement;

        // istanbul-ignore-if: should not happen
        if (!tablist) {
            return;
        }

        tablist.setAttribute('aria-label', t('tablist.label'));
    }, [t]);

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
    const isEmpty = useSelector((s) => s.editor.openFileUuids.length === 0);
    const { activeFileUuid } = useSelector((s) => s.editor);
    const isVisible = useSelector((s) => s.editor.isSourceVisible);
    const fileName = useFileStoragePath(activeFileUuid ?? ('' as UUID));
    const isBlockly = fileName?.endsWith(blocklyFileExtension);

    const [editorSplit, setEditorSplit] = useLocalStorage('app-editor-split', 30);

    return (
        <div className="pb-editor">
            <EditorTabs /* onChange={() => editor?.focus()} */ />

            <SplitterLayout
                customClassName={
                    (isBlockly && !isEmpty ? 'pb-show-blockly' : 'pb-hide-blockly') +
                    ' ' +
                    (isVisible ? 'pb-show-source' : 'pb-hide-source')
                }
                vertical={false}
                percentage={true}
                secondaryInitialSize={editorSplit}
                onSecondaryPaneSizeChange={setEditorSplit}
            >
                <BlocklyEditor></BlocklyEditor>

                <EditorText></EditorText>
            </SplitterLayout>
        </div>
    );
};

export default Editor;
