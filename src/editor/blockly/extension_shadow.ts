// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import * as Blockly from 'blockly';

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
    Blockly.Extensions.register('add_shadow_number', function () {
        // 'this' bezieht sich auf die Block-Instanz
        const block = this as Blockly.Block;

        block.inputList.forEach((element) => {
            if (!Array.isArray(element.connection?.getCheck())) {
                return;
            }

            const shadow_check = (element.connection!.getCheck() as string[]).find(
                (a) => a.startsWith('shadow_'),
            );

            if (shadow_check) {
                const shadowDom = createShadowDom(
                    this.workspace,
                    shadow_check,
                    {},
                ) as Element;

                element.connection?.setShadowDom(shadowDom);
            }
        });
    });
};
