// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import * as Blockly from 'blockly';

/**
 * Class for zoom to fit control.
 */
export class ShowSourceControl implements Blockly.IPositionable {
    /**
     * The unique id for this component.
     */
    id = 'showSource';

    /**
     * The SVG group containing the zoom-to-fit control.
     */
    private svgGroup: SVGElement | null = null;

    /**
     * Left coordinate of the zoom-to-fit control.
     */
    private left = 0;

    /**
     * Top coordinate of the zoom-to-fit control.
     */
    private top = 0;

    /**
     * Width of the zoom-to-fit control.
     */
    private readonly width = 32;

    /**
     * Height of the zoom-to-fit control.
     */
    private readonly height = 32;

    /**
     * Distance between zoom-to-fit control and bottom or top edge of workspace.
     */
    private readonly marginVertical = 20;

    /**
     * Distance between zoom-to-fit control and right or left edge of workspace.
     */
    private readonly marginHorizontal = 20;

    /**
     * Whether this has been initialized.
     */
    private initialized = false;

    private onZoomToFitWrapper: Blockly.browserEvents.Data | null = null;

    /**
     * Constructor for zoom-to-fit control.
     *
     * @param workspace The workspace that the zoom-to-fit
     *     control will be added to.
     */
    constructor(
        protected workspace: Blockly.WorkspaceSvg,
        protected callback: () => void,
    ) {}

    /**
     * Initializes the zoom reset control.
     */
    init() {
        this.workspace.getComponentManager().addComponent({
            component: this,
            weight: 2,
            capabilities: [Blockly.ComponentManager.Capability.POSITIONABLE],
        });
        this.createDom();
        this.initialized = true;
        this.workspace.resize();
    }
    /**
     * Disposes of workspace search.
     * Unlink from all DOM elements and remove all event listeners
     * to prevent memory leaks.
     */
    dispose() {
        if (this.svgGroup) {
            Blockly.utils.dom.removeNode(this.svgGroup);
        }
        if (this.onZoomToFitWrapper) {
            Blockly.browserEvents.unbind(this.onZoomToFitWrapper);
            this.onZoomToFitWrapper = null;
        }
    }

    /**
     * Creates DOM for ui element.
     */
    private createDom() {
        this.svgGroup = Blockly.utils.dom.createSvgElement(Blockly.utils.Svg.IMAGE, {
            height: `${this.height}px`,
            width: `${this.width}px`,
            class: 'showSource',
        });
        this.svgGroup.setAttributeNS(
            Blockly.utils.dom.XLINK_NS,
            'xlink:href',
            zoomToFitSvgDataUri,
        );

        Blockly.utils.dom.insertAfter(this.svgGroup, this.workspace.getBubbleCanvas());

        // Attach listener.
        this.onZoomToFitWrapper = Blockly.browserEvents.conditionalBind(
            this.svgGroup,
            'pointerdown',
            null,
            this.onClick.bind(this),
        );
    }

    /**
     * Handle click event.
     *
     * @param e A pointer down event.
     */
    private onClick(e: PointerEvent) {
        this.callback();

        e.stopPropagation(); // avoid to also fire workspace click event
        e.preventDefault();
    }

    /**
     * Returns the bounding rectangle of the UI element in pixel units relative to
     * the Blockly injection div.
     *
     * @returns The component’s bounding box.
     */
    getBoundingRectangle(): Blockly.utils.Rect {
        return new Blockly.utils.Rect(
            this.top,
            this.top + this.height,
            this.left,
            this.left + this.width,
        );
    }

    /**
     * Positions the zoom-to-fit control.
     * It is positioned in the opposite corner to the corner the
     * categories/toolbox starts at.
     *
     * @param metrics The workspace metrics.
     * @param savedPositions List of rectangles that
     *     are already on the workspace.
     */
    position(
        metrics: Blockly.MetricsManager.UiMetrics,
        savedPositions: Blockly.utils.Rect[],
    ) {
        if (!this.initialized) {
            return;
        }
        const hasVerticalScrollbars =
            this.workspace.scrollbar &&
            this.workspace.scrollbar.canScrollHorizontally();
        const hasHorizontalScrollbars =
            this.workspace.scrollbar && this.workspace.scrollbar.canScrollVertically();

        if (
            metrics.toolboxMetrics.position === Blockly.TOOLBOX_AT_LEFT ||
            (this.workspace.horizontalLayout && !this.workspace.RTL)
        ) {
            // Right corner placement.
            this.left =
                metrics.absoluteMetrics.left +
                metrics.viewMetrics.width -
                this.width -
                this.marginHorizontal;
            if (hasVerticalScrollbars && !this.workspace.RTL) {
                this.left -= Blockly.Scrollbar.scrollbarThickness;
            }
        } else {
            // Left corner placement.
            this.left = this.marginHorizontal;
            if (hasVerticalScrollbars && this.workspace.RTL) {
                this.left += Blockly.Scrollbar.scrollbarThickness;
            }
        }

        const startAtBottom =
            metrics.toolboxMetrics.position !== Blockly.TOOLBOX_AT_BOTTOM;
        if (startAtBottom) {
            // Bottom corner placement
            this.top =
                metrics.absoluteMetrics.top +
                metrics.viewMetrics.height -
                this.height -
                this.marginVertical;
            if (hasHorizontalScrollbars) {
                // The horizontal scrollbars are always positioned on the bottom.
                this.top -= Blockly.Scrollbar.scrollbarThickness;
            }
        } else {
            // Upper corner placement
            this.top = metrics.absoluteMetrics.top + this.marginVertical;
        }

        // Check for collision and bump if needed.
        let boundingRect = this.getBoundingRectangle();
        for (let i = 0, otherEl; (otherEl = savedPositions[i]); i++) {
            if (boundingRect.intersects(otherEl)) {
                if (startAtBottom) {
                    // Bump up.
                    this.top = otherEl.top - this.height - this.marginVertical;
                } else {
                    // Bump down.
                    this.top = otherEl.bottom + this.marginVertical;
                }
                // Recheck other savedPositions
                boundingRect = this.getBoundingRectangle();
                i = -1;
            }
        }

        this.svgGroup?.setAttribute(
            'transform',
            `translate(${this.left}, ${this.top})`,
        );
    }
}

/**
 * Base64 encoded data uri for zoom to fit icon.
 */
const zoomToFitSvgDataUri =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjRweCIgaGVpZ2h0PSIyNHB4IiB2aWV3Qm94PSIwIDAgMzc4IDM3OCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4bWw6c3BhY2U9InByZXNlcnZlIiB4bWxuczpzZXJpZj0iaHR0cDovL3d3dy5zZXJpZi5jb20vIiBzdHlsZT0iZmlsbC1ydWxlOmV2ZW5vZGQ7Y2xpcC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS1taXRlcmxpbWl0OjI7Ij4KICAgIDxwYXRoIGQ9Ik0xODguOTc2LDBDMjkzLjI3NSwwIDM3Ny45NTMsODQuNjc3IDM3Ny45NTMsMTg4Ljk3NkMzNzcuOTUzLDI5My4yNzUgMjkzLjI3NSwzNzcuOTUzIDE4OC45NzYsMzc3Ljk1M0M4NC42NzcsMzc3Ljk1MyAwLDI5My4yNzUgMCwxODguOTc2QzAsODQuNjc3IDg0LjY3NywwIDE4OC45NzYsMFpNMzM0LjE0MiwxMTIuNjFDMzM0LjE0MiwxMDYuMDkyIDMyOC44NDksMTAwLjc5OSAzMjIuMzMsMTAwLjc5OUw1NS42MjIsMTAwLjc5OUM0OS4xMDQsMTAwLjc5OSA0My44MTEsMTA2LjA5MiA0My44MTEsMTEyLjYxTDQzLjgxMSwxMzYuMjMyQzQzLjgxMSwxNDIuNzUxIDQ5LjEwNCwxNDguMDQzIDU1LjYyMiwxNDguMDQzTDMyMi4zMywxNDguMDQzQzMyOC44NDksMTQ4LjA0MyAzMzQuMTQyLDE0Mi43NTEgMzM0LjE0MiwxMzYuMjMyTDMzNC4xNDIsMTEyLjYxWk0zMzQuMTQyLDI0MS43MkMzMzQuMTQyLDIzNS4yMDIgMzI4Ljg0OSwyMjkuOTA5IDMyMi4zMywyMjkuOTA5TDU1LjYyMiwyMjkuOTA5QzQ5LjEwNCwyMjkuOTA5IDQzLjgxMSwyMzUuMjAyIDQzLjgxMSwyNDEuNzJMNDMuODExLDI2NS4zNDNDNDMuODExLDI3MS44NjEgNDkuMTA0LDI3Ny4xNTQgNTUuNjIyLDI3Ny4xNTRMMzIyLjMzLDI3Ny4xNTRDMzI4Ljg0OSwyNzcuMTU0IDMzNC4xNDIsMjcxLjg2MSAzMzQuMTQyLDI2NS4zNDNMMzM0LjE0MiwyNDEuNzJaTTMzNC4xNDIsMTc3LjE2NUMzMzQuMTQyLDE3MC42NDcgMzI4Ljg0OSwxNjUuMzU0IDMyMi4zMywxNjUuMzU0TDU1LjYyMiwxNjUuMzU0QzQ5LjEwNCwxNjUuMzU0IDQzLjgxMSwxNzAuNjQ3IDQzLjgxMSwxNzcuMTY1TDQzLjgxMSwyMDAuNzg3QzQzLjgxMSwyMDcuMzA2IDQ5LjEwNCwyMTIuNTk4IDU1LjYyMiwyMTIuNTk4TDMyMi4zMywyMTIuNTk4QzMyOC44NDksMjEyLjU5OCAzMzQuMTQyLDIwNy4zMDYgMzM0LjE0MiwyMDAuNzg3TDMzNC4xNDIsMTc3LjE2NVoiLz4KPC9zdmc+';

Blockly.Css.register(`
.showSource {
  opacity: 0.2;
}

.pb-show-source .showSource {
    opacity: 0.5;
}

.showSource:hover {
  opacity: 0.6;
}
.showSource:active {
  opacity: 0.8;
}
`);
