// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { Intent } from '@blueprintjs/core';
import { Error } from '@blueprintjs/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { CreateToast } from '../../toasterTypes';

const NoDfuInterface: React.FunctionComponent = () => {
    const { t } = useTranslation('firmwareAlerts');
    return <p>{t('noDfuInterface.message')}</p>;
};

export const noDfuInterface: CreateToast = (onAction) => ({
    message: <NoDfuInterface />,
    icon: <Error />,
    intent: Intent.DANGER,
    onDismiss: () => onAction('dismiss'),
});
