// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2023 The Pybricks Authors

import './settings.scss';
import {
    AnchorButton,
    ButtonGroup,
    ControlGroup,
    FormGroup,
    Switch,
} from '@blueprintjs/core';
import {
    Add,
    Chat,
    Download,
    Help,
    InfoSign,
    Lightbulb,
    Refresh,
    Virus,
} from '@blueprintjs/icons';
import React, { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useTernaryDarkMode } from 'usehooks-ts';
import AboutDialog from '../about/AboutDialog';
import { appCheckForUpdate, appReload, appShowInstallPrompt } from '../app/actions';
import {
    legoRegisteredTrademark,
    pybricksBugReportsUrl,
    pybricksGitterUrl,
    pybricksProjectsUrl,
    pybricksSupportUrl,
} from '../app/constants';
import { Button } from '../components/Button';
import ExternalLinkIcon from '../components/ExternalLinkIcon';
import HelpButton from '../components/HelpButton';
import { firmwareInstallPybricks } from '../firmware/actions';
import { firmwareRestoreOfficialDialogShow } from '../firmware/restoreOfficialDialog/actions';
import { useSelector } from '../reducers';
import { tourStart } from '../tour/actions';
import { isMacOS } from '../utils/os';

const Settings: React.FunctionComponent = () => {
    const [isAboutDialogOpen, setIsAboutDialogOpen] = useState(false);
    const { isDarkMode, setTernaryDarkMode } = useTernaryDarkMode();

    const isServiceWorkerRegistered = useSelector(
        (s) => s.app.isServiceWorkerRegistered,
    );
    const checkingForUpdate = useSelector((s) => s.app.checkingForUpdate);
    const updateAvailable = useSelector((s) => s.app.updateAvailable);
    const hasUnresolvedInstallPrompt = useSelector(
        (s) => s.app.hasUnresolvedInstallPrompt,
    );
    const promptingInstall = useSelector((s) => s.app.promptingInstall);
    const readyForOfflineUse = useSelector((s) => s.app.readyForOfflineUse);

    const dispatch = useDispatch();

    const { t } = useTranslation('settings');

    return (
        <div className="pb-settings">
            <FormGroup
                label={t('appearance.title')}
                helperText={
                    <Trans
                        i18nKey="appearance.zoom.help"
                        t={t}
                        components={{
                            in: <span>{isMacOS() ? 'Cmd' : 'Ctrl'}-+</span>,
                            out: <span>{isMacOS() ? 'Cmd' : 'Ctrl'}--</span>,
                        }}
                    />
                }
            >
                <ControlGroup>
                    <Switch
                        label={t('appearance.darkMode.label')}
                        checked={isDarkMode}
                        onChange={(e) =>
                            setTernaryDarkMode(
                                (e.target as HTMLInputElement).checked
                                    ? 'dark'
                                    : 'light',
                            )
                        }
                    />
                    <HelpButton
                        helpForLabel={t('appearance.darkMode.label')}
                        content={t('appearance.darkMode.help')}
                    />
                </ControlGroup>
            </FormGroup>
            <FormGroup label={t('firmware.title')}>
                <Button
                    id="pb-settings-flash-pybricks-button"
                    minimal={true}
                    icon={<Download />}
                    label={t('firmware.flashPybricksButton.label')}
                    onPress={() => dispatch(firmwareInstallPybricks())}
                />
                <Button
                    id="pb-settings-flash-official-button"
                    minimal={true}
                    icon={<Download />}
                    label={t('firmware.flashLegoButton.label', {
                        lego: legoRegisteredTrademark,
                    })}
                    onPress={() => dispatch(firmwareRestoreOfficialDialogShow())}
                />
            </FormGroup>
            <FormGroup label={t('help.title')}>
                <ButtonGroup minimal={true} vertical={true} alignText="left">
                    <Button
                        id="pb-settings-tour-button"
                        label={t('app.tour.label')}
                        icon={<InfoSign />}
                        onPress={() => {
                            dispatch(tourStart());
                            return true;
                        }}
                    />
                    <AnchorButton
                        icon={<Lightbulb />}
                        href={pybricksProjectsUrl}
                        target="blank_"
                    >
                        {t('help.projects.label')}
                        <ExternalLinkIcon />
                    </AnchorButton>
                    <AnchorButton
                        icon={<Help />}
                        href={pybricksSupportUrl}
                        target="blank_"
                    >
                        {t('help.support.label')}
                        <ExternalLinkIcon />
                    </AnchorButton>
                    <AnchorButton
                        icon={<Chat />}
                        href={pybricksGitterUrl}
                        target="blank_"
                    >
                        {t('help.chat.label')}
                        <ExternalLinkIcon />
                    </AnchorButton>
                    <AnchorButton
                        icon={<Virus />}
                        href={pybricksBugReportsUrl}
                        target="blank_"
                    >
                        {t('help.bugs.label')}
                        <ExternalLinkIcon />
                    </AnchorButton>
                    <AboutDialog
                        isOpen={isAboutDialogOpen}
                        onClose={() => setIsAboutDialogOpen(false)}
                    />
                </ButtonGroup>
            </FormGroup>
            <FormGroup
                label={t('app.title')}
                helperText={readyForOfflineUse && t('app.offlineUseHelp')}
            >
                <ButtonGroup minimal={true} vertical={true} alignText="left">
                    {hasUnresolvedInstallPrompt && (
                        <Button
                            label={t('app.install.label')}
                            icon={<Add />}
                            onPress={() => dispatch(appShowInstallPrompt())}
                            loading={promptingInstall}
                        />
                    )}
                    {(process.env.NODE_ENV === 'development' ||
                        (isServiceWorkerRegistered && !updateAvailable)) && (
                        <Button
                            label={t('app.checkForUpdate.label')}
                            icon={<Refresh />}
                            onPress={() => dispatch(appCheckForUpdate())}
                            loading={checkingForUpdate}
                        />
                    )}
                    {(process.env.NODE_ENV === 'development' ||
                        (isServiceWorkerRegistered && updateAvailable)) && (
                        <Button
                            label={t('app.restart.label')}
                            icon={<Refresh />}
                            onPress={() => dispatch(appReload())}
                        />
                    )}
                    <Button
                        label={t('app.about.label')}
                        icon={<InfoSign />}
                        onPress={() => {
                            setIsAboutDialogOpen(true);
                            return true;
                        }}
                    />
                </ButtonGroup>
            </FormGroup>
            {/* {process.env.NODE_ENV === 'development' && (
                <FormGroup label="Developer">
                    <Switch
                        checked={i18n.pseudolocalize !== false}
                        onChange={() => pseudolocalize(!i18n.pseudolocalize)}
                        label="Pseudolocalize"
                    />
                </FormGroup>
            )} */}
        </div>
    );
};

export default Settings;
