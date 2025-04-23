// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2023 The Pybricks Authors

import './status-bar.scss';
import {
    Button,
    Classes,
    Icon,
    IconSize,
    Intent,
    Popover,
    PopoverProps,
    ProgressBar,
    Spinner,
} from '@blueprintjs/core';
import { Disable, Error, TickCircle } from '@blueprintjs/icons';
import classNames from 'classnames';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BleConnectionState } from '../ble/reducers';
import { CompletionEngineStatus } from '../editor/redux/codeCompletion';
import { useSelector } from '../reducers';

const commonPopoverProps: Partial<PopoverProps> = {
    popoverClassName: Classes.POPOVER_CONTENT_SIZING,
    placement: 'top',
};

const CompletionEngineIndicator: React.FunctionComponent = () => {
    const { status } = useSelector((s) => s.editor.codeCompletion);
    const { t } = useTranslation('statusBar');

    const icon = useMemo(() => {
        switch (status) {
            case CompletionEngineStatus.Loading:
                return <Spinner size={IconSize.STANDARD} />;
            case CompletionEngineStatus.Ready:
                return <Icon icon={<TickCircle />} />;
            case CompletionEngineStatus.Failed:
                return <Icon icon={<Error />} />;
            default:
                return <Icon icon={<Disable />} />;
        }
    }, [status]);

    const message = useMemo(() => {
        switch (status) {
            case CompletionEngineStatus.Loading:
                return t('completionEngineStatus.message.loading');
            case CompletionEngineStatus.Ready:
                return t('completionEngineStatus.message.ready');
            case CompletionEngineStatus.Failed:
                return t('completionEngineStatus.message.failed');
            default:
                return t('completionEngineStatus.message.unknown');
        }
    }, [status, t]);

    return (
        <Popover {...commonPopoverProps} content={message}>
            <div
                aria-label={t('completionEngineStatus.label')}
                role="button"
                aria-haspopup="dialog"
                style={{ cursor: 'pointer' }}
            >
                {icon}
            </div>
        </Popover>
    );
};

const HubInfoButton: React.FunctionComponent = () => {
    const { t } = useTranslation('statusBar');
    const deviceName = useSelector((s) => s.ble.deviceName);
    const deviceType = useSelector((s) => s.ble.deviceType);
    const deviceFirmwareVersion = useSelector((s) => s.ble.deviceFirmwareVersion);

    return (
        <Popover
            {...commonPopoverProps}
            content={
                <table className="no-wrap" style={{ userSelect: 'text' }}>
                    <tbody>
                        <tr>
                            <td>
                                <strong>{t('hubInfo.connectedTo')}</strong>
                            </td>
                            <td>{deviceName}</td>
                        </tr>
                        <tr>
                            <td>
                                <strong>{t('hubInfo.hubType')}</strong>
                            </td>
                            <td>{deviceType}</td>
                        </tr>
                        <tr>
                            <td>
                                <strong>{t('hubInfo.firmware')}</strong>
                            </td>
                            <td>v{deviceFirmwareVersion}</td>
                        </tr>
                    </tbody>
                </table>
            }
        >
            <Button title={t('hubInfo.title')} minimal={true}>
                {deviceName}
            </Button>
        </Popover>
    );
};

const BatteryIndicator: React.FunctionComponent = () => {
    const { t } = useTranslation('statusBar');
    const charging = useSelector((s) => s.ble.deviceBatteryCharging);
    const lowBatteryWarning = useSelector((s) => s.ble.deviceLowBatteryWarning);

    return (
        <Popover
            {...commonPopoverProps}
            content={
                <span className="no-wrap">
                    {t(lowBatteryWarning ? 'battery.low' : 'battery.ok')}
                </span>
            }
        >
            <div
                title={t('battery.title')}
                className="pb-battery-indicator"
                style={{ cursor: 'pointer' }}
            >
                <div className="pb-battery-indicator-body">
                    <ProgressBar
                        animate={charging}
                        stripes={charging}
                        intent={lowBatteryWarning ? Intent.DANGER : Intent.SUCCESS}
                    />
                </div>
                <div className="pb-battery-indicator-tip" />
            </div>
        </Popover>
    );
};

const StatusBar: React.FunctionComponent = () => {
    const connection = useSelector((s) => s.ble.connection);

    return (
        <div
            className={classNames('pb-status-bar', Classes.DARK)}
            role="status"
            aria-live="off"
        >
            <div className="pb-status-bar-group">
                <CompletionEngineIndicator />
            </div>
            <div className="pb-status-bar-group">
                {connection === BleConnectionState.Connected && (
                    <>
                        <HubInfoButton />
                        <BatteryIndicator />
                    </>
                )}
            </div>
        </div>
    );
};

export default StatusBar;
