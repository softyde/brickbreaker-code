// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { Intent } from '@blueprintjs/core';
import { InfoSign } from '@blueprintjs/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { CreateToast } from '../../toasterTypes';

const ReleaseButton: React.FunctionComponent = () => {
    const { t } = useTranslation('firmwareAlerts');
    return <p>{t('releaseButton.message')}</p>;
};

export const releaseButton: CreateToast = (onAction) => ({
    message: <ReleaseButton />,
    icon: <InfoSign />,
    intent: Intent.PRIMARY,
    onDismiss: () => onAction('dismiss'),
});
