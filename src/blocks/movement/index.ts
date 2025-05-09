// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import hub from './hub';
import motor from './motor';
import setAcc from './set-acc';
import setSpeed from './set-speed';
import setTurnAcc from './set-turn-acc';
import setTurnSpeed from './set-turn-speed';
import start from './start';
import stop from './stop';
import straight from './straight';
import turn from './turn';

export default [
    motor,
    hub,
    straight,
    turn,
    start,
    stop,
    setSpeed,
    setAcc,
    setTurnSpeed,
    setTurnAcc,
];
