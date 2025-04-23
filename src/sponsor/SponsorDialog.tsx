// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import './sponsorsDialog.scss';
import { AnchorButton, Classes, Dialog, Intent } from '@blueprintjs/core';
import { Heart } from '@blueprintjs/icons';
import classNames from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { alertsShowAlert } from '../alerts/actions';
import { pybricksTeamUrl } from '../app/constants';
import ClipboardIcon from '../components/ClipboardIcon';
import ExternalLinkIcon from '../components/ExternalLinkIcon';
import { useSelector } from '../reducers';
import patreonLogo from './Digital-Patreon-Logo_White.png';
import gitHubIcon from './GitHub-Mark-Light-32px.png';
import { sponsorHideDialog } from './actions';
import ethIcon from './eth_logo.svg';
import paypalIcon from './paypal_logo.svg';

const SponsorDialog: React.FunctionComponent = () => {
    const { showDialog } = useSelector((s) => s.sponsor);
    const dispatch = useDispatch();
    const { t } = useTranslation('sponsorDialog');

    return (
        <Dialog
            className="pb-sponsors-dialog"
            title={t('title', { pybricks: 'Pybricks' })}
            isOpen={showDialog}
            onClose={() => dispatch(sponsorHideDialog())}
            icon={<Heart />}
        >
            <div className={classNames(Classes.DIALOG_BODY, Classes.RUNNING_TEXT)}>
                <h4>{t('whoAreWe.heading')}</h4>
                <p>
                    {t('whoAreWe.team.about', {
                        team: (
                            <>
                                <a
                                    href={pybricksTeamUrl}
                                    target="_blank"
                                    rel="noopener"
                                >
                                    {t('whoAreWe.team.team')}
                                </a>
                                <ExternalLinkIcon />
                            </>
                        ),
                    })}
                </p>
                <p>{t('whoAreWe.mission')}</p>

                <h4>{t('whyDonate.heading')}</h4>
                <p>{t('whyDonate.body')}</p>
                <ul>
                    <li>{t('donateReason.keepPybricksFree')}</li>
                    <li>{t('donateReason.supportNewHubs')}</li>
                    <li>{t('donateReason.writeDocs')}</li>
                    <li>{t('donateReason.exploreFeatures')}</li>
                    <li>{t('donateReason.supportOthers')}</li>
                </ul>

                <h4>{t('donateOptions.heading')}</h4>
                <p>{t('donateOptions.options')}</p>
                <p>{t('donateOptions.thanks')}</p>
            </div>
            <div className={Classes.DIALOG_FOOTER}>
                <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                    <AnchorButton
                        large={true}
                        intent={Intent.PRIMARY}
                        icon={<img src={gitHubIcon} width={24} height={24} />}
                        fill={true}
                        href="https://github.com/sponsors/pybricks"
                        target="_blank"
                        rel="noopener"
                    >
                        GitHub Sponsors
                        <ExternalLinkIcon />
                    </AnchorButton>
                    <AnchorButton
                        large={true}
                        intent={Intent.PRIMARY}
                        icon={<img src={patreonLogo} width={24} height={24} />}
                        fill={true}
                        href="https://www.patreon.com/pybricks"
                        target="_blank"
                        rel="noopener"
                    >
                        Patreon
                        <ExternalLinkIcon />
                    </AnchorButton>
                    <AnchorButton
                        large={true}
                        intent={Intent.PRIMARY}
                        icon={<img src={paypalIcon} width={24} height={24} />}
                        fill={true}
                        href="https://paypal.me/pybricks"
                        target="_blank"
                        rel="noopener"
                    >
                        Paypal
                        <ExternalLinkIcon />
                    </AnchorButton>
                    <AnchorButton
                        large={true}
                        intent={Intent.PRIMARY}
                        icon={<img src={ethIcon} width={24} height={24} />}
                        fill={true}
                        onClick={() => {
                            navigator.clipboard.writeText('pybricks.eth');
                            dispatch(alertsShowAlert('sponsor', 'addressCopied'));
                        }}
                    >
                        pybricks.eth
                        <ClipboardIcon />
                    </AnchorButton>
                </div>
            </div>
        </Dialog>
    );
};

export default SponsorDialog;
