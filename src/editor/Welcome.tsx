// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2025 The Pybricks Authors

// welcome screen that is shown when no editor is open.

import { Colors } from '@blueprintjs/core';
import React, { useRef } from 'react';
import { useTernaryDarkMode } from 'usehooks-ts';
import LogoSvg from './logo';

function getFillColor(isDarkMode: boolean): string {
    return isDarkMode ? Colors.GRAY1 : Colors.GRAY5;
}

type WelcomeProps = {
    isVisible: boolean;
};

const Welcome: React.FunctionComponent<WelcomeProps> = (/*{ _isVisible }*/) => {
    const elementRef = useRef<HTMLDivElement>(null);
    const { isDarkMode } = useTernaryDarkMode();
    const fillColorRef = useRef('');
    // HACK: we don't want to image to flash when switching dark mode
    fillColorRef.current = getFillColor(isDarkMode);

    return (
        <div
            className="pb-editor-welcome"
            ref={elementRef}
            onContextMenuCapture={(e) => {
                e.stopPropagation();
                e.preventDefault();
            }}
        >
            <div className="spacing"></div>
            <div className="content">
                <div className="logo-svg">
                    <LogoSvg width={300} height={300} color="rgba(100,100,100,1)" />
                </div>
                <div className="welcome-text">
                    <div className="welcome-appname">Brickbreaker Code</div>
                    <div>Grundschule Am Egelpfuhl</div>
                    <div>Templin</div>
                    <div>Copyright © 2025 Philipp Anné</div>
                </div>
            </div>
            <div className="spacing"></div>
        </div>
    );
};

export default Welcome;
