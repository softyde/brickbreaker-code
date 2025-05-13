// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import { TypedUseSelectorHook, useSelector as useReduxSelector } from 'react-redux';
import { Reducer, combineReducers } from 'redux';
import app from './app/reducers';
import ble from './ble/reducers';
import blockly from './editor/blockly/reducers';
import editor from './editor/reducers';
import expert from './expert/reducers';
import explorer from './explorer/reducers';
import fileStorage from './fileStorage/reducers';
import firmware from './firmware/reducers';
import hub from './hub/reducers';
import bootloader from './lwp3-bootloader/reducers';
import sponsor from './sponsor/reducers';
import tour from './tour/reducers';

/**
 * Root reducer for redux store.
 */
export const rootReducer = combineReducers({
    app,
    bootloader,
    ble,
    editor,
    expert,
    explorer,
    fileStorage,
    firmware,
    hub,
    tour,
    sponsor,
    blockly,
});

/**
 * Root state for redux store.
 */
type StateFromReducer<R> = R extends Reducer<infer S> ? S : never;

export type RootState = StateFromReducer<typeof rootReducer>;

/**
 * Typed version of react-redux useSelector() hook.
 */
export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;
