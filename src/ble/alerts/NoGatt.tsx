// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { Intent } from '@blueprintjs/core';
import { Error } from '@blueprintjs/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { CreateToast } from '../../toasterTypes';

const NoGatt: React.FunctionComponent = () => {
    const { t } = useTranslation('bleAlerts');
    return <p>{t('noGatt.message')}</p>;
};

export const noGatt: CreateToast = (onAction) => ({
    message: <NoGatt />,
    icon: <Error />,
    intent: Intent.DANGER,
    onDismiss: () => onAction('dismiss'),
});
