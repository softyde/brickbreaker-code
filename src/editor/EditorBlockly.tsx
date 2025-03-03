// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import './editorBlockly.scss';

import * as Blockly from 'blockly/core';
import React, { useRef } from 'react';

import { useEffectOnce } from 'usehooks-ts';
import { categoryIcons, isCategoryStyle } from './icons/categoryIcons';
//import { UUID } from '../fileStorage';
//import { useFileStoragePath } from '../fileStorage/hooks';
//import { blockyFileExtension } from '../pybricksMicropython/lib';
//import { useSelector } from '../reducers';

type BlocklyWorkspaceListener = (workspace: Blockly.Workspace) => void;

const listeners: BlocklyWorkspaceListener[] = [];

export interface IDisposable {
    dispose(): void;
}

export function onDidCreateBlocklyEditor(
    listener: (workspace: Blockly.Workspace) => void,
): IDisposable {
    listeners.push(listener);

    return {
        dispose: () => {
            const index = listeners.indexOf(listener);
            if (index !== -1) {
                listeners.splice(index, 1);
            } else {
                throw new Error('disposable not found');
            }
        },
    };
}

function notifyDidCreateBlocklyEditor(workspace: Blockly.Workspace) {
    listeners.forEach((listener) => listener(workspace));
}

class SeperatorField extends Blockly.Field {
    lineElement_: SVGElement | null;

    constructor(value: typeof Blockly.Field.SKIP_SETUP, validator?: null) {
        super(Blockly.Field.SKIP_SETUP, validator);

        //this.SERIALIZABLE = true;

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
        // if (this.fieldGroup_ === null) {
        //     return;
        // }

        // Build the DOM.
        /** @type {SVGElement} */

        /*
        if (!this.visible_) {
            this.fieldGroup_.style.display = 'none';
        }*/

        const sourceBlock = this.sourceBlock_ as Blockly.BlockSvg;
        /*
        applyColour() {

  const sourceBlock = this.sourceBlock_;
  if (sourceBlock.isShadow()) {
    this.arrow_.style.fill = sourceBlock.style.colourSecondary;
  } else {
    this.arrow_.style.fill = sourceBlock.style.colourPrimary;
  }
}

        */

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

        //this.fieldGroup_.appendChild(this.fieldGroup_);
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

        // (this.svgRoot as SVGElement).appendChild(doc.documentElement);
        // const img = document.createElement('img') as HTMLImageElement;
        // img.src = CategoryStartIcon;
        // img.width = 32;
        // img.height = 32;
        // return img;
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
            console.log('already initialized');
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

const BlocklyEditor: React.FunctionComponent = () => {
    const blocklyEditorRef = useRef<HTMLDivElement>(null);

    const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);

    useEffectOnce(() => {
        // istanbul ignore if: should never happen
        if (!blocklyEditorRef.current) {
            console.error('no blocklyEditorRef!');
            return;
        }

        Blockly.icons.registry.register(
            new Blockly.icons.IconType('my_icon'),
            CustomIcon,
        );

        Blockly.Extensions.register('add_my_custom_icon', function () {
            // 'this' bezieht sich auf die Block-Instanz

            const icon = new CustomIcon(this as Blockly.BlockSvg);
            (this as Blockly.Block).addIcon(icon);
        });

        Blockly.registry.register(
            Blockly.registry.Type.TOOLBOX_ITEM,
            Blockly.ToolboxCategory.registrationName,
            CustomCategory,
            true,
        );

        Blockly.fieldRegistry.register('field_vertical_separator', SeperatorField);

        const theme = Blockly.Theme.defineTheme('themeName', {
            name: 'themeName',
            base: Blockly.Themes.Classic,
            blockStyles: {
                logic_blocks: {
                    colourPrimary: '#4a148c',
                },
                hub_category: {
                    colourPrimary: '#0c74f2',
                    //colourSecondary: '#0c74f2',
                    //colourTertiary: '#0c74f2',
                },
                event_category: {
                    colourPrimary: '#f2bd0c',
                    //colourSecondary: '#f2d985',
                    //colourTertiary: '#735906',
                    hat: 'cap',
                },
                movement_category: {
                    colourPrimary: '#bc0cf2',
                },
            },
            categoryStyles: {
                event_category: {
                    colour: '#f2bd0c',
                },
                hub_category: {
                    colour: '#0c74f2',
                },
                movement_category: {
                    colour: '#bc0cf2',
                },
            },
            componentStyles: {
                toolboxBackgroundColour: '#e4e7ed',
                toolboxForegroundColour: '#000',
                flyoutBackgroundColour: '#e4e7ed',
                flyoutOpacity: 0.66,

                workspaceBackgroundColour: '#fcfcfc',
                scrollbarColour: '#000000',
                scrollbarOpacity: 0.5,

                /*workspaceBackgroundColour: '#1e1e1e',
                toolboxBackgroundColour: 'blackBackground',
                toolboxForegroundColour: '#fff',
                flyoutBackgroundColour: '#252526',
                flyoutForegroundColour: '#ccc',
                flyoutOpacity: 1,
                scrollbarColour: '#797979',
                insertionMarkerColour: '#fff',
                insertionMarkerOpacity: 0.3,
                scrollbarOpacity: 0.4,
                cursorColour: '#d0d0d0',*/
                //blackBackground: '#333',
            },
            fontStyle: {
                family: '-apple-system, "BlinkMacSystemFont", "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Open Sans", "Helvetica Neue", sans-serif',
                weight: 'normal',
                size: 14,
            },
            //startHats: true,
        });

        Blockly.defineBlocksWithJsonArray([
            {
                type: 'start_program',
                message0: 'Wenn Programm startet',
                tooltip: 'Wenn das Programm startet',
                nextStatement: null,
                style: 'event_category',
                extensions: ['add_my_custom_icon'],
            },
            {
                type: 'setup_program',
                message0: '%1 Initialisierung',
                tooltip: 'tbd',
                nextStatement: null,
                style: 'event_category',
                extensions: ['add_my_custom_icon'],

                args0: [
                    {
                        type: 'field_vertical_separator',
                        name: 'VAR1',
                    },
                ],
            },
            {
                type: 'move_straight_block',
                message0: '%3 Fahre %1 %2cm',
                style: 'movement_category',
                extensions: ['add_my_custom_icon'],

                args0: [
                    {
                        type: 'field_variable',
                        name: 'VAR1',
                        variable: 'Vorwärts',
                    },
                    {
                        type: 'field_input',
                        name: 'VAR2',
                        text: '10',
                        check: 'Number',
                    },
                    {
                        type: 'field_vertical_separator',
                        name: 'VAR3',
                    },
                ],
                nextStatement: null,
                previousStatement: null,
            },
            {
                type: 'move_curve_block',
                message0: '%2 Drehe um %1°',
                style: 'movement_category',
                extensions: ['add_my_custom_icon'],

                args0: [
                    {
                        type: 'field_variable',
                        name: 'VAR1',
                        variable: '90',
                    },
                    {
                        type: 'field_vertical_separator',
                        name: 'VAR2',
                    },
                ],
                nextStatement: null,
                previousStatement: null,
            },
            {
                type: 'move_follow_line',
                message0: '%2 Folge der Linie für höchstens %1cm',
                style: 'movement_category',
                extensions: ['add_my_custom_icon'],

                args0: [
                    {
                        type: 'field_variable',
                        name: 'VAR1',
                        variable: '10',
                    },
                    {
                        type: 'field_vertical_separator',
                        name: 'VAR2',
                    },
                ],
                nextStatement: null,
                previousStatement: null,
            },
            {
                type: 'hub_block',
                message0: '%4 %1 mit Oberseite %2 und Vorderseite %3',
                nextStatement: null,
                previousStatement: null,
                style: 'hub_category',
                extensions: ['add_my_custom_icon'],

                args0: [
                    {
                        type: 'field_input',
                        name: 'VAR1',
                        text: 'Spike Prime',
                    },
                    {
                        type: 'field_variable',
                        name: 'VAR2',
                        variable: 'z-Achse',
                        variableTypes: [''],
                    },
                    {
                        type: 'field_variable',
                        name: 'VAR3',
                        variable: 'x-Achse',
                        variableTypes: [''],
                    },
                    {
                        type: 'field_vertical_separator',
                        name: 'VAR4',
                    },
                ],
            },
            {
                type: 'line_follow_block',
                message0: '%3 Sensoren zur Linienverfolgung an %1 und %2',
                nextStatement: null,
                previousStatement: null,
                style: 'hub_category',
                extensions: ['add_my_custom_icon'],

                args0: [
                    {
                        type: 'field_variable',
                        name: 'VAR1',
                        variable: 'Port C',
                        variableTypes: [''],
                    },
                    {
                        type: 'field_variable',
                        name: 'VAR2',
                        variable: 'Port D',
                        variableTypes: [''],
                    },
                    {
                        type: 'field_vertical_separator',
                        name: 'VAR4',
                    },
                ],
            },
        ]);
        /*
        const theme = Blockly.Theme.defineTheme('themeName', {
            base: Blockly.Themes.Classic,
            blockStyles: {
                logic_blocks: {
                    colourPrimary: '#4a148c',
                },
                math_blocks: {},
            },
            categoryStyles: {},
            componentStyles: {},
            fontStyle: {},
            startHats: true,
        });*/

        const toolbox = {
            // There are two kinds of toolboxes. The simpler one is a flyout toolbox.
            kind: 'categoryToolbox',
            // The contents is the blocks and other items that exist in your toolbox.
            contents: [
                {
                    kind: 'category',
                    name: 'Ereignisse',
                    categorystyle: 'event_category',
                    contents: [
                        {
                            kind: 'block',
                            type: 'setup_program',
                        },
                        {
                            kind: 'block',
                            type: 'start_program',
                        },
                    ],
                },
                {
                    kind: 'category',
                    name: 'Hub',
                    categorystyle: 'hub_category',
                    contents: [
                        {
                            kind: 'block',
                            type: 'hub_block',
                        },
                        {
                            kind: 'block',
                            type: 'line_follow_block',
                        },
                    ],
                },
                {
                    kind: 'category',
                    name: 'Bewegung',
                    categorystyle: 'movement_category',
                    contents: [
                        {
                            kind: 'block',
                            type: 'move_straight_block',
                        },
                        {
                            kind: 'block',
                            type: 'move_curve_block',
                        },
                        {
                            kind: 'block',
                            type: 'move_follow_line',
                        },
                    ],
                },
            ],
        };

        workspaceRef.current = Blockly.inject(blocklyEditorRef.current, {
            toolbox: toolbox,
            renderer: 'zelos',
            sounds: true,
            media: './blockly/',
            theme: theme,
            grid: {
                spacing: 40,
                length: 6,
                colour: '#ccc',
                snap: true,
            },
            trashcan: true,
            zoom: {
                controls: true,
                wheel: true,
                startScale: 1.0,
                maxScale: 3,
                minScale: 0.3,
                scaleSpeed: 1.2,
                pinch: true,
            },
        });

        // Erstelle einen ResizeObserver, um auf Größenänderungen zu reagieren
        resizeObserverRef.current = new ResizeObserver(() => {
            // Debounce die Resize-Funktion
            /*if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }

            const resizeTimeout = setTimeout(() => {*/
            resizeBlockly();
            //}, 50); // 50ms Verzögerung
        });

        // Beobachte den Container für Größenänderungen
        resizeObserverRef.current.observe(blocklyEditorRef.current);

        // Führe initiales Resize durch
        resizeBlockly();

        notifyDidCreateBlocklyEditor(workspaceRef.current);

        return () => {
            //setEditor(undefined);
        };
    });

    const resizeBlockly = () => {
        // Prüfe, ob der Workspace noch existiert
        if (!workspaceRef.current) {
            return;
        }

        // Füge eine kleine Verzögerung ein, um Flackern zu vermeiden
        window.requestAnimationFrame(() => {
            // Berechne die neue Größe basierend auf dem Container
            const metrics = workspaceRef.current!.getMetrics();

            // Resize nur durchführen, wenn Metrics verfügbar sind
            if (metrics) {
                Blockly.svgResize(workspaceRef.current!);
                workspaceRef.current!.render();
            }
        });
    };

    //const { activeFileUuid } = useSelector((s) => s.editor);
    //const fileName = useFileStoragePath(activeFileUuid ?? ('' as UUID));
    //const isBlocky = fileName?.endsWith(blockyFileExtension);

    //
    return (
        <>
            <div className={'pb-editor-blockly'} ref={blocklyEditorRef} />
        </>
    );
};

export default BlocklyEditor;
