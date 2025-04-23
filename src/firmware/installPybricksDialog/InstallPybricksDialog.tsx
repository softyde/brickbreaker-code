// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import './installPybricksDialog.scss';
import {
    Button,
    Checkbox,
    Classes,
    Collapse,
    ControlGroup,
    DialogStep,
    FormGroup,
    Icon,
    InputGroup,
    Intent,
    MultistepDialog,
    NonIdealState,
    Popover,
    Pre,
    Spinner,
} from '@blueprintjs/core';
import { ChevronDown, ChevronRight, Error, Heart } from '@blueprintjs/icons';
import { FirmwareMetadata, HubType } from '@pybricks/firmware';
import { fileOpen } from 'browser-fs-access';
import classNames from 'classnames';
import React, { useCallback, useState } from 'react';
import { VisuallyHidden } from 'react-aria';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useLocalStorage } from 'usehooks-ts';
import { alertsShowAlert } from '../../alerts/actions';
import {
    appName,
    legoMindstormsRegisteredTrademark,
    zipFileExtension,
    zipFileMimeType,
} from '../../app/constants';
import HelpButton from '../../components/HelpButton';
import { Hub, hubBootloaderType } from '../../components/hubPicker';
import { HubPicker } from '../../components/hubPicker/HubPicker';
import { useHubPickerSelectedHub } from '../../components/hubPicker/hooks';
import { useSelector } from '../../reducers';
import { ensureError } from '../../utils';
import BootloaderInstructions from '../bootloaderInstructions/BootloaderInstructions';
import {
    firmwareInstallPybricksDialogAccept,
    firmwareInstallPybricksDialogCancel,
} from './actions';
import { FirmwareData, useCustomFirmware, useFirmware } from './hooks';
import { validateHubName } from '.';

const dialogBody = classNames(
    Classes.DIALOG_BODY,
    Classes.RUNNING_TEXT,
    'pb-firmware-installPybricksDialog-body',
);

/** Translates hub type from firmware metadata to local hub type. */
function getHubTypeFromMetadata(
    metadata: FirmwareMetadata | undefined,
    fallback: Hub,
): Hub {
    switch (metadata?.['device-id']) {
        case HubType.MoveHub:
            return Hub.Move;
        case HubType.CityHub:
            return Hub.City;
        case HubType.TechnicHub:
            return Hub.Technic;
        case HubType.PrimeHub:
            return Hub.Prime;
        case HubType.EssentialHub:
            return Hub.Essential;
        default:
            return fallback;
    }
}

function getHubTypeNameFromMetadata(metadata: FirmwareMetadata | undefined): string {
    switch (metadata?.['device-id']) {
        case HubType.MoveHub:
            return 'BOOST Move Hub';
        case HubType.CityHub:
            return 'City Hub';
        case HubType.TechnicHub:
            return 'Technic Hub';
        case HubType.PrimeHub:
            return 'SPIKE Prime/MINDSTORMS Robot Inventor hub';
        case HubType.EssentialHub:
            return 'SPIKE Essential hub';
        default:
            return '?';
    }
}

const UnsupportedHubs: React.FunctionComponent = () => {
    const { t } = useTranslation('installPyBricks');

    return (
        <div className={Classes.RUNNING_TEXT}>
            <h4>
                {t('selectHubPanel.notOnListButton.info.mindstorms.title', {
                    legoMindstormsRegisteredTrademark,
                })}
            </h4>
            <p>
                {t('selectHubPanel.notOnListButton.info.mindstorms.intro', {
                    appName,
                    legoMindstormsRegisteredTrademark,
                })}
            </p>
            <p>
                {t('selectHubPanel.notOnListButton.info.mindstorms.help.message', {
                    sponsor: (
                        <>
                            <VisuallyHidden elementType="span">
                                {t(
                                    'selectHubPanel.notOnListButton.info.mindstorms.help.sponsor',
                                )}
                            </VisuallyHidden>
                            <Icon icon={<Heart />} />
                        </>
                    ),
                })}
            </p>
            <ul>
                <li>{t('selectHubPanel.notOnListButton.info.mindstorms.rcx')}</li>
                <li>{t('selectHubPanel.notOnListButton.info.mindstorms.nxt')}</li>
                <li>{t('selectHubPanel.notOnListButton.info.mindstorms.ev3')}</li>
            </ul>
            <h4>{t('selectHubPanel.notOnListButton.info.poweredUp.title')}</h4>
            <p>{t('selectHubPanel.notOnListButton.info.poweredUp.intro')}</p>
            <ul>
                <li>{t('selectHubPanel.notOnListButton.info.poweredUp.wedo2')}</li>
                <li>{t('selectHubPanel.notOnListButton.info.poweredUp.duploTrain')}</li>
                <li>{t('selectHubPanel.notOnListButton.info.poweredUp.mario')}</li>
            </ul>
        </div>
    );
};

type SelectHubPanelProps = {
    isCustomFirmwareRequested: boolean;
    customFirmwareData: FirmwareData | undefined;
    onCustomFirmwareZip: (firmwareZip: File | undefined) => void;
};

const SelectHubPanel: React.FunctionComponent<SelectHubPanelProps> = ({
    isCustomFirmwareRequested,
    customFirmwareData,
    onCustomFirmwareZip,
}) => {
    const [isAdvancedOpen, setIsAdvancedOpen] = useLocalStorage(
        'installPybricksDialog.isAdvancedOpen',
        false,
    );
    const { t } = useTranslation('installPyBricks');
    const dispatch = useDispatch();

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            // should only be one file since multiple={false}
            acceptedFiles.forEach((f) => {
                onCustomFirmwareZip(f);
            });
        },
        [onCustomFirmwareZip],
    );

    const onClick = useCallback(async () => {
        try {
            const file = await fileOpen({
                id: 'customFirmware',
                mimeTypes: [zipFileMimeType],
                extensions: [zipFileExtension],
                // TODO: translate description
                description: 'Zip Files',
                excludeAcceptAllOption: true,
                startIn: 'downloads',
            });

            onCustomFirmwareZip(file);
        } catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') {
                // user cancelled, nothing to do
            } else {
                dispatch(
                    alertsShowAlert('alerts', 'unexpectedError', {
                        error: ensureError(err),
                    }),
                );
            }
        }
    }, [dispatch, onCustomFirmwareZip]);

    const onKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key !== 'Enter' && e.key !== ' ') {
                return;
            }

            e.stopPropagation();
            onClick();
        },
        [onClick],
    );

    const { getRootProps, getInputProps } = useDropzone({
        accept: { [zipFileMimeType]: [zipFileExtension] },
        multiple: false,
        // react-dropzone doesn't allow full control of File System API, so we
        // implement our own using browser-fs-access instead.
        noClick: true,
        onDrop,
    });

    return (
        <div className={dialogBody}>
            {isCustomFirmwareRequested ? (
                <>
                    <p>{t('selectHubPanel.customFirmware.message')}</p>
                    <p>
                        {t('selectHubPanel.customFirmware.hubType', {
                            hubTypeName: getHubTypeNameFromMetadata(
                                customFirmwareData?.metadata,
                            ),
                        })}
                    </p>
                    <p>
                        {t('selectHubPanel.customFirmware.firmwareVersion', {
                            version: customFirmwareData?.metadata['firmware-version'],
                        })}
                    </p>
                    <Button
                        onClick={() => {
                            onCustomFirmwareZip(undefined);
                        }}
                    >
                        {t('selectHubPanel.customFirmware.clearButton')}
                    </Button>
                </>
            ) : (
                <>
                    <p>{t('selectHubPanel.message')}</p>
                    <HubPicker />
                    <Popover
                        popoverClassName={Classes.POPOVER_CONTENT_SIZING}
                        placement="right-end"
                        content={<UnsupportedHubs />}
                        renderTarget={({ isOpen: _isOpen, ref, ...targetProps }) => (
                            <Button
                                ref={ref as React.Ref<HTMLButtonElement>}
                                {...targetProps}
                            >
                                {t('selectHubPanel.notOnListButton.label')}
                            </Button>
                        )}
                    />
                </>
            )}
            <div className="pb-firmware-installPybricksDialog-selectHub-advanced">
                <Button
                    minimal={true}
                    small={true}
                    icon={isAdvancedOpen ? <ChevronDown /> : <ChevronRight />}
                    onClick={() => setIsAdvancedOpen((v) => !v)}
                >
                    {t('selectHubPanel.advanced.label')}
                </Button>
                <Collapse isOpen={isAdvancedOpen}>
                    <div
                        {...getRootProps({
                            className: 'pb-dropzone-root',
                            onClick,
                            onKeyDown,
                        })}
                    >
                        <input {...getInputProps()} />
                        {t('selectHubPanel.advanced.customFirmwareDropzone.label')}
                    </div>
                </Collapse>
            </div>
        </div>
    );
};

type AcceptLicensePanelProps = {
    licenseAccepted: boolean;
    firmwareData: FirmwareData | undefined;
    firmwareError: Error | undefined;
    isCustomFirmwareRequested: boolean;
    customFirmwareData: FirmwareData | undefined;
    customFirmwareError: Error | undefined;
    onLicenseAcceptedChanged: (accepted: boolean) => void;
};

const AcceptLicensePanel: React.FunctionComponent<AcceptLicensePanelProps> = ({
    licenseAccepted,
    firmwareData,
    firmwareError,
    isCustomFirmwareRequested,
    customFirmwareData,
    customFirmwareError,
    onLicenseAcceptedChanged,
}) => {
    const { t } = useTranslation('installPyBricks');

    const selectedFirmwareData = isCustomFirmwareRequested
        ? customFirmwareData
        : firmwareData;
    const selectedFirmwareError = isCustomFirmwareRequested
        ? customFirmwareError
        : firmwareError;

    return (
        <div className={dialogBody}>
            <div className="pb-firmware-installPybricksDialog-license-text">
                {selectedFirmwareData ? (
                    <Pre>{selectedFirmwareData.licenseText}</Pre>
                ) : (
                    <NonIdealState
                        icon={selectedFirmwareError ? <Error /> : <Spinner />}
                        description={
                            selectedFirmwareError
                                ? t('licensePanel.licenseText.error')
                                : undefined
                        }
                    />
                )}
            </div>
            <Checkbox
                className="pb-firmware-installPybricksDialog-license-checkbox"
                label={t('licensePanel.acceptCheckbox.label')}
                checked={licenseAccepted}
                onChange={(e) => onLicenseAcceptedChanged(e.currentTarget.checked)}
                disabled={!selectedFirmwareData}
            />
        </div>
    );
};

type SelectOptionsPanelProps = {
    hubName: string;
    metadata: FirmwareMetadata | undefined;
    onChangeHubName(hubName: string): void;
};

const ConfigureOptionsPanel: React.FunctionComponent<SelectOptionsPanelProps> = ({
    hubName,
    metadata,
    onChangeHubName,
}) => {
    const { t } = useTranslation('installPyBricks');
    const isHubNameValid = metadata ? validateHubName(hubName, metadata) : true;

    return (
        <div className={dialogBody}>
            <FormGroup
                label={t('optionsPanel.hubName.label')}
                labelInfo={t('optionsPanel.hubName.labelInfo')}
            >
                <ControlGroup>
                    <InputGroup
                        value={hubName}
                        onChange={(e) => onChangeHubName(e.currentTarget.value)}
                        onMouseOver={(e) => e.preventDefault()}
                        onMouseDown={(e) => e.stopPropagation()}
                        intent={isHubNameValid ? Intent.NONE : Intent.DANGER}
                        placeholder="Pybricks Hub"
                        rightElement={
                            isHubNameValid ? undefined : (
                                <Icon
                                    icon={<Error />}
                                    intent={Intent.DANGER}
                                    tagName="div"
                                />
                            )
                        }
                    />
                    <HelpButton
                        helpForLabel={t('optionsPanel.hubName.label')}
                        content={t('optionsPanel.hubName.help')}
                    />
                </ControlGroup>
            </FormGroup>
        </div>
    );
};

type BootloaderModePanelProps = {
    hubType: Hub;
};

const BootloaderModePanel: React.FunctionComponent<BootloaderModePanelProps> = ({
    hubType,
}) => {
    const { t } = useTranslation('installPyBricks');

    return (
        <div className={classNames(Classes.DIALOG_BODY, Classes.RUNNING_TEXT)}>
            <BootloaderInstructions
                hubType={hubType}
                flashButtonText={t('flashFirmwareButton.label')}
            />
        </div>
    );
};

export const InstallPybricksDialog: React.FunctionComponent = () => {
    const { isOpen } = useSelector((s) => s.firmware.installPybricksDialog);
    const inProgress = useSelector(
        (s) =>
            s.firmware.isFirmwareFlashUsbDfuInProgress ||
            s.firmware.isFirmwareRestoreOfficialDfuInProgress,
    );
    const dispatch = useDispatch();
    const [hubName, setHubName] = useState('');
    const [licenseAccepted, setLicenseAccepted] = useState(false);
    const [hubType] = useHubPickerSelectedHub();
    const { firmwareData, firmwareError } = useFirmware(hubType);
    const [customFirmwareZip, setCustomFirmwareZip] = useState<File>();
    const { isCustomFirmwareRequested, customFirmwareData, customFirmwareError } =
        useCustomFirmware(customFirmwareZip);
    const { t } = useTranslation('installPyBricks');

    const selectedFirmwareData = isCustomFirmwareRequested
        ? customFirmwareData
        : firmwareData;
    const selectedHubType = isCustomFirmwareRequested
        ? getHubTypeFromMetadata(customFirmwareData?.metadata, hubType)
        : hubType;

    return (
        <MultistepDialog
            title={t('title')}
            isOpen={isOpen}
            onClose={() => dispatch(firmwareInstallPybricksDialogCancel())}
            backButtonProps={{ text: t('backButton.label') }}
            nextButtonProps={{ text: t('nextButton.label') }}
            finalButtonProps={{
                text: t('flashFirmwareButton.label'),
                disabled: inProgress,
                onClick: () =>
                    dispatch(
                        firmwareInstallPybricksDialogAccept(
                            hubBootloaderType(selectedHubType),
                            selectedFirmwareData?.firmwareZip ?? new ArrayBuffer(0),
                            hubName,
                        ),
                    ),
            }}
        >
            <DialogStep
                id="hub"
                title={t('selectHubPanel.title')}
                panel={
                    <SelectHubPanel
                        isCustomFirmwareRequested={isCustomFirmwareRequested}
                        customFirmwareData={customFirmwareData}
                        onCustomFirmwareZip={setCustomFirmwareZip}
                    />
                }
            />
            <DialogStep
                id="license"
                title={t('licensePanel.title')}
                panel={
                    <AcceptLicensePanel
                        licenseAccepted={licenseAccepted}
                        firmwareData={firmwareData}
                        firmwareError={firmwareError}
                        isCustomFirmwareRequested={isCustomFirmwareRequested}
                        customFirmwareData={customFirmwareData}
                        customFirmwareError={customFirmwareError}
                        onLicenseAcceptedChanged={setLicenseAccepted}
                    />
                }
                nextButtonProps={{
                    disabled: !licenseAccepted,
                    text: t('nextButton.label'),
                }}
            />
            <DialogStep
                id="options"
                title={t('optionsPanel.title')}
                panel={
                    <ConfigureOptionsPanel
                        hubName={hubName}
                        metadata={
                            isCustomFirmwareRequested
                                ? customFirmwareData?.metadata
                                : firmwareData?.metadata
                        }
                        onChangeHubName={setHubName}
                    />
                }
            />
            <DialogStep
                id="bootloader"
                title={t('bootloaderPanel.title')}
                panel={<BootloaderModePanel hubType={selectedHubType} />}
            />
        </MultistepDialog>
    );
};
