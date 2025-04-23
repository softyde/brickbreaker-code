// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import './activities.scss';
import { Tab, Tabs } from '@blueprintjs/core';
import React, { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Explorer from '../explorer/Explorer';
import Settings from '../settings/Settings';
import { Activity, useActivitiesSelectedActivity } from './hooks';
import * as Icons from './icons/icons';

/**
 * React component that acts as a tab control to select activities.
 */
const Activities: React.FunctionComponent = () => {
    const [selectedActivity, setSelectedActivity] = useActivitiesSelectedActivity();
    const { t } = useTranslation('activities');

    const handleAction = useCallback(
        (newActivity: Activity) => {
            // if activity is already selected, select none
            if (selectedActivity === newActivity) {
                setSelectedActivity(Activity.None);
            } else {
                // otherwise select the new activity
                setSelectedActivity(newActivity);
            }
        },
        [selectedActivity, setSelectedActivity],
    );

    // HACK: fix keyboard focus when no tab is selected

    const tabsRef = useRef<Tabs>(null);

    useEffect(() => {
        if (selectedActivity !== Activity.None) {
            // all is well
            return;
        }

        // @ts-expect-error: using private property
        const tablist: HTMLDivElement = tabsRef.current?.tablistElement;

        // istanbul-ignore-if: should not happen
        if (!tablist) {
            return;
        }

        const firstTab = tablist
            .getElementsByClassName('pb-activities-tablist-tab')
            .item(0);

        // istanbul-ignore-if: should not happen
        if (!firstTab) {
            return;
        }

        firstTab.setAttribute('tabindex', '0');
    }, [tabsRef, selectedActivity]);

    // HACK: hoist html title attribute from icon to tab

    useEffect(() => {
        // @ts-expect-error: using private property
        const tablist: HTMLDivElement = tabsRef.current?.tablistElement;

        // istanbul-ignore-if: should not happen
        if (!tablist) {
            return;
        }

        for (const element of tablist.getElementsByClassName(
            'pb-activities-tablist-tab',
        )) {
            const title = element.firstElementChild?.getAttribute('title');

            // istanbul-ignore-if: should not happen
            if (!title) {
                continue;
            }

            element.setAttribute('title', title);
            element.firstElementChild?.removeAttribute('title');
        }
    }, [tabsRef]);

    useEffect(() => {
        // @ts-expect-error: using private property
        const tablist: HTMLDivElement = tabsRef.current?.tablistElement;

        // istanbul-ignore-if: should not happen
        if (!tablist) {
            return;
        }

        tablist.setAttribute('aria-label', t('title'));
    }, [t]);

    return (
        <Tabs
            vertical={true}
            className="pb-activities"
            selectedTabId={selectedActivity}
            renderActiveTabPanelOnly={true}
            onChange={handleAction}
            ref={tabsRef}
        >
            <Tab
                itemID="pb-activities-explorer-tab"
                aria-label={t('explorer')}
                className="pb-activities-tablist-tab"
                id={Activity.Explorer}
                title={<Icons.Documents />}
                panel={<Explorer />}
                panelClassName="pb-activities-tabview"
                onMouseDown={(e) => e.stopPropagation()}
            />
            <Tab
                itemID="pb-activities-settings-tab"
                aria-label={t('settings')}
                className="pb-activities-tablist-tab"
                id={Activity.Settings}
                title={<Icons.Settings />}
                panel={<Settings />}
                panelClassName="pb-activities-tabview"
                onMouseDown={(e) => e.stopPropagation()}
            />
        </Tabs>
    );
};

export default Activities;
