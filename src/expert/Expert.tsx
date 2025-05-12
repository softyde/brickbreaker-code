// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import React, { useRef, useState } from 'react';

import './expert.scss';
import { useDispatch } from 'react-redux';
import {
    blocklyHighlightBlock,
    blocklyRemoveHighlightFromBlock,
} from '../editor/blockly/actions';
import { useSelector } from '../reducers';

import iconError from './expert-error.svg';
import iconOk from './expert-ok.svg';

interface ExpertProps {
    containerRef: React.RefObject<HTMLDivElement>;
}

const Expert: React.FC<ExpertProps> = ({ containerRef }) => {
    const boxRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 100, y: 100 });
    const isDragging = useRef(false);
    const offset = useRef({ x: 0, y: 0 });

    const dispatch = useDispatch();

    const foundIssues = useSelector((s) => s.expert.foundIssues);
    const hasIssues = useSelector((s) => s.expert.foundIssues.length > 0);

    const clamp = (val: number, min: number, max: number) =>
        Math.max(min, Math.min(val, max));

    const onMouseDown = (e: React.MouseEvent) => {
        isDragging.current = true;
        offset.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e: MouseEvent) => {
        if (!isDragging.current || !boxRef.current || !containerRef.current) {
            return;
        }

        const containerRect = containerRef.current.getBoundingClientRect();
        const boxRect = boxRef.current.getBoundingClientRect();

        const newX = e.clientX - offset.current.x;
        const newY = e.clientY - offset.current.y;

        const maxX = containerRect.width - boxRect.width;
        const maxY = containerRect.height - boxRect.height;

        setPosition({
            x: clamp(newX, 0, maxX),
            y: clamp(newY, 0, maxY),
        });
    };

    const onMouseUp = () => {
        isDragging.current = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };

    return (
        <div
            id="expert-dialog"
            className={hasIssues ? 'issue-error' : 'issue-ok'}
            ref={boxRef}
            onMouseDown={onMouseDown}
            style={{
                top: position.y,
                left: position.x,
            }}
        >
            <img
                aria-hidden={true}
                width={`120px`}
                height={`120px`}
                src={hasIssues ? iconError : iconOk}
            />
            {hasIssues ? (
                <div>
                    {foundIssues.map((issue, index) => (
                        // eslint-disable-next-line react/jsx-key
                        <div
                            className={`issue issue-${issue.severity}`}
                            key={index}
                            onMouseOver={() => {
                                dispatch(blocklyHighlightBlock(issue.blockId));
                            }}
                            onMouseOut={() => {
                                dispatch(blocklyRemoveHighlightFromBlock());
                            }}
                        >
                            {issue.label}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-ok">Das sieht gut aus.</div>
            )}
        </div>
    );
};

export default Expert;
