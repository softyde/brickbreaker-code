// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import * as Blockly from 'blockly';
import { categoryIcons, isCategoryStyle } from '../icons/categoryIcons';

class SeperatorField extends Blockly.Field {
    lineElement_: SVGElement | null;

    constructor(value: typeof Blockly.Field.SKIP_SETUP, validator?: null) {
        super(Blockly.Field.SKIP_SETUP, validator);

        this.SERIALIZABLE = true;
        this.EDITABLE = false;
        this.lineElement_ = null;
    }

    override getSize(): Blockly.utils.Size {
        return new Blockly.utils.Size(1, 16);
    }

    static fromJson(_options: Blockly.FieldConfig): Blockly.Field {
        return new SeperatorField(Blockly.Field.SKIP_SETUP, null);
    }

    protected override initView(): void {
        if (this.lineElement_) {
            // Image has already been initialized once.
            return;
        }

        // Build the DOM.
        /** @type {SVGElement} */

        const sourceBlock = this.sourceBlock_ as Blockly.BlockSvg;

        /** @type {SVGElement} */
        this.lineElement_ = Blockly.utils.dom.createSvgElement(
            'line',
            {
                stroke: sourceBlock.style.colourSecondary,
                'stroke-linecap': 'round',
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 16, // this.height_,
            },
            this.fieldGroup_,
        );
    }
}

class CustomCategory extends Blockly.ToolboxCategory {
    categoryStyle: string | undefined;

    /**
     * Constructor for a custom category.
     * @override
     */
    constructor(
        categoryDef: Blockly.utils.toolbox.CategoryInfo,
        parentToolbox: Blockly.IToolbox,
        opt_parent?: Blockly.ICollapsibleToolboxItem,
    ) {
        super(categoryDef, parentToolbox, opt_parent);

        this.categoryStyle = categoryDef.categorystyle;
    }

    /** @override */
    addColourBorder_(colour: string) {
        if (this.rowDiv_) {
            this.rowDiv_.style.backgroundColor = colour;
        }
    }

    /** @override */
    setSelected(isSelected: boolean) {
        if (!this.rowDiv_) {
            return;
        }

        // We do not store the label span on the category, so use getElementsByClassName.
        const labelDom = this.rowDiv_.getElementsByClassName(
            'blocklyTreeLabel',
        )[0] as HTMLElement;

        if (isSelected) {
            // Change the background color of the div to white.
            this.rowDiv_.style.backgroundColor = 'white';
            // Set the colour of the text to the colour of the category.
            labelDom.style.color = this.colour_;
            this.iconDom_?.setAttribute('style', `fill: ${this.colour_}`);
        } else {
            // Set the background back to the original colour.
            this.rowDiv_.style.backgroundColor = this.colour_;
            // Set the text back to white.
            labelDom.style.color = 'white';
            this.iconDom_?.setAttribute('style', `fill: white`);
        }
        // This is used for accessibility purposes.
        Blockly.utils.aria.setState(
            this.htmlDiv_!,
            Blockly.utils.aria.State.SELECTED,
            isSelected,
        );
    }

    createIconDom_(): Element {
        if (!this.categoryStyle) {
            return document.createElement('div');
        }

        const style = this.categoryStyle;

        if (isCategoryStyle(style)) {
            const iconSvg = categoryIcons[style];

            const parser = new DOMParser();
            const doc = parser.parseFromString(iconSvg, 'image/svg+xml');

            const svg = doc.documentElement as unknown as SVGElement;

            svg.setAttribute('width', '24px');
            svg.setAttribute('height', '24px');
            svg.setAttribute('style', 'fill: white');

            return svg;
        }

        return document.createElement('div');
    }
}

class CustomIcon extends Blockly.icons.Icon {
    styleName: string;

    // The constructor should always take in the source block so that svg elements
    // can be properly created.
    constructor(sourceBlock: Blockly.Block) {
        super(sourceBlock);

        this.styleName = sourceBlock.getStyleName();
    }

    getType(): Blockly.icons.IconType<CustomIcon> {
        return new Blockly.icons.IconType<CustomIcon>('my_icon');
    }

    initView(pointerdownListener: (e: PointerEvent) => void) {
        if (this.svgRoot) {
            return;
        } // Already initialized.

        // This adds the pointerdownListener to the svgRoot element.
        // If you do not call `super` you must do this yourself.
        super.initView(pointerdownListener);

        if (this.svgRoot === null) {
            console.log('already not initialized');
            return;
        } // Already initialized.

        const style = this.styleName;

        if (isCategoryStyle(style)) {
            const iconSvg = categoryIcons[style];

            const parser = new DOMParser();
            const doc = parser.parseFromString(iconSvg, 'image/svg+xml');

            const svg = doc.documentElement as unknown as SVGElement;

            svg.setAttribute('width', '24px');
            svg.setAttribute('height', '24px');
            svg.setAttribute('style', 'fill: white');

            (this.svgRoot as SVGElement).appendChild(doc.documentElement);
        }
    }

    getSize() {
        return new Blockly.utils.Size(24, 24);
    }

    getWeight() {
        return 10;
    }

    onClick() {
        // Do something when clicked.
    }

    updateEditable() {
        if (this.sourceBlock.isEditable()) {
            // Do editable things.
        } else {
            // Do non-editable things.
        }
    }

    isShownWhenCollapsed() {
        return true;
    }

    updateCollapsed() {
        // By default icons are hidden when the block is collapsed. We want it to
        // be shown, so do nothing.
    }

    dispose() {
        // Always call super!
        super.dispose();

        //this.myBubble?.dispose();
        //this.myOtherReference?.dispose();
    }
}

export const registerExtensions = function () {
    if (Blockly.registry.hasItem(typeof Blockly.icons.Icon, 'my_icon')) {
        console.debug('my_icon already registered');
    } else {
        Blockly.icons.registry.register(
            new Blockly.icons.IconType('my_icon'),
            CustomIcon,
        );
    }
    Blockly.Extensions.register('add_my_custom_icon', function () {
        // 'this' bezieht sich auf die Block-Instanz

        const block = this as Blockly.Block;
        if (block.getIcon('my_icon')) {
            console.log('My_Icon already exists');
            return;
        }

        const icon = new CustomIcon(this as Blockly.BlockSvg);

        block.addIcon(icon);
    });

    Blockly.registry.register(
        Blockly.registry.Type.TOOLBOX_ITEM,
        Blockly.ToolboxCategory.registrationName,
        CustomCategory,
        true,
    );
    Blockly.fieldRegistry.register('field_vertical_separator', SeperatorField);
};
