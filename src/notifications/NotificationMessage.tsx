// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2023 The Pybricks Authors

// provides translation for notification text

import React from 'react';
import { useTranslation } from 'react-i18next';
import { I18nId } from './i18n';

export type $Dictionary<T = unknown> = { [key: string]: T };

type NotificationMessageProps = {
    messageId: I18nId;
    replacements?: $Dictionary | undefined;
};

const NotificationMessage: React.FunctionComponent<NotificationMessageProps> = ({
    messageId,
    replacements,
}) => {
    const { t } = useTranslation('notifications');

    let message = t(messageId, replacements) as React.ReactElement | string;

    // Use newline characters to create paragraphs
    if (typeof message === 'string') {
        message = (
            <>
                {message.split('\n').map((x, i) => (
                    <p key={i}>{x}</p>
                ))}
            </>
        );
    }

    return message;
};

export default NotificationMessage;
