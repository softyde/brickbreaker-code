// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { Intent } from '@blueprintjs/core';
import { Error } from '@blueprintjs/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { CreateToast } from '../../toasterTypes';

type MissingServiceProps = {
    serviceName: string;
    hubName: string;
};

const MissingService: React.FunctionComponent<MissingServiceProps> = ({
    serviceName,
    hubName,
}) => {
    const { t } = useTranslation('bleAlerts');
    return (
        <>
            <p>{t('missingService.message', { serviceName })}</p>
            <p>{t('missingService.suggestion1')}</p>
            <p>{t('missingService.suggestion2', { hubName })}</p>
        </>
    );
};

export const missingService: CreateToast<MissingServiceProps> = (onAction, props) => ({
    message: <MissingService {...props} />,
    icon: <Error />,
    intent: Intent.DANGER,
    onDismiss: () => onAction('dismiss'),
});
