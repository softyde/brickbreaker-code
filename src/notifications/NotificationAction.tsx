// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2023 The Pybricks Authors

// provides translation for notification text

import React from 'react';
import { useTranslation } from 'react-i18next';

import { I18nId } from './i18n';

export type $Dictionary<T = unknown> = { [key: string]: T };

type NotificationActionProps = {
    messageId: I18nId;
    replacements?: $Dictionary | undefined;
};

const NotificationAction: React.FunctionComponent<NotificationActionProps> = ({
    messageId,
    replacements,
}) => {
    const { t } = useTranslation<'notifications'>();

    return <>{t(messageId, replacements)}</>;
};

export default NotificationAction;
