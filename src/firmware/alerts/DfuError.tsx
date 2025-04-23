// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { Button, Intent } from '@blueprintjs/core';
import { Error } from '@blueprintjs/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { CreateToast } from '../../toasterTypes';

type DfuErrorProps = {
    onTryAgain: () => void;
};

const DfuError: React.FunctionComponent<DfuErrorProps> = ({ onTryAgain }) => {
    const { t } = useTranslation('firmwareAlerts');
    return (
        <>
            <p>{t('dfuError.message')}</p>
            <p>{t('dfuError.suggestion')}</p>
            <Button onClick={onTryAgain}>{t('dfuError.tryAgainButton')}</Button>
        </>
    );
};

export const dfuError: CreateToast<never, 'dismiss' | 'tryAgain'> = (onAction) => ({
    message: <DfuError onTryAgain={() => onAction('tryAgain')} />,
    icon: <Error />,
    intent: Intent.DANGER,
    onDismiss: () => onAction('dismiss'),
});
