// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import distance from './distance/distance';
import distanceSensor from './distance/distance-sensor';
import lightSensor from './light/light-sensor';
import reflection from './light/reflection';

export default [lightSensor, reflection, distanceSensor, distance];
