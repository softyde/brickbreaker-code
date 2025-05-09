// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

export const shadow = 'shadow_';

export enum Speed {
    VerySlow = 'very-slow',
    Slow = 'slow',
    Medium = 'medium',
    Fast = 'fast',
    VeryFast = 'very-fast',
}

export enum Port {
    A = 'Port.A',
    B = 'Port.B',
    C = 'Port.C',
    D = 'Port.D',
    E = 'Port.E',
    F = 'Port.F',
}

export enum Direction {
    Clockwise = 'Direction.CLOCKWISE',
    Counterclockwise = 'Direction.COUNTERCLOCKWISE',
}

export enum StraightDirection {
    Forward = 'Forward',
    Backward = 'Backward',
}

export function defaultPorts(): [string, string][] {
    return [
        ['Anschluss A', Port.A],
        ['Anschluss B', Port.B],
        ['Anschluss C', Port.C],
        ['Anschluss D', Port.D],
        ['Anschluss E', Port.E],
        ['Anschluss F', Port.F],
    ];
}

export function defaultDirections(): [string, string][] {
    return [
        ['rechts ↻', Direction.Clockwise],
        ['links ↺', Direction.Counterclockwise],
    ];
}

export function defaultSpeeds(): [string, Speed][] {
    return [
        ['sehr langsame', Speed.VerySlow],
        ['langsame', Speed.Slow],
        ['mittlere', Speed.Medium],
        ['schnelle', Speed.Fast],
        ['sehr schnelle', Speed.VeryFast],
    ];
}

export function straightDirections(): [string, StraightDirection][] {
    return [
        ['vorwärts ↑', StraightDirection.Forward],
        ['rückwärts ↓', StraightDirection.Backward],
    ];
}

export function shadowNumber(
    type:
        | 'number'
        | 'degree'
        | 'mm'
        | 'cm'
        | 'rotation-speed'
        | 'sec'
        | 'speed'
        | 'acc'
        | 'rotation-acc',
    value: number,
    min: number,
    max: number,
    precision: number,
): string {
    return `${shadow}${type}/${value}/${min}/${max}/${precision}`;
}
