// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2024 The Pybricks Authors

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { downloadAndRun } from '../../../hub/actions';
import { HubRuntimeState } from '../../../hub/reducers';
import { useSelector } from '../../../reducers';
import ActionButton, { ActionButtonProps } from '../../ActionButton';
import icon from './icon.svg';

type RunButtonProps = Pick<ActionButtonProps, 'id'>;

const RunButton: React.FunctionComponent<RunButtonProps> = ({ id }) => {
    const {
        downloadProgress,
        preferredFileFormat,
        runtime,
        useLegacyDownload,
        useLegacyStartUserProgram,
    } = useSelector((s) => s.hub);
    const activeFile = useSelector((s) => s.editor.activeFileUuid);
    const keyboardShortcut = 'F5';

    const { t } = useTranslation('runButton');
    const dispatch = useDispatch();

    return (
        <ActionButton
            id={id}
            label={t('label')}
            keyboardShortcut={keyboardShortcut}
            tooltip={
                downloadProgress
                    ? t('tooltip.progress', {
                          percent: i18n.formatPercentage(downloadProgress),
                      })
                    : t('tooltip.action', { key: keyboardShortcut })
            }
            icon={icon}
            enabled={activeFile !== null && runtime === HubRuntimeState.Idle}
            showProgress={runtime === HubRuntimeState.Loading}
            progress={downloadProgress === null ? undefined : downloadProgress}
            onAction={() =>
                dispatch(
                    downloadAndRun(
                        preferredFileFormat,
                        useLegacyDownload,
                        useLegacyStartUserProgram,
                        0, // No slot UI yet
                    ),
                )
            }
        />
    );
};

export default RunButton;
