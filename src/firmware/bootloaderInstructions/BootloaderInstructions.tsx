// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import './bootloaderInstructions.scss';
import { Callout, Intent } from '@blueprintjs/core';
import { WarningSign } from '@blueprintjs/icons';
import classNames from 'classnames';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import {
    legoRegisteredTrademark,
    pybricksUsbLinuxUdevRulesUrl,
} from '../../app/constants';
import ExternalLinkIcon from '../../components/ExternalLinkIcon';
import { Hub, hubHasBluetoothButton, hubHasUSB } from '../../components/hubPicker';
import { isLinux, isWindows } from '../../utils/os';
import { firmwareDfuWindowsDriverInstallDialogDialogShow } from '../dfuWindowsDriverInstallDialog/actions';
import cityHubMp4 from './assets/bootloader-cityhub-540.mp4';
import cityHubVtt from './assets/bootloader-cityhub-metadata.vtt';
import essentialHubMp4 from './assets/bootloader-essentialhub-540.mp4';
import essentialHubVtt from './assets/bootloader-essentialhub-metadata.vtt';
import inventorHubMp4 from './assets/bootloader-inventorhub-540.mp4';
import inventorHubVtt from './assets/bootloader-inventorhub-metadata.vtt';
import moveHubMp4 from './assets/bootloader-movehub-540.mp4';
import moveHubVtt from './assets/bootloader-movehub-metadata.vtt';
import primeHubMp4 from './assets/bootloader-primehub-540.mp4';
import primeHubVtt from './assets/bootloader-primehub-metadata.vtt';
import technicHubMp4 from './assets/bootloader-technichub-540.mp4';
import technicHubVtt from './assets/bootloader-technichub-metadata.vtt';
import cityHubRecoveryMp4 from './assets/recover-cityhub-540.mp4';
import cityHubRecoveryVtt from './assets/recover-cityhub-metadata.vtt';
import moveHubRecoveryMp4 from './assets/recover-movehub-540.mp4';
import moveHubRecoveryVtt from './assets/recover-movehub-metadata.vtt';
import technicHubRecoveryMp4 from './assets/recover-technichub-540.mp4';
import technicHubRecoveryVtt from './assets/recover-technichub-metadata.vtt';

type BootloaderInstructionsProps = {
    /**
     * The instructions and video will be customized for this hub.
     */
    hubType: Hub;
    /**
     * If true, show official firmware recovery video and steps for supported hubs.
     * @default false
     */
    recovery?: boolean;
    /**
     * Flash button name that can be referenced in the instructions.
     */
    flashButtonText: string;
};

const bootloaderDeviceNameMap: ReadonlyMap<Hub, string> = new Map([
    [Hub.City, 'LEGO Bootloader'],
    [Hub.Essential, 'LEGO Technic Small Hub in DFU Mode'],
    [Hub.Inventor, 'LEGO Technic Large Hub in DFU Mode'],
    [Hub.Move, 'LEGO Bootloader'],
    [Hub.Prime, 'LEGO Technic Large Hub in DFU Mode'],
    [Hub.Technic, 'LEGO Bootloader'],
]);

const videoFileMap: ReadonlyMap<Hub, string> = new Map([
    [Hub.City, cityHubMp4],
    [Hub.Essential, essentialHubMp4],
    [Hub.Inventor, inventorHubMp4],
    [Hub.Move, moveHubMp4],
    [Hub.Prime, primeHubMp4],
    [Hub.Technic, technicHubMp4],
]);

const metadataFileMap: ReadonlyMap<Hub, string> = new Map([
    [Hub.City, cityHubVtt],
    [Hub.Essential, essentialHubVtt],
    [Hub.Inventor, inventorHubVtt],
    [Hub.Move, moveHubVtt],
    [Hub.Prime, primeHubVtt],
    [Hub.Technic, technicHubVtt],
]);

const recoveryVideoFileMap: ReadonlyMap<Hub, string> = new Map([
    [Hub.City, cityHubRecoveryMp4],
    [Hub.Essential, essentialHubMp4],
    [Hub.Inventor, inventorHubMp4],
    [Hub.Move, moveHubRecoveryMp4],
    [Hub.Prime, primeHubMp4],
    [Hub.Technic, technicHubRecoveryMp4],
]);

const recoveryMetadataFileMap: ReadonlyMap<Hub, string> = new Map([
    [Hub.City, cityHubRecoveryVtt],
    [Hub.Essential, essentialHubVtt],
    [Hub.Inventor, inventorHubVtt],
    [Hub.Move, moveHubRecoveryVtt],
    [Hub.Prime, primeHubVtt],
    [Hub.Technic, technicHubRecoveryVtt],
]);

function countValidChildren(children: React.ReactNode) {
    return React.Children.toArray(children).filter((child) =>
        React.isValidElement(child),
    ).length;
}

/**
 * Provides customized instructions on how to enter bootloader mode based
 * on the hub type.
 */
const BootloaderInstructions: React.FunctionComponent<BootloaderInstructionsProps> = ({
    hubType,
    recovery,
    flashButtonText,
}) => {
    const dispatch = useDispatch();
    const { t } = useTranslation('bootloaderInstructions');

    const { button, light, lightPattern } = useMemo(() => {
        return {
            button: t(
                hubHasBluetoothButton(hubType) ? 'button.bluetooth' : 'button.power',
            ),
            light: t(
                hubHasBluetoothButton(hubType) ? 'light.bluetooth' : 'light.status',
            ),
            lightPattern: t(
                hubHasBluetoothButton(hubType)
                    ? 'lightPattern.bluetooth'
                    : 'lightPattern.status',
            ),
        };
    }, [t, hubType]);

    const metadataTrackRef = useRef<HTMLTrackElement>(null);
    const [activeStep, setActiveStep] = useState('');

    useEffect(() => {
        const element = metadataTrackRef.current;

        // istanbul ignore if: should not happen
        if (element === null) {
            return;
        }

        // istanbul ignore else: jsdom doesn't support video
        if (process.env.NODE_ENV === 'test') {
            return;
        }

        const handleCueChange = (e: Event) => {
            const track = e.target as TextTrack;
            setActiveStep(track.activeCues?.[0]?.id ?? '');
        };

        element.track.addEventListener('cuechange', handleCueChange);
        element.track.mode = 'hidden';

        return () => {
            element.track.removeEventListener('cuechange', handleCueChange);
            element.track.mode = 'disabled';
        };
    }, [setActiveStep]);

    const prepareSteps = useMemo(
        () => (
            <>
                <li>
                    {t(
                        hubHasUSB(hubType)
                            ? 'instructionGroup.prepare.usb'
                            : 'instructionGroup.prepare.batteries',
                    )}
                </li>
                <li>{t('instructionGroup.prepare.turnOff')}</li>
                {/* For non-usb recovery, show step about official app */}
                {recovery && !hubHasUSB(hubType) && (
                    <li>
                        {t('instructionGroup.prepare.app', {
                            lego: legoRegisteredTrademark,
                        })}
                    </li>
                )}
            </>
        ),
        [t, recovery, hubType],
    );

    const bootloaderModeSteps = useMemo(
        () => (
            <>
                {/* City hub has power issues and requires disconnecting motors/sensors */}
                {hubType === Hub.City && (
                    <li
                        className={classNames(
                            activeStep === 'disconnect-io' && 'pb-active-step',
                        )}
                    >
                        {t('instructionGroup.bootloaderMode.disconnectIo')}
                    </li>
                )}

                <li
                    className={classNames(
                        activeStep === 'hold-button' && 'pb-active-step',
                    )}
                >
                    {t('instructionGroup.bootloaderMode.holdButton', {
                        button,
                    })}
                </li>

                {/* not strictly necessary, but order is swapped in the video,
                    so we match it here. */}
                {hubType !== Hub.Essential && hubHasUSB(hubType) && (
                    <li
                        className={classNames(
                            activeStep === 'connect-usb' && 'pb-active-step',
                        )}
                    >
                        {t('instructionGroup.bootloaderMode.connectUsb')}
                    </li>
                )}

                <li
                    className={classNames(
                        activeStep === 'wait-for-light' && 'pb-active-step',
                    )}
                >
                    {t('instructionGroup.bootloaderMode.waitForLight', {
                        button,
                        light,
                        lightPattern,
                    })}
                </li>

                {hubType === Hub.Essential && hubHasUSB(hubType) && (
                    <li
                        className={classNames(
                            activeStep === 'connect-usb' && 'pb-active-step',
                        )}
                    >
                        {t('instructionGroup.bootloaderMode.connectUsb')}
                    </li>
                )}

                {recovery && !hubHasUSB(hubType) && (
                    <li
                        className={classNames(
                            activeStep === 'wait-app-connect' && 'pb-active-step',
                        )}
                    >
                        {t('instructionGroup.bootloaderMode.waitAppConnect')}
                    </li>
                )}

                {/* hubs with USB will keep the power on, but other hubs won't */}
                {recovery || hubHasUSB(hubType) ? (
                    <li
                        className={classNames(
                            activeStep === 'release-button' && 'pb-active-step',
                        )}
                    >
                        {t('instructionGroup.bootloaderMode.releaseButton', {
                            button,
                        })}
                    </li>
                ) : (
                    <li
                        className={classNames(
                            activeStep === 'keep-holding' && 'pb-active-step',
                        )}
                    >
                        {t('instructionGroup.bootloaderMode.keepHolding', {
                            button,
                        })}
                    </li>
                )}
            </>
        ),
        [recovery, activeStep, t, button, hubType, light, lightPattern],
    );

    return (
        <>
            {process.env.NODE_ENV !== 'test' && (
                <video
                    controls
                    controlsList="nodownload nofullscreen"
                    muted
                    disablePictureInPicture
                    className="pb-bootloader-video"
                >
                    <source
                        src={
                            recovery
                                ? recoveryVideoFileMap.get(hubType)
                                : videoFileMap.get(hubType)
                        }
                        type="video/mp4"
                    />
                    <track
                        kind="metadata"
                        src={
                            recovery
                                ? recoveryMetadataFileMap.get(hubType)
                                : metadataFileMap.get(hubType)
                        }
                        ref={metadataTrackRef}
                    />
                </video>
            )}

            <div className="pb-spacer" />

            <p>
                <strong>{t('instructionGroup.prepare.title')}</strong>
            </p>
            <ol>{prepareSteps}</ol>
            <p>
                <strong>{t('instructionGroup.bootloaderMode.title')}</strong>
            </p>
            <ol start={countValidChildren(prepareSteps.props.children) + 1}>
                {bootloaderModeSteps}
            </ol>
            {(hubHasUSB(hubType) || (!hubHasUSB(hubType) && !recovery)) && (
                <>
                    <p>
                        <strong>{t('instructionGroup.connect.title')}</strong>
                    </p>
                    <ol
                        start={
                            countValidChildren(prepareSteps.props.children) +
                            countValidChildren(bootloaderModeSteps.props.children) +
                            1
                        }
                    >
                        <li>
                            {t('instructionGroup.connect.clickConnectAndFlash', {
                                flashButton: <strong>{flashButtonText}</strong>,
                            })}
                        </li>
                        <li>
                            {t('instructionGroup.connect.selectDevice', {
                                deviceName: (
                                    <strong>
                                        {bootloaderDeviceNameMap.get(hubType)}
                                    </strong>
                                ),
                                connectButton: (
                                    <strong>
                                        {t('instructionGroup.connect.connectButton')}
                                    </strong>
                                ),
                            })}
                        </li>
                    </ol>
                </>
            )}

            {hubHasUSB(hubType) && isLinux() && (
                <Callout intent={Intent.WARNING} icon={<WarningSign />}>
                    {t('warning.linux.message', {
                        learnMore: (
                            <>
                                <a
                                    href={pybricksUsbLinuxUdevRulesUrl}
                                    target="_blank"
                                    rel="noopener"
                                >
                                    {t('warning.linux.learnMore')}
                                </a>
                                <ExternalLinkIcon />
                            </>
                        ),
                    })}
                </Callout>
            )}

            {hubHasUSB(hubType) && isWindows() && (
                <Callout intent={Intent.WARNING} icon={<WarningSign />}>
                    {t('warning.windows.message', {
                        instructions: (
                            <a
                                onMouseDown={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();

                                    dispatch(
                                        firmwareDfuWindowsDriverInstallDialogDialogShow(),
                                    );
                                }}
                            >
                                {t('warning.windows.instructions')}
                            </a>
                        ),
                    })}
                </Callout>
            )}
        </>
    );
};

export default BootloaderInstructions;
