// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import {
    Button,
    Classes,
    DialogStep,
    Intent,
    MultistepDialog,
} from '@blueprintjs/core';
import classNames from 'classnames';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import {
    legoEducationSpikeRegisteredTrademark,
    legoMindstormsRegisteredTrademark,
    legoRegisteredTrademark,
} from '../../app/constants';
import { Hub, hubHasUSB } from '../../components/hubPicker';
import { HubPicker } from '../../components/hubPicker/HubPicker';
import { useHubPickerSelectedHub } from '../../components/hubPicker/hooks';
import { useSelector } from '../../reducers';
import { firmwareRestoreOfficialDfu } from '../actions';
import BootloaderInstructions from '../bootloaderInstructions/BootloaderInstructions';
import { firmwareRestoreOfficialDialogHide } from './actions';

const SelectHubPanel: React.FunctionComponent = () => {
    const { t } = useTranslation('restoreOfficial');

    return (
        <div className={classNames(Classes.DIALOG_BODY, Classes.RUNNING_TEXT)}>
            <p>
                {t('selectHubPanel.message', {
                    lego: legoRegisteredTrademark,
                    next: <strong>{t('nextButton.label')}</strong>,
                })}
            </p>
            <div className="pb-spacer" />
            <HubPicker />
        </div>
    );
};

const RestoreFirmwarePanel: React.FunctionComponent = () => {
    const [hubType] = useHubPickerSelectedHub();
    const dispatch = useDispatch();
    const { t } = useTranslation('restoreOfficial');
    const inProgress = useSelector(
        (s) =>
            s.firmware.isFirmwareFlashUsbDfuInProgress ||
            s.firmware.isFirmwareRestoreOfficialDfuInProgress,
    );

    const handleRestoreButtonClick = useCallback(() => {
        dispatch(firmwareRestoreOfficialDfu(hubType));
    }, [dispatch, hubType]);

    return (
        <div className={classNames(Classes.DIALOG_BODY, Classes.RUNNING_TEXT)}>
            <BootloaderInstructions
                hubType={hubType}
                recovery
                flashButtonText={t('restoreFirmwarePanel.flashButton')}
            />
            {hubHasUSB(hubType) ? (
                <>
                    <p>
                        {t('restoreFirmwarePanel.instruction2.updateApp', {
                            app:
                                hubType === Hub.Inventor
                                    ? legoMindstormsRegisteredTrademark
                                    : legoEducationSpikeRegisteredTrademark,
                        })}{' '}
                        {hubType !== Hub.Inventor
                            ? t('restoreFirmwarePanel.instruction2.updateAppVersion')
                            : ''}
                    </p>
                    <div className="pb-spacer" />
                    <Button
                        intent={Intent.PRIMARY}
                        disabled={inProgress}
                        onClick={handleRestoreButtonClick}
                    >
                        {t('restoreFirmwarePanel.flashButton')}
                    </Button>
                </>
            ) : (
                <p>{t('restoreFirmwarePanel.instruction2.ble.message')}</p>
            )}
        </div>
    );
};

const RestoreOfficialDialog: React.FunctionComponent = () => {
    const { isOpen } = useSelector((s) => s.firmware.restoreOfficialDialog);
    const dispatch = useDispatch();
    const { t } = useTranslation('restoreOfficial');

    return (
        <MultistepDialog
            isOpen={isOpen}
            title={t('title', { lego: legoRegisteredTrademark })}
            onClose={() => dispatch(firmwareRestoreOfficialDialogHide())}
            backButtonProps={{ text: t('backButton.label') }}
            nextButtonProps={{ text: t('nextButton.label') }}
            finalButtonProps={{
                text: t('doneButton.label'),
                onClick: () => dispatch(firmwareRestoreOfficialDialogHide()),
            }}
        >
            <DialogStep
                id="hub"
                title={t('selectHubPanel.title')}
                panel={<SelectHubPanel />}
            />
            <DialogStep
                id="restore"
                title={t('restoreFirmwarePanel.title')}
                panel={<RestoreFirmwarePanel />}
            />
        </MultistepDialog>
    );
};

export default RestoreOfficialDialog;
