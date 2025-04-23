// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2024 The Pybricks Authors

import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useDebounce } from 'usehooks-ts';
import { hubStartRepl } from '../../../hub/actions';
import { HubRuntimeState } from '../../../hub/reducers';
import { useSelector } from '../../../reducers';
import ActionButton, { ActionButtonProps } from '../../ActionButton';
import icon from './icon.svg';

type ReplButtonProps = Pick<ActionButtonProps, 'id'>;

const ReplButton: React.FunctionComponent<ReplButtonProps> = ({ id }) => {
    const { runtime, useLegacyDownload, useLegacyStartUserProgram, hasRepl } =
        useSelector((s) => s.hub);
    const { t } = useTranslation('replButton');
    const dispatch = useDispatch();

    const action = useCallback(
        () => dispatch(hubStartRepl(useLegacyDownload, useLegacyStartUserProgram)),
        [dispatch, useLegacyDownload, useLegacyStartUserProgram],
    );

    const busy = useDebounce(runtime === HubRuntimeState.StartingRepl, 250);

    return (
        <ActionButton
            id={id}
            label={t('label')}
            tooltip={t('tooltip')}
            icon={icon}
            enabled={hasRepl && runtime === HubRuntimeState.Idle}
            showProgress={busy}
            onAction={action}
        />
    );
};

export default ReplButton;
