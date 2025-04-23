// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2023 The Pybricks Authors

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { toggleBluetooth } from '../../../ble/actions';
import { BleConnectionState } from '../../../ble/reducers';
import { BootloaderConnectionState } from '../../../lwp3-bootloader/reducers';
import { useSelector } from '../../../reducers';
import ActionButton, { ActionButtonProps } from '../../ActionButton';
import connectedIcon from './connected.svg';
import disconnectedIcon from './disconnected.svg';

type BluetoothButtonProps = Pick<ActionButtonProps, 'id'>;

const BluetoothButton: React.FunctionComponent<BluetoothButtonProps> = ({ id }) => {
    const bootloaderConnection = useSelector((s) => s.bootloader.connection);
    const bleConnection = useSelector((s) => s.ble.connection);

    const isDisconnected =
        bootloaderConnection === BootloaderConnectionState.Disconnected &&
        bleConnection === BleConnectionState.Disconnected;

    const { t } = useTranslation('bluetoothButton');
    const dispatch = useDispatch();

    return (
        <ActionButton
            id={id}
            label={t('label')}
            tooltip={t(isDisconnected ? 'tooltip.connect' : 'tooltip.disconnect')}
            icon={isDisconnected ? disconnectedIcon : connectedIcon}
            enabled={isDisconnected || bleConnection === BleConnectionState.Connected}
            showProgress={
                bleConnection === BleConnectionState.Connecting ||
                bleConnection === BleConnectionState.Disconnecting
            }
            onAction={() => dispatch(toggleBluetooth())}
        />
    );
};

export default BluetoothButton;
