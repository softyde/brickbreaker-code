// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { Intent } from '@blueprintjs/core';
import { Error } from '@blueprintjs/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { CreateToast } from '../../toasterTypes';

const Disconnected: React.FunctionComponent = () => {
    const { t } = useTranslation('bleAlerts');
    return <p>{t('disconnected.message')}</p>;
};

export const disconnected: CreateToast = (onAction) => ({
    message: <Disconnected />,
    icon: <Error />,
    intent: Intent.DANGER,
    onDismiss: () => onAction('dismiss'),
});
