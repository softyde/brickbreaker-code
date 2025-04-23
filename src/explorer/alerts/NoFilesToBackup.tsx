// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { Icon, Intent } from '@blueprintjs/core';
import { InfoSign, Plus } from '@blueprintjs/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { CreateToast } from '../../toasterTypes';

const NoFilesToBackup: React.FunctionComponent = () => {
    const { t } = useTranslation('explorerAlerts');
    return (
        <>
            {t('noFilesToBackup.message', {
                icon: <Icon icon={<Plus />} />,
            })}
        </>
    );
};

export const noFilesToBackup: CreateToast = (onAction) => ({
    message: <NoFilesToBackup />,
    icon: <InfoSign />,
    intent: Intent.PRIMARY,
    onDismiss: () => onAction('dismiss'),
});
