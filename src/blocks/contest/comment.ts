// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import { BlockDefinition } from '../repository';
//import { shadowNumber, straightDirections } from '../types';

const block: BlockDefinition = {
    def: {
        type: 'comment',
        message0: 'contest.comment.message',
        previousStatement: 'default',
        nextStatement: 'default',
        style: 'comment_category',
        extensions: ['dynamic_var_list', 'add_shadow_fields'],
        inputsInline: true,

        args0: [
            {
                type: 'field_vertical_separator',
            },
            {
                type: 'field_multilinetext',
                name: 'VAR_TEXT',
                text: 'Kommentar',
                spellcheck: false,
            },
        ],
    },
    func: (block, _generator) => {
        const text = (block.getFieldValue('VAR_TEXT').trim() as string)
            .split('\n')
            .map((a) => `# ${a}`)
            .join('\n');

        return `${text}`;
    },
};

export default block;
