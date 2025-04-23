// SPDX-License-Identifier: MIT
// Copyright (c) 2023 The Pybricks Authors

import { Intent } from '@blueprintjs/core';
import { WarningSign } from '@blueprintjs/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { appName } from '../../app/constants';
import type { CreateToast } from '../../toasterTypes';

type NewPybricksProfileProps = {
    /** The Pybricks Profile version reported by the hub. */
    hubVersion: string;
    /** The supported Pybricks Profile version. */
    supportedVersion: string;
};

const NewPybricksProfile: React.FunctionComponent<NewPybricksProfileProps> = ({
    hubVersion,
    supportedVersion,
}) => {
    const { t } = useTranslation('bleAlerts');
    return (
        <>
            <p>{t('newPybricksProfile.message')}</p>
            <p>
                {t('newPybricksProfile.versions', {
                    hubVersion: `v${hubVersion}`,
                    app: appName,
                    appVersion: `v${supportedVersion}`,
                })}
            </p>
            <p>
                {t('newPybricksProfile.suggestion', {
                    app: appName,
                })}
            </p>
        </>
    );
};

export const newPybricksProfile: CreateToast<NewPybricksProfileProps> = (
    onAction,
    props,
) => ({
    message: <NewPybricksProfile {...props} />,
    icon: <WarningSign />,
    intent: Intent.WARNING,
    timeout: 15000, // long message, need more time to read
    onDismiss: () => onAction('dismiss'),
});
