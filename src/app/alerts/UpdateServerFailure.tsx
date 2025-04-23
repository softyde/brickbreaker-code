// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { Intent } from '@blueprintjs/core';
import { Error } from '@blueprintjs/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { CreateToast } from '../../toasterTypes';

const UpdateServerFailure: React.FunctionComponent = () => {
    const { t } = useTranslation('appAlerts');
    return <p>{t('updateServerFailure.message')}</p>;
};

export const updateServerFailure: CreateToast = (onAction) => ({
    message: <UpdateServerFailure />,
    icon: <Error />,
    intent: Intent.DANGER,
    onDismiss: () => onAction('dismiss'),
});
