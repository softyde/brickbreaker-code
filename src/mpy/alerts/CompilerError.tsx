// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { Button, Intent } from '@blueprintjs/core';
import { Code, Error } from '@blueprintjs/icons';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { editorGoto } from '../../editor/actions';
import { useFileStorageUuid } from '../../fileStorage/hooks';
import type { CreateToast } from '../../toasterTypes';

type CompilerErrorProps = {
    error: string[];
};

const CompilerError: React.FunctionComponent<CompilerErrorProps> = ({ error }) => {
    const dispatch = useDispatch();
    const { t } = useTranslation('mpyAlerts');

    const [file, line] = useMemo(() => {
        for (const line of error) {
            const match = line.match(/^ {2}File "(.*)", line (\d+)/);

            if (match) {
                return [match[1], Number(match[2])];
            }
        }

        return [undefined, undefined];
    }, [error]);

    const uuid = useFileStorageUuid(file ?? '');

    return (
        <>
            <p>{t('compilerError.message')}</p>
            <pre className="pb-mpy-alerts-compile-error">{error.join('\n')}</pre>
            {file && uuid && (
                <Button
                    icon={<Code />}
                    onClick={() => dispatch(editorGoto(uuid, line))}
                >
                    {t('compilerError.gotoErrorButton')}
                </Button>
            )}
        </>
    );
};

export const compilerError: CreateToast<CompilerErrorProps, 'dismiss' | 'gotoError'> = (
    onAction,
    props,
) => ({
    message: <CompilerError {...props} />,
    icon: <Error />,
    intent: Intent.DANGER,
    timeout: 0,
    onDismiss: () => onAction('dismiss'),
});
