// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { Button, Code, Intent } from '@blueprintjs/core';
import { Duplicate, Error } from '@blueprintjs/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { CreateToast } from '../../toasterTypes';
import { isIOS, isLinux } from '../../utils/os';

const NoWebBluetooth: React.FunctionComponent = () => {
    const { t } = useTranslation('bleAlerts');
    return (
        <>
            <p>{t('noWebBluetooth.message')}</p>
            {!isLinux() && !isIOS() && <p>{t('noWebBluetooth.suggestion')}</p>}
            {isLinux() && (
                <>
                    <p>{t('noWebBluetooth.linux')}</p>
                    <p>
                        <Code>
                            chrome://flags/#enable-experimental-web-platform-features
                        </Code>
                        <Button
                            icon={<Duplicate />}
                            small={true}
                            minimal={true}
                            onClick={() =>
                                navigator.clipboard.writeText(
                                    'chrome://flags/#enable-experimental-web-platform-features',
                                )
                            }
                        />
                    </p>
                </>
            )}
        </>
    );
};

export const noWebBluetooth: CreateToast = (onAction) => ({
    message: <NoWebBluetooth />,
    icon: <Error />,
    intent: Intent.DANGER,
    onDismiss: () => onAction('dismiss'),
});
