// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { Intent } from '@blueprintjs/core';
import { Error } from '@blueprintjs/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { CreateToast } from '../../toasterTypes';

const BluetoothNotAvailable: React.FunctionComponent = () => {
    const { t } = useTranslation('bleAlerts');
    return (
        <>
            <p>{t('bluetoothNotAvailable.message')}</p>
            <p>{t('bluetoothNotAvailable.suggestion')}</p>
            <p>{t('bluetoothNotAvailable.browserSupport')}</p>
        </>
    );
};

export const bluetoothNotAvailable: CreateToast = (onAction) => ({
    message: <BluetoothNotAvailable />,
    icon: <Error />,
    intent: Intent.DANGER,
    onDismiss: () => onAction('dismiss'),
});
