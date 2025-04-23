// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import './UnexpectedErrorAlert.scss';
import {
    AnchorButton,
    Button,
    ButtonGroup,
    Collapse,
    Intent,
    Pre,
} from '@blueprintjs/core';
import { ChevronDown, ChevronRight, Duplicate, Error, Virus } from '@blueprintjs/icons';
import React, { useState } from 'react';
import { useId } from 'react-aria';
import { useTranslation } from 'react-i18next';
import type { CreateToast } from '../toasterTypes';

type UnexpectedErrorAlertProps = {
    error: Error;
};

const UnexpectedErrorAlert: React.FunctionComponent<UnexpectedErrorAlertProps> = ({
    error,
}) => {
    const { t } = useTranslation('unexpectedError');
    const [isExpanded, setIsExpanded] = useState(false);
    const labelId = useId();

    return (
        <>
            <p>{t('message')}</p>
            <p>{error.message}</p>
            {error.stack && (
                <>
                    <span>
                        <Button
                            aria-labelledby={labelId}
                            minimal={true}
                            small={true}
                            icon={isExpanded ? <ChevronDown /> : <ChevronRight />}
                            onClick={() => setIsExpanded((v) => !v)}
                        />
                        <span id={labelId}>{t('technicalInfo')}</span>
                    </span>
                    <Collapse isOpen={isExpanded}>
                        <Pre className="pb-alerts-stack-trace">{error.stack}</Pre>
                    </Collapse>
                </>
            )}
            <div>
                <ButtonGroup minimal={true} fill={true}>
                    <Button
                        intent={Intent.DANGER}
                        icon={<Duplicate />}
                        onClick={() =>
                            navigator.clipboard.writeText(
                                `\`\`\`\n${error.stack || error.message}\n\`\`\``,
                            )
                        }
                    >
                        {t('copyErrorMessage')}
                    </Button>
                    <AnchorButton
                        intent={Intent.DANGER}
                        icon={<Virus />}
                        href={`https://github.com/pybricks/support/issues?q=${encodeURIComponent(
                            'is:issue',
                        )}+${encodeURIComponent(error.message)}`}
                        target="_blank"
                        rel="noopener"
                    >
                        {t('reportBug')}
                    </AnchorButton>
                </ButtonGroup>
            </div>
        </>
    );
};

export const unexpectedError: CreateToast<{ error: Error }> = (
    onAction,
    { error },
) => ({
    message: <UnexpectedErrorAlert error={error} />,
    icon: <Error />,
    intent: Intent.DANGER,
    onDismiss: () => onAction('dismiss'),
});
