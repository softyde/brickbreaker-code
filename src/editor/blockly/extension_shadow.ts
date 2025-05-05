// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import * as Blockly from 'blockly';
import { add_shadow_fields, shadow, shadow_number_type } from './blocks';

type ShadowFieldNumberState = {
    value: string | number | null;
    min: number;
    max: number;
    precision: number;
};

class ShadowFieldNumber extends Blockly.FieldNumber {
    override saveState(_doFullSerialization?: boolean): ShadowFieldNumberState {
        return {
            value: this.getValue(),
            min: this.getMin(),
            max: this.getMax(),
            precision: this.getPrecision(),
        };
    }

    override loadState(state: ShadowFieldNumberState) {
        this.setConstraints(state.min, state.max, state.precision);
        this.setValue(state.value);
    }
}

function createShadowDom(
    workspace: Blockly.Workspace,
    blockType: string,
    fieldConfigs = {},
) {
    // Block erstellen
    const block = workspace.newBlock(blockType);

    // Felder konfigurieren
    for (const [fieldName, value] of Object.entries(fieldConfigs)) {
        if (block.getField(fieldName)) {
            block.setFieldValue(value, fieldName);
        }
    }

    // In DOM umwandeln
    const blockDom = Blockly.Xml.blockToDom(block) as Element;

    // Neues shadow-Element erstellen
    const shadowDom = Blockly.utils.xml.createElement('shadow');

    // Attribute vom Block-Element zum Shadow-Element kopieren
    for (let i = 0; i < blockDom.attributes.length; i++) {
        const attr = blockDom.attributes[i];
        shadowDom.setAttribute(attr.name, attr.value);
    }

    // Kinder-Elemente kopieren
    while (blockDom.firstChild) {
        shadowDom.appendChild(blockDom.firstChild);
    }
    // Block entfernen, da er nur temporär benötigt wurde
    block.dispose();

    return shadowDom;
}

export const registerExtension = function () {
    Blockly.fieldRegistry.register(shadow_number_type, ShadowFieldNumber);

    Blockly.Extensions.register(add_shadow_fields, function () {
        // 'this' bezieht sich auf die Block-Instanz
        const block = this as Blockly.Block;

        block.inputList.forEach((element) => {
            if (!element.connection || !Array.isArray(element.connection.getCheck())) {
                return;
            }

            const shadow_check = (element.connection.getCheck() as string[]).find((a) =>
                a.startsWith(shadow),
            );

            if (!shadow_check) {
                return;
            }

            const [shadowType, ...parameters] = shadow_check.split('/');

            const shadowDom = createShadowDom(
                this.workspace,
                shadowType,
                {},
            ) as Element;

            element.connection.setShadowDom(shadowDom);

            const shadowBlock = element.connection.targetConnection?.getSourceBlock();
            if (!shadowBlock) {
                throw 'das sollte nicht so sein';
            }

            if (shadowType.startsWith('shadow_')) {
                const field = shadowBlock.inputList[0]
                    .fieldRow[0] as Blockly.FieldNumber;
                field.setConstraints(parameters[1], parameters[2], parameters[3]);
                field.setValue(parameters[0]);
            }
        });
    });
};
