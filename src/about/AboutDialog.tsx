// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2023 The Pybricks Authors

// The about dialog

import { AnchorButton, Button, Classes, Dialog } from '@blueprintjs/core';
import { firmwareVersion } from '@pybricks/firmware';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    appName,
    appVersion,
    changelogUrl,
    legoDisclaimer,
    legoRegisteredTrademark,
    pybricksCopyright,
    pybricksWebsiteUrl,
} from '../app/constants';
import ExternalLinkIcon from '../components/ExternalLinkIcon';
import LicenseDialog from '../licenses/LicenseDialog';
import icon from './icon.svg';

import './about.scss';

type AboutDialogProps = { isOpen: boolean; onClose: () => void };

const AboutDialog: React.FunctionComponent<AboutDialogProps> = ({
    isOpen,
    onClose,
}) => {
    const [isLicenseDialogOpen, setIsLicenseDialogOpen] = useState(false);

    const { t } = useTranslation('about');

    return (
        <Dialog title={t('title', { appName })} isOpen={isOpen} onClose={onClose}>
            <div className={Classes.DIALOG_BODY}>
                <div className="pb-about-icon">
                    <img src={icon} alt="Pybricks logo" />
                </div>
                <p>
                    <strong>
                        {t('description', {
                            lego: legoRegisteredTrademark,
                        })}
                    </strong>
                </p>
                <p>{`v${firmwareVersion} (${appName} v${appVersion})`}</p>
                <p>{pybricksCopyright}</p>
            </div>
            <div className={Classes.DIALOG_FOOTER}>
                <p>
                    <small>{legoDisclaimer}</small>
                </p>
                <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                    <Button onClick={() => setIsLicenseDialogOpen(true)}>
                        {t('licenseButton.label')}
                    </Button>
                    <AnchorButton href={changelogUrl} target="blank_">
                        {t('changelogButton.label')}
                        <ExternalLinkIcon />
                    </AnchorButton>
                    <AnchorButton href={pybricksWebsiteUrl} target="blank_">
                        {t('websiteButton.label')}
                        <ExternalLinkIcon />
                    </AnchorButton>
                </div>
            </div>
            <LicenseDialog
                isOpen={isLicenseDialogOpen}
                onClose={() => setIsLicenseDialogOpen(false)}
            />
        </Dialog>
    );
};

export default AboutDialog;
