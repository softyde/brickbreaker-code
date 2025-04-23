// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import about from './about/translations/en.json';
import activities from './activities/translations/en.json';
import unexpectedError from './alerts/translations/en.json';
import appAlerts from './app/alerts/translations/en.json';
import translations from './app/translations/en.json';
import bleAlerts from './ble/alerts/translations/en.json';
import components from './components/translations/en.json';
import editor from './editor/translations/en.json';
import explorerAlerts from './explorer/alerts/translations/en.json';

import deleteFileAlert from './explorer/deleteFileAlert/translations/en.json';
import duplicateFile from './explorer/duplicateFileDialog/translations/en.json';
import fileNameForm from './explorer/fileNameFormGroup/translations/en.json';
import newFileWizard from './explorer/newFileWizard/translations/en.json';
import renameFile from './explorer/renameFileDialog/translations/en.json';
import renameImport from './explorer/renameImportDialog/translations/en.json';
import replaceImport from './explorer/replaceImportDialog/translations/en.json';
import explorer from './explorer/translations/en.json';

import firmwareAlerts from './firmware/alerts/translations/en.json';

import bootloaderInstructions from './firmware/bootloaderInstructions/translations/en.json';
import dfuWindowsDriver from './firmware/dfuWindowsDriverInstallDialog/translations/en.json';
import installPyBricks from './firmware/installPybricksDialog/translations/en.json';
import restoreOfficial from './firmware/restoreOfficialDialog/translations/en.json';

import hubAlerts from './hub/alerts/translations/en.json';
import licenses from './licenses/translations/en.json';

import mpyAlerts from './mpy/alerts/translations/en.json';

import notifications from './notifications/translations/en.json';
import settings from './settings/translations/en.json';

import sponsorAlerts from './sponsor/alerts/translations/en.json';
import sponsorDialog from './sponsor/translations/en.json';

import statusBar from './status-bar/translations/en.json';
import terminal from './terminal/translations/en.json';

import bluetoothButton from './toolbar/buttons/bluetooth/translations/en.json';
import replButton from './toolbar/buttons/repl/translations/en.json';
import runButton from './toolbar/buttons/run/translations/en.json';

import sponsorButton from './toolbar/buttons/sponsor/translations/en.json';
import stopButton from './toolbar/buttons/stop/translations/en.json';
import toolbar from './toolbar/translations/en.json';

import tour from './tour/translations/en.json';

declare module 'i18next' {
    interface CustomTypeOptions {
        defaultNS: 'translations';
        resources: {
            translations: typeof translations;
            appAlerts: typeof appAlerts;
            deleteFileAlert: typeof deleteFileAlert;
            duplicateFile: typeof duplicateFile;
            fileNameForm: typeof fileNameForm;
            newFileWizard: typeof newFileWizard;
            renameFile: typeof renameFile;
            renameImport: typeof renameImport;
            replaceImport: typeof replaceImport;

            firmwareAlerts: typeof firmwareAlerts;

            editor: typeof editor;
            explorer: typeof explorer;
            explorerAlerts: typeof explorerAlerts;
            components: typeof components;
            unexpectedError: typeof unexpectedError;
            bleAlerts: typeof bleAlerts;

            bootloaderInstructions: typeof bootloaderInstructions;
            installPyBricks: typeof installPyBricks;
            dfuWindowsDriver: typeof dfuWindowsDriver;
            restoreOfficial: typeof restoreOfficial;

            hubAlerts: typeof hubAlerts;
            licenses: typeof licenses;

            mpyAlerts: typeof mpyAlerts;
            notifications: typeof notifications;
            settings: typeof settings;

            sponsorDialog: typeof sponsorDialog;
            sponsorAlerts: typeof sponsorAlerts;

            statusBar: typeof statusBar;
            terminal: typeof terminal;

            toolbar: typeof toolbar;
            bluetoothButton: typeof bluetoothButton;
            replButton: typeof replButton;
            runButton: typeof runButton;

            sponsorButton: typeof sponsorButton;
            stopButton: typeof stopButton;

            tour: typeof tour;

            about: typeof about;
            activities: typeof activities;
        };
    }
}
