// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

export const shadow = 'shadow_';
export const shadow_number = `${shadow}number`;

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

export function shadowNumber(
    value: number,
    min: number,
    max: number,
    precision: number,
): string {
    return `${shadow_number}/${value}/${min}/${max}/${precision}`;
}
