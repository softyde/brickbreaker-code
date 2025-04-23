// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { Intent } from '@blueprintjs/core';
import { Error } from '@blueprintjs/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { CreateToast } from '../../toasterTypes';

type UserProgramSizeProps = {
    /** The actual size of the program in bytes. */
    actual: number;
    /** The maximum allowable size of the program in bytes. */
    max: number;
};

const UserProgramSize: React.FunctionComponent<UserProgramSizeProps> = ({
    actual,
    max,
}) => {
    const { t } = useTranslation('hubAlerts');
    return (
        <>
            <p>
                {t('userProgramSize.message', {
                    actual: i18n.formatNumber(actual),
                    max: i18n.formatNumber(max),
                })}
            </p>
            <p>{t('userProgramSize.suggestion')}</p>
        </>
    );
};

export const userProgramSize: CreateToast<UserProgramSizeProps> = (
    onAction,
    props,
) => ({
    message: <UserProgramSize {...props} />,
    icon: <Error />,
    intent: Intent.DANGER,
    onDismiss: () => onAction('dismiss'),
});
