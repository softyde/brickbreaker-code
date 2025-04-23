// SPDX-License-Identifier: MIT
// Copyright (c) 2023 The Pybricks Authors

import { Intent } from '@blueprintjs/core';
import { InfoSign } from '@blueprintjs/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { pythonFileExtension } from '../../pybricksMicropython/lib';
import type { CreateToast } from '../../toasterTypes';

const NoPyFiles: React.FunctionComponent = () => {
    const { t } = useTranslation('explorerAlerts');
    return (
        <>
            {t('noPyFiles.message', {
                py: <code>{pythonFileExtension}</code>,
                zip: 'ZIP',
            })}
        </>
    );
};

export const noPyFiles: CreateToast = (onAction) => ({
    message: <NoPyFiles />,
    icon: <InfoSign />,
    intent: Intent.PRIMARY,
    onDismiss: () => onAction('dismiss'),
});
