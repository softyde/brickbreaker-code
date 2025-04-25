// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import i18next from 'i18next';
//import Backend from 'i18next-http-backend';
//import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import './i18next.d.ts';

import de from './i18n/de';
import en from './i18n/en';

// the translations
export const resources = {
    en,
    de,
};

// eslint-disable-next-line import/no-named-as-default-member
i18next
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
        resources,
        fallbackLng: 'en',
        defaultNS: 'translations',
        lng: 'de', // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
        // you can use the i18n.changeLanguage function to change the language manually: https://www.i18next.com/overview/api#changelanguage
        // if you're using a language detector, do not define the lng option

        interpolation: {
            escapeValue: false, // react already safes from xss
        },
    });

// i18n
//     //.use(Backend)
//     //  .use(LanguageDetector)
//     .use(initReactI18next) // bind react-i18next to the instance
//     .init({
//         fallbackLng: 'en',
//         debug: true,

//         interpolation: {
//             escapeValue: false, // not needed for react!!
//         },

//         // react i18next special options (optional)
//         // override if needed - omit if ok with defaults
//         /*
//     react: {
//       bindI18n: 'languageChanged',
//       bindI18nStore: '',
//       transEmptyNodeValue: '',
//       transSupportBasicHtmlNodes: true,
//       transKeepBasicHtmlNodesFor: ['br', 'strong', 'i'],
//       useSuspense: true,
//     }
//     */
//     });

export default i18next;
