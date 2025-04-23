// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { Classes, Code, FormGroup, InputGroup, Intent, Tag } from '@blueprintjs/core';
import type { AriaButtonProps } from '@react-types/button';
import React, { useCallback, useRef } from 'react';
import { useButton } from 'react-aria';
import { useTranslation } from 'react-i18next';
import { FileNameValidationResult } from '../../pybricksMicropython/lib';

/**
 * Trims trailing and leading whitespace and replaces additional whitespace
 * with underscores.
 * @param value The input string.
 * @returns The fixed up string.
 */
function replaceSpaces(value: string): string {
    return value.trim().replaceAll(/\s+/g, '_');
}

/**
 * Removes the file extension from a string.
 * @param value The input string.
 * @returns The fixed up string.
 */
function removeFileExtension(value: string): string {
    return value.replace(/\.\w+$/, '');
}

/**
 * Trims trailing and leading whitespace and replaces groups of invalid
 * characters with underscores.
 * @param value The input string.
 * @returns The fixed up string.
 */
function replaceInvalidCharacters(value: string): string {
    return value.trim().replaceAll(/[^A-Za-z0-9_]+/g, '_');
}

type FixItButtonProps = Pick<AriaButtonProps<'a'>, 'onPress'>;

const FixItButton: React.FunctionComponent<FixItButtonProps> = (props) => {
    const { t } = useTranslation('fileNameForm');
    const ref = useRef<HTMLAnchorElement>(null);

    const { buttonProps } = useButton(
        {
            ...props,
            elementType: 'a',
        },
        ref,
    );

    return <a {...buttonProps}>{t('helpText.fixIt')}</a>;
};

type FileNameHelpTextProps = {
    /** The file name in the input (without file extension). */
    fileName: string;
    /** The result of the file name validation. */
    validation: FileNameValidationResult;
    /** Called when the "fix it" link is clicked. */
    onFix: (newName: string) => void;
};

/**
 * Component that maps FileNameValidationResult to help message to display to user.
 */
const FileNameHelpText: React.FunctionComponent<FileNameHelpTextProps> = ({
    fileName,
    validation,
    onFix,
}) => {
    const { t } = useTranslation('fileNameForm');

    const handleHasSpaces = useCallback(() => {
        onFix(replaceSpaces(fileName));
    }, [fileName, onFix]);

    const handleHasFileExtension = useCallback(() => {
        onFix(removeFileExtension(fileName));
    }, [fileName, onFix]);

    const handleHasInvalidCharacters = useCallback(() => {
        onFix(replaceInvalidCharacters(fileName));
    }, [fileName, onFix]);

    switch (validation) {
        case FileNameValidationResult.IsOk:
            return <>{t('helpText.isOk')}</>;
        case FileNameValidationResult.IsEmpty:
            return <>{t('helpText.isEmpty')}</>;
        case FileNameValidationResult.HasSpaces:
            return (
                <>
                    {t('helpText.hasSpaces')} <FixItButton onPress={handleHasSpaces} />
                </>
            );
        case FileNameValidationResult.HasFileExtension:
            return (
                <>
                    {t('helpText.hasFileExtension')}{' '}
                    <FixItButton onPress={handleHasFileExtension} />
                </>
            );
        case FileNameValidationResult.HasInvalidFirstCharacter:
            return (
                <>
                    {t('helpText.hasInvalidFirstCharacter', {
                        letters: <Code className={Classes.CODE}>a…z</Code>,
                        underscore: <Code className={Classes.CODE}>_</Code>,
                    })}
                </>
            );
        case FileNameValidationResult.HasInvalidCharacters:
            return (
                <>
                    {t('helpText.hasInvalidCharacters', {
                        letters: <Code className={Classes.CODE}>a…z</Code>,
                        numbers: <Code className={Classes.CODE}>0…9</Code>,
                        underscore: <Code className={Classes.CODE}>_</Code>,
                    })}{' '}
                    <FixItButton onPress={handleHasInvalidCharacters} />
                </>
            );
        case FileNameValidationResult.AlreadyExists:
            return <>{t('helpText.alreadyExists')}</>;
    }
};

type FileNameFormGroupProps = {
    /** The file name in the input (without file extension). */
    readonly fileName: string;
    /** The file extension (including leading ".") */
    readonly fileExtension: string;
    /** The result of the file name validation. */
    readonly validationResult: FileNameValidationResult;
    /** Ref to get handle to input (e.g to be able to call focus()) */
    readonly inputRef?: React.RefObject<HTMLInputElement>;
    /** Called when the user changes the text in the input box. */
    readonly onChange: (newName: string) => void;
};

/**
 * Component used to get a valid new file name.
 */
const FileNameFormGroup: React.FunctionComponent<FileNameFormGroupProps> = ({
    fileName,
    fileExtension,
    validationResult,
    inputRef,
    onChange,
}) => {
    const { t } = useTranslation('fileNameForm');

    const fileNameIntent =
        validationResult === FileNameValidationResult.IsOk
            ? Intent.NONE
            : Intent.DANGER;

    return (
        <FormGroup
            label={t('label')}
            intent={fileNameIntent}
            subLabel={
                <FileNameHelpText
                    fileName={fileName}
                    validation={validationResult}
                    onFix={onChange}
                />
            }
        >
            <InputGroup
                aria-label="File name"
                value={fileName}
                inputRef={inputRef}
                intent={fileNameIntent}
                rightElement={<Tag aria-hidden>{fileExtension}</Tag>}
                onMouseDown={(e) => e.stopPropagation()}
                onChange={(e) => onChange(e.target.value)}
            />
        </FormGroup>
    );
};

export default FileNameFormGroup;
