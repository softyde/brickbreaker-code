// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2023 The Pybricks Authors

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useDebounce } from 'usehooks-ts';
import { hubStopUserProgram } from '../../../hub/actions';
import { HubRuntimeState } from '../../../hub/reducers';
import { useSelector } from '../../../reducers';
import ActionButton, { ActionButtonProps } from '../../ActionButton';
import icon from './icon.svg';

type StopButtonProps = Pick<ActionButtonProps, 'id'>;

const StopButton: React.FunctionComponent<StopButtonProps> = ({ id }) => {
    const runtime = useSelector((s) => s.hub.runtime);
    const keyboardShortcut = 'F6';

    const { t } = useTranslation('stopButton');
    const dispatch = useDispatch();

    const busy = useDebounce(runtime === HubRuntimeState.StoppingUserProgram, 250);

    return (
        <ActionButton
            id={id}
            label={t('label')}
            keyboardShortcut={keyboardShortcut}
            tooltip={t('tooltip', { key: keyboardShortcut })}
            icon={icon}
            enabled={runtime === HubRuntimeState.Running}
            showProgress={busy}
            onAction={() => dispatch(hubStopUserProgram())}
        />
    );
};

export default StopButton;
