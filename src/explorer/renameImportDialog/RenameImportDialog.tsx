// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { Button, Classes, Dialog } from '@blueprintjs/core';
import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { appName } from '../../app/constants';
import { useFileStorageMetadata } from '../../fileStorage/hooks';
import {
    FileNameValidationResult,
    validateFileName,
} from '../../pybricksMicropython/lib';
import { useSelector } from '../../reducers';
import FileNameFormGroup from '../fileNameFormGroup/FileNameFormGroup';
import { renameImportDialogDidAccept, renameImportDialogDidCancel } from './actions';

const RenameImportDialog: React.FunctionComponent = () => {
    const { t } = useTranslation('renameImport');
    const dispatch = useDispatch();
    const isOpen = useSelector((s) => s.explorer.renameImportDialog.isOpen);
    const oldName = useSelector((s) => s.explorer.renameImportDialog.fileName);

    const [baseName, extension] = oldName.split(/(\.\w+)$/);

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
            dispatch(renameImportDialogDidAccept(oldName, `${newName}${extension}`));
        },
        [dispatch, oldName, newName, extension],
    );

    const handleClose = useCallback(() => {
        dispatch(renameImportDialogDidCancel());
    }, [dispatch]);

    return (
        <Dialog
            title={t('title')}
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
                    <p>{t('message', { fileName: oldName, appName })}</p>
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
                        <Button intent="none" onClick={handleClose}>
                            {t('action.skip')}
                        </Button>
                        <Button
                            intent="primary"
                            disabled={result !== FileNameValidationResult.IsOk}
                            type="submit"
                        >
                            {t('action.rename')}
                        </Button>
                    </div>
                </div>
            </form>
        </Dialog>
    );
};

export default RenameImportDialog;
