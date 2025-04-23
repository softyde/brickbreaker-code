// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import { Button, MenuItem } from '@blueprintjs/core';
import { ItemRenderer, Select } from '@blueprintjs/select';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export interface Language {
    flag: string;
    name: string;
    key: string;
    rank: number;
}

const LANGUAGES: Language[] = [
    { flag: '🇩🇪', name: 'Deutsch', key: 'de' },
    { flag: '🇬🇧', name: 'English', key: 'en' },
    // ...
].map((f, index) => ({ ...f, rank: index + 1 }));

//type LanguageSelectProps = Pick<ActionButtonProps, 'id'>;

const renderFilm: ItemRenderer<Language> = (
    language: Language,
    { handleClick, handleFocus, modifiers },
) => {
    if (!modifiers.matchesPredicate) {
        return null;
    }
    return (
        <MenuItem
            active={modifiers.active}
            disabled={modifiers.disabled}
            key={language.rank}
            label={language.flag}
            onClick={handleClick}
            onFocus={handleFocus}
            roleStructure="listoption"
            text={`${language.name}`}
        />
    );
};

const LanguageSelect: React.FunctionComponent = () => {
    const [selectedLanguage, setSelectedLanguage] = React.useState<
        Language | undefined
    >();

    const { i18n } = useTranslation();

    useEffect(() => {
        const selected = LANGUAGES.find((a) => a.key === i18n.language);
        setSelectedLanguage(selected);
    }, [i18n, setSelectedLanguage]);

    useEffect(() => {
        console.log(selectedLanguage?.key);

        if (selectedLanguage) {
            i18n.changeLanguage(selectedLanguage.key);
        }
    }, [selectedLanguage, i18n]);

    return (
        <Select<Language>
            items={LANGUAGES}
            itemRenderer={renderFilm}
            filterable={false}
            noResults={
                <MenuItem
                    disabled={true}
                    text="No results."
                    roleStructure="listoption"
                />
            }
            onItemSelect={setSelectedLanguage}
        >
            <Button
                text={
                    selectedLanguage
                        ? `${selectedLanguage.flag} ${selectedLanguage.name}`
                        : 'Sprache wählen'
                }
                //endIcon="double-caret-vertical"
            />
        </Select>
    );
};

export default LanguageSelect;
