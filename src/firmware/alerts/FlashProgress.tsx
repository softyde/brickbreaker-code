// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { Intent, ProgressBar } from '@blueprintjs/core';
import { Download } from '@blueprintjs/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { CreateToast } from '../../toasterTypes';

type FlashProgressProps = {
    action: 'erase' | 'flash';
    progress: number | undefined;
};

const FlashProgress: React.FunctionComponent<FlashProgressProps> = ({
    action,
    progress,
}) => {
    const { t } = useTranslation('firmwareAlerts');

    return (
        <>
            {action === 'erase' && (
                <p>
                    {t('flashProgress.erasing', {
                        percent: progress ? i18n.formatPercentage(progress) : '',
                    })}
                </p>
            )}

            {action === 'flash' && (
                <p>
                    {t('flashProgress.flashing', {
                        percent: progress ? i18n.formatPercentage(progress) : '',
                    })}
                </p>
            )}

            <ProgressBar value={progress} />
        </>
    );
};

export const flashProgress: CreateToast<FlashProgressProps> = (onAction, props) => ({
    message: <FlashProgress {...props} />,
    icon: <Download />,
    intent: Intent.PRIMARY,
    // close one second after progress is complete
    timeout: (props.progress ?? 0) < 1 ? 0 : 1000,
    onDismiss: () => onAction('dismiss'),
});
