// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import { BlockDefinition } from '../repository';

const block: BlockDefinition = {
    def: {
        type: 'setup_program',
        message0: 'event.setup.message',
        nextStatement: 'init',
        style: 'event_category',

        args0: [
            {
                type: 'field_vertical_separator',
            },
        ],
    },
    func: (_block, _generator) => {
        return `# Setup program`;
    },
};

export default block;
