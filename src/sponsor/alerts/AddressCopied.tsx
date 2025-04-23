// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { Intent } from '@blueprintjs/core';
import { InfoSign } from '@blueprintjs/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { CreateToast } from '../../toasterTypes';

const AddressCopied: React.FunctionComponent = () => {
    const { t } = useTranslation('sponsorAlerts');
    return <p>{t('addressCopied.message')}</p>;
};

export const addressCopied: CreateToast = (onAction) => {
    return {
        message: <AddressCopied />,
        icon: <InfoSign />,
        intent: Intent.PRIMARY,
        timeout: 5000,
        onDismiss: () => onAction('dismiss'),
    };
};
