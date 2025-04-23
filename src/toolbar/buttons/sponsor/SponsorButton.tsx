// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2023 The Pybricks Authors

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { sponsorShowDialog } from '../../../sponsor/actions';
import ActionButton, { ActionButtonProps } from '../../ActionButton';
import icon from './icon.svg';

type SponsorButtonProps = Pick<ActionButtonProps, 'id'>;

const SponsorButton: React.FunctionComponent<SponsorButtonProps> = ({ id }) => {
    const { t } = useTranslation('sponsorButton');
    const dispatch = useDispatch();

    return (
        <ActionButton
            id={id}
            label={t('label')}
            tooltip={t('tooltip.action')}
            icon={icon}
            onAction={() => dispatch(sponsorShowDialog())}
        />
    );
};

export default SponsorButton;
