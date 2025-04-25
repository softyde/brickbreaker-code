// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import * as Blockly from 'blockly';
import { PythonGenerator } from 'blockly/python';

import { BlockStyles } from '../editor/blockly/themes';
import i18next from '../i18next';

import eventBlocks from './event/index';
import movementBlocks from './movement/index';

import res from './translations/en.json';

export type BlockFunction = (
    block: Blockly.Block,
    generator: PythonGenerator,
) => string | [string, number] | null;

export type BlockTypeStatements = 'init' | 'default';

type Path<T, Prefix extends string = ''> = {
    [K in keyof T]: T[K] extends object
        ? T[K] extends Array<unknown>
            ? `${Prefix}${K & string}` // Arrays: stop here
            : `${Prefix}${K & string}` | Path<T[K], `${Prefix}${K & string}.`>
        : `${Prefix}${K & string}`;
}[keyof T];

export type FieldSeparator = {
    type: 'field_vertical_separator';
};

export type FieldInput = {
    type: 'field_input';
    name: string;
    text: string;
    spellcheck?: boolean;
};

export type FieldDropdown = {
    type: 'field_dropdown';
    name: string;
    options: [string, string][];
};

export type InputValue = {
    type: 'input_value';
    name: string;
    check: ['Number', string];
};

export type InputDummy = {
    type: 'input_dummy';
    name: string;
};

export type BlockType = {
    type: string;
    //tooltip: string;
    inputsInline?: boolean;
    message0?: Path<typeof res>;
    previousStatement?: BlockTypeStatements;
    nextStatement?: BlockTypeStatements;
    style: BlockStyles;
    extensions?: ('add_shadow_fields' | 'dynamic_var_list')[];
    args0: (FieldSeparator | FieldInput | FieldDropdown | InputValue | InputDummy)[];
};

export type BType = Omit<BlockType, 'message0' | 'extensions'> & {
    message0: string;
    extensions?: string[];
};

export type BlockDefinition = { def: BlockType; func: BlockFunction };

class Repository {
    _repo = new Map<string, BlockDefinition>();

    constructor() {
        [...eventBlocks, ...movementBlocks].forEach((a) => this.define(a));
    }

    define(block: BlockDefinition): void {
        this._repo.set(block.def.type, block);
    }

    _i18n(block: BlockType): BType {
        (block as BType).message0 = i18next.t(`blocks:${block.message0}`);

        return block as BType;
    }

    _extensions(block: BType): BType {
        const ext = ['add_my_custom_icon'];

        if (!block.extensions) {
            block.extensions = ext;
        } else {
            block.extensions = [...block.extensions, ...ext];
        }

        return block;
    }

    getBlocks(): BType[] {
        return this._repo
            .values()
            .map((a) => a.def)
            .map(this._i18n)
            .map(this._extensions)
            .toArray();
    }

    addAll(generator: PythonGenerator) {
        this._repo.forEach((a) => {
            generator.forBlock[a.def.type] = a.func;
        });
    }
}

const _repoSingleton = new Repository();

export default _repoSingleton;
