// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { AnchorButton, Button, Intent } from '@blueprintjs/core';
import { Download, Help, InfoSign } from '@blueprintjs/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    pybricksUsbDfuTroubleshootingUrl,
    pybricksUsbLinuxUdevRulesUrl,
} from '../../app/constants';
import ExternalLinkIcon from '../../components/ExternalLinkIcon';
import type { CreateToast } from '../../toasterTypes';
import { isLinux, isWindows } from '../../utils/os';

type NoDfuHubProps = {
    onInstallWindowsDriver: () => void;
};

const NoDfuHub: React.FunctionComponent<NoDfuHubProps> = ({
    onInstallWindowsDriver,
}) => {
    const { t } = useTranslation('firmwareAlerts');

    return (
        <>
            <p>{t('noDfuHub.message')}</p>

            {isWindows() && <p>{t('noDfuHub.suggestion1.windows')}</p>}
            {isLinux() && <p>{t('noDfuHub.suggestion1.linux')}</p>}
            <div className="pb-ble-alerts-buttons">
                {isWindows() && (
                    <Button icon={<Download />} onClick={onInstallWindowsDriver}>
                        {t('noDfuHub.installUsbDriverButton')}
                    </Button>
                )}
                {isLinux() && (
                    <AnchorButton
                        icon={<Help />}
                        href={pybricksUsbLinuxUdevRulesUrl}
                        target="_blank"
                        rel="noopener"
                    >
                        {t('noDfuHub.configureUdevRulesButton')}
                        <ExternalLinkIcon />
                    </AnchorButton>
                )}
                <AnchorButton
                    icon={<Help />}
                    href={pybricksUsbDfuTroubleshootingUrl}
                    target="_blank"
                    rel="noopener"
                >
                    {t('noDfuHub.troubleshootButton')}
                    <ExternalLinkIcon />
                </AnchorButton>
            </div>
        </>
    );
};

export const noDfuHub: CreateToast<never, 'dismiss' | 'installWindowsDriver'> = (
    onAction,
) => ({
    message: (
        <NoDfuHub onInstallWindowsDriver={() => onAction('installWindowsDriver')} />
    ),
    icon: <InfoSign />,
    intent: Intent.PRIMARY,
    onDismiss: () => onAction('dismiss'),
});
