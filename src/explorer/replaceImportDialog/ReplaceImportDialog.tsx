// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import './replaceImportDialog.scss';
import { Button, Checkbox, Classes, Dialog, Intent } from '@blueprintjs/core';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useSelector } from '../../reducers';
import {
    ReplaceImportDialogAction,
    replaceImportDialogDidAccept,
    replaceImportDialogDidCancel,
} from './actions';

const RenameImportDialog: React.FunctionComponent = () => {
    const { t } = useTranslation('replaceImport');
    const dispatch = useDispatch();
    const isOpen = useSelector((s) => s.explorer.replaceImportDialog.isOpen);
    const fileName = useSelector((s) => s.explorer.replaceImportDialog.fileName);
    const [remember, setRemember] = useState(false);

    const handleSubmit = useCallback<React.FormEventHandler>(
        (e) => {
            e.preventDefault();
            dispatch(
                replaceImportDialogDidAccept(
                    ((e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement)
                        .value as ReplaceImportDialogAction,
                    remember,
                ),
            );
        },
        [dispatch, remember],
    );

    const handleClose = useCallback(() => {
        dispatch(replaceImportDialogDidCancel());
    }, [dispatch]);

    return (
        <Dialog
            className="pb-explorer-replaceImportDialog"
            title={t('title')}
            isOpen={isOpen}
            onOpening={() => setRemember(false)}
            onClose={handleClose}
        >
            <form onSubmit={handleSubmit} method="dialog">
                <div className={Classes.DIALOG_BODY}>
                    <p>{t('message', { fileName })}</p>
                </div>
                <div className={Classes.DIALOG_FOOTER}>
                    <Checkbox
                        checked={remember}
                        onChange={(e) =>
                            setRemember((e.target as HTMLInputElement).checked)
                        }
                    >
                        {t('option.remember')}
                    </Checkbox>
                    <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                        <Button
                            intent="none"
                            type="submit"
                            value={ReplaceImportDialogAction.Skip}
                        >
                            {t('action.skip')}
                        </Button>
                        <Button
                            intent={Intent.DANGER}
                            type="submit"
                            value={ReplaceImportDialogAction.Replace}
                        >
                            {t('action.replace')}
                        </Button>
                        <Button
                            intent={Intent.PRIMARY}
                            type="submit"
                            value={ReplaceImportDialogAction.Rename}
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
