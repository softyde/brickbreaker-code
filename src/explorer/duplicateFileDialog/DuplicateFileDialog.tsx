// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { Button, Classes, Dialog } from '@blueprintjs/core';
import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useFileStorageMetadata } from '../../fileStorage/hooks';
import {
    FileNameValidationResult,
    validateFileName,
} from '../../pybricksMicropython/lib';
import { useSelector } from '../../reducers';
import FileNameFormGroup from '../fileNameFormGroup/FileNameFormGroup';
import { duplicateFileDialogDidAccept, duplicateFileDialogDidCancel } from './actions';

const DuplicateFileDialog: React.FunctionComponent = () => {
    const { t } = useTranslation('duplicateFile');
    const dispatch = useDispatch();
    const isOpen = useSelector((s) => s.explorer.duplicateFileDialog.isOpen);
    const oldName = useSelector((s) => s.explorer.duplicateFileDialog.fileName);

    const indexDot = oldName.indexOf('.');
    const baseName = oldName.substring(0, indexDot);
    const extension = oldName.slice(indexDot);

    const [newName, setNewName] = useState(baseName);
    const files = useFileStorageMetadata() ?? [];
    const result = validateFileName(
        newName,
        extension,
        files.map((f) => f.path),
    );

    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = useCallback<React.FormEventHandler>(
        (e) => {
            e.preventDefault();
            dispatch(duplicateFileDialogDidAccept(oldName, `${newName}${extension}`));
        },
        [dispatch, oldName, newName, extension],
    );

    const handleClose = useCallback(() => {
        dispatch(duplicateFileDialogDidCancel());
    }, [dispatch]);

    return (
        <Dialog
            title={t('title', {
                fileName: oldName,
            })}
            isOpen={isOpen}
            onOpening={() => setNewName(baseName)}
            onOpened={() => {
                inputRef.current?.select();
                inputRef.current?.focus();
            }}
            onClose={handleClose}
        >
            <form onSubmit={handleSubmit}>
                <div className={Classes.DIALOG_BODY}>
                    <FileNameFormGroup
                        fileName={newName}
                        fileExtension={extension}
                        validationResult={result}
                        inputRef={inputRef}
                        onChange={setNewName}
                    />
                </div>
                <div className={Classes.DIALOG_FOOTER}>
                    <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                        <Button
                            intent="primary"
                            disabled={result !== FileNameValidationResult.IsOk}
                            type="submit"
                        >
                            {t('action.accept')}
                        </Button>
                    </div>
                </div>
            </form>
        </Dialog>
    );
};

export default DuplicateFileDialog;
