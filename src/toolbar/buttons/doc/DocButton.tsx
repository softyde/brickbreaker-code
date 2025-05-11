// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2024 The Pybricks Authors

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSettingIsShowDocsEnabled } from '../../../settings/hooks';
import ActionButton, { ActionButtonProps } from '../../ActionButton';

import iconClose from './icon-close.svg';
import iconOpen from './icon-open.svg';

type DocButtonProps = Pick<ActionButtonProps, 'id'>;

const DocButton: React.FunctionComponent<DocButtonProps> = ({ id }) => {
    const { isSettingShowDocsEnabled, toggleIsSettingShowDocsEnabled } =
        useSettingIsShowDocsEnabled();

    const keyboardShortcut = 'F1';

    const { t } = useTranslation('docButton');

    return (
        <ActionButton
            id={id}
            label={t('label')}
            keyboardShortcut={keyboardShortcut}
            tooltip={isSettingShowDocsEnabled ? t('tooltip.close') : t('tooltip.open')}
            icon={isSettingShowDocsEnabled ? iconClose : iconOpen}
            enabled={true}
            onAction={toggleIsSettingShowDocsEnabled}
        />
    );
};

export default DocButton;
