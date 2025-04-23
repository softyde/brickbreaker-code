// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import './index.scss';
import { Button, Intent } from '@blueprintjs/core';
import { Download, InfoSign } from '@blueprintjs/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { CreateToast } from '../../toasterTypes';

type OldFirmwareProps = {
    onFlashFirmware: () => void;
};

const OldFirmware: React.FunctionComponent<OldFirmwareProps> = ({
    onFlashFirmware,
}) => {
    const { t } = useTranslation('bleAlerts');

    return (
        <>
            <p>{t('oldFirmware.message')}</p>
            <div className="pb-ble-alerts-buttons">
                <Button icon={<Download />} onClick={onFlashFirmware}>
                    {t('oldFirmware.flashFirmware.label')}
                </Button>
            </div>
        </>
    );
};

export const oldFirmware: CreateToast<never, 'dismiss' | 'flashFirmware'> = (
    onAction,
) => ({
    message: <OldFirmware onFlashFirmware={() => onAction('flashFirmware')} />,
    icon: <InfoSign />,
    intent: Intent.PRIMARY,
    onDismiss: () => onAction('dismiss'),
});
