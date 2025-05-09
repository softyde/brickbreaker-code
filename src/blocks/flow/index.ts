// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import booleanCondition from './boolean-condition';
import doWhile from './do-while';
import falseCondition from './false-condition';
import flowFor from './for';
import flowIf from './if';
import flowIfElse from './if-else';
import notCondition from './not-condition';
import numberCondition from './number-condition';
import trueCondition from './true-condition';
import wait from './wait';
import waitUntil from './wait-until';
import flowWhile from './while';

export default [
    wait,
    flowIf,
    flowIfElse,
    flowFor,
    doWhile,
    flowWhile,
    numberCondition,
    booleanCondition,
    notCondition,
    trueCondition,
    falseCondition,
    waitUntil,
];
