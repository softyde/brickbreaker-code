// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

/**
 * CustomRenderer für Blockly in TypeScript
 * Der Renderer passt die Darstellung abhängig vom Verbindungstyp an
 */

import * as Blockly from 'blockly';
import { STATEMENT_INIT } from './blocks';

/**
 * Ein benutzerdefinierter Renderer für Blockly
 * Erweitert den Standard-Renderer mit verbindungsabhängigen Anpassungen
 */
class CustomRenderer extends Blockly.zelos.Renderer {
    static NAME = 'custom-renderer';

    constructor() {
        super(CustomRenderer.NAME);
    }

    /**
     * Überschreibe makeConstants, um eigene Konstanten zu definieren
     */
    protected makeConstants_(): CustomConstantsProvider {
        return new CustomConstantsProvider();
    }
}

/**
 * Benutzerdefinierte Konstanten für den Renderer
 */
class CustomConstantsProvider extends Blockly.zelos.ConstantProvider {
    colourTertiary: string | undefined;
    INPUT_SHAPE_COLOUR: string | undefined;
    OUTPUT_SHAPE_COLOUR: string | undefined;
    STATEMENT_INPUT_SHAPE_COLOUR: string | undefined;
    STATEMENT_OUTPUT_SHAPE_COLOUR: string | undefined;

    constructor() {
        super();
        // Initialisiere die benutzerdefinierten Verbindungsformen
    }

    /**
     * Bestimmt die Form für eine bestimmte Verbindung
     * Diese Methode wird von Blockly aufgerufen, um die Form einer Verbindung zu ermitteln
     */
    shapeFor(connection: Blockly.RenderedConnection): {
        type: number;
        width: number;
        height: number;
        pathLeft?: string;
        pathRight?: string;
        pathTop?: string;
        pathBottom?: string;
    } {
        // Standardform abrufen
        //const shape = this.getDefaultShape(connection.type);
        const shape = super.shapeFor(connection);

        // Verbindungstyp und angrenzende Verbindungen ermitteln
        const type = connection.type;

        // Kopie der Standardform erstellen, um sie zu modifizieren
        let customShape = { ...shape } as Blockly.blockRendering.Notch;

        if (type === Blockly.PREVIOUS_STATEMENT || type === Blockly.NEXT_STATEMENT) {
            const prevConnection = connection
                .getSourceBlock()
                .previousConnection?.getCheck();
            const nextConnection = connection
                .getSourceBlock()
                .nextConnection?.getCheck();

            if (
                prevConnection?.includes(STATEMENT_INIT) ||
                nextConnection?.includes(STATEMENT_INIT)
            ) {
                customShape = this.makeCustomNotch(2);
            }
        }

        return customShape;
    }

    makeCustomNotch(numNotches: number) {
        const height = 2 * this.GRID_UNIT;

        const notchWidth = 4 * this.GRID_UNIT;
        const notchSpacing = 2 * this.GRID_UNIT;

        const width = numNotches * notchWidth + (numNotches - 1) * notchSpacing;

        const lineOnAxis = Blockly.utils.svgPaths.lineOnAxis;

        /**
         * Make the main path for the notch.
         *
         * @param dir Direction multiplier to apply to horizontal offsets along the
         *     path. Either 1 or -1.
         * @returns A path fragment describing a notch.
         */
        function makeMainPath(dir: number): string {
            let result = '';

            for (let i = 0; i < numNotches; i++) {
                if (i > 0) {
                    result += lineOnAxis('h', dir * notchSpacing);
                }

                result +=
                    lineOnAxis('v', height) +
                    lineOnAxis('h', dir * notchWidth) +
                    lineOnAxis('v', -height);
            }

            return result;
        }

        const pathLeft = makeMainPath(1);
        const pathRight = makeMainPath(-1);

        return {
            type: this.SHAPES.NOTCH,
            width,
            height,
            pathLeft,
            pathRight,
        };
    }
}

export const RendererName = CustomRenderer.NAME;

export const initRenderer = function () {
    /**
     * Registrierung des benutzerdefinierten Renderers
     */
    Blockly.blockRendering.register(CustomRenderer.NAME, CustomRenderer);
};
