// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import { BlockDefinition } from '../repository';

const block: BlockDefinition = {
    def: {
        type: 'start_program',
        message0: 'event.start.message',
        nextStatement: 'default',
        style: 'event_category',

        args0: [
            {
                type: 'field_vertical_separator',
            },
        ],
    },
    func: (_block, _generator) => {
        return `# Start program`;
    },
};

export default block;
