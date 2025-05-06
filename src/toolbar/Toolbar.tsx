// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2023 The Pybricks Authors

import { ButtonGroup } from '@blueprintjs/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Toolbar as UtilsToolbar } from '../components/toolbar/Toolbar';
import BluetoothButton from './buttons/bluetooth/BluetoothButton';
import LanguageSelect from './buttons/language/LanguageSelect';
import ReplButton from './buttons/repl/ReplButton';
import RunButton from './buttons/run/RunButton';
import StopButton from './buttons/stop/StopButton';

import './toolbar.scss';

// matches ID in tour component
const bluetoothButtonId = 'pb-toolbar-bluetooth-button';
const runButtonId = 'pb-toolbar-run-button';
//const sponsorButtonId = 'pb-toolbar-sponsor-button';

const Toolbar: React.FunctionComponent = () => {
    const { t } = useTranslation('toolbar');
    const stopButtonId = 'pb-toolbar-stop-button';
    const replButtonId = 'pb-toolbar-repl-button';

    return (
        <UtilsToolbar
            aria-label={t('label')}
            className="pb-toolbar"
            firstFocusableItemId={bluetoothButtonId}
        >
            <div className="spacing"></div>
            <ButtonGroup className="pb-toolbar-group">
                <BluetoothButton id={bluetoothButtonId} />
            </ButtonGroup>
            <ButtonGroup className="pb-toolbar-group">
                <RunButton id={runButtonId} />
                <StopButton id={stopButtonId} />
                <ReplButton id={replButtonId} />
            </ButtonGroup>
            <div className="spacing"></div>
            <ButtonGroup className="pb-toolbar-group">
                <LanguageSelect></LanguageSelect>
                {/* <SponsorButton id={sponsorButtonId} /> */}
            </ButtonGroup>
        </UtilsToolbar>
    );
};

export default Toolbar;
