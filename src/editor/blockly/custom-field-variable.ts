// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Variable input field.
 *
 * @class
 */
// Former goog.module ID: Blockly.FieldVariable

// Unused import preserved for side-effects. Remove if unneeded.

import * as Blockly from 'blockly';

// import type { Block } from './block.js';
// import { Field, FieldConfig, UnattachedFieldError } from './field.js';
// import {
//     FieldDropdown,
//     FieldDropdownValidator,
//     MenuGenerator,
//     MenuOption,
// } from './field_dropdown.js';
// import * as fieldRegistry from './field_registry.js';
// import * as internalConstants from './internal_constants.js';
// import type { Menu } from './menu.js';
// import type { MenuItem } from './menuitem.js';
// import { Msg } from './msg.js';
// import * as parsing from './utils/parsing.js';
// import { Size } from './utils/size.js';
// import { VariableModel } from './variable_model.js';
// import * as Variables from './variables.js';
// import * as Xml from './xml.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDuringMigration = any;

export const NONE_SELECTED = 'NONE.';

/**
 * Class for a variable's dropdown field.
 */
export class CustomFieldVariable extends Blockly.FieldDropdown {
    protected override menuGenerator_: Blockly.MenuGenerator | undefined;
    defaultVariableName: string;

    /** The type of the default variable for this field. */
    private defaultType = '';

    /**
     * All of the types of variables that will be available in this field's
     * dropdown.
     */
    variableTypes: string[] | null = [];
    protected override size_: Blockly.utils.Size;

    /** The variable model associated with this field. */
    private variable: Blockly.VariableModel | null = null;

    /**
     * Serializable fields are saved by the serializer, non-serializable fields
     * are not. Editable fields should also be serializable.
     */
    override SERIALIZABLE = true;

    /**
     * @param varName The default name for the variable.
     *     If null, a unique variable name will be generated.
     *     Also accepts Field.SKIP_SETUP if you wish to skip setup (only used by
     * subclasses that want to handle configuration and setting the field value
     * after their own constructors have run).
     * @param validator A function that is called to validate changes to the
     *     field's value. Takes in a variable ID  & returns a validated variable
     *     ID, or null to abort the change.
     * @param variableTypes A list of the types of variables to include in the
     *     dropdown. Will only be used if config is not provided.
     * @param defaultType The type of variable to create if this field's value
     *     is not explicitly set.  Defaults to ''. Will only be used if config
     *     is not provided.
     * @param config A map of options used to configure the field.
     *    See the [field creation documentation]{@link
     * https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/variable#creation}
     * for a list of properties this parameter supports.
     */
    constructor(
        varName: string | null | typeof Blockly.Field.SKIP_SETUP,
        validator?: Blockly.FieldVariableValidator,
        variableTypes?: string[],
        defaultType?: string,
        config?: Blockly.FieldVariableConfig,
    ) {
        super(Blockly.Field.SKIP_SETUP);

        /**
         * An array of options for a dropdown list,
         * or a function which generates these options.
         */
        this.menuGenerator_ =
            CustomFieldVariable.dropdownCreate as Blockly.MenuGenerator;

        /**
         * The initial variable name passed to this field's constructor, or an
         * empty string if a name wasn't provided. Used to create the initial
         * variable.
         */
        this.defaultVariableName = typeof varName === 'string' ? varName : '';

        /** The size of the area rendered by the field. */
        this.size_ = new Blockly.utils.Size(0, 0);

        if (varName === Blockly.Field.SKIP_SETUP) {
            return;
        }

        if (config) {
            this.configure_(config);
        } else {
            this.setTypes(variableTypes, defaultType);
        }
        if (validator) {
            this.setValidator(validator);
        }
    }

    /**
     * Configure the field based on the given map of options.
     *
     * @param config A map of options to configure the field based on.
     */
    protected override configure_(config: Blockly.FieldVariableConfig) {
        super.configure_(config);
        this.setTypes(config.variableTypes, config.defaultType);
    }

    /**
     * Initialize the model for this field if it has not already been initialized.
     * If the value has not been set to a variable by the first render, we make up
     * a variable rather than let the value be invalid.
     */
    override initModel() {
        const block = this.getSourceBlock();
        if (!block) {
            throw new Blockly.UnattachedFieldError();
        }
        if (this.variable) {
            return; // Initialization already happened.
        }

        const variable = Blockly.Variables.getOrCreateVariablePackage(
            block.workspace,
            null,
            this.defaultVariableName,
            this.defaultType,
        );
        // Don't call setValue because we don't want to cause a rerender.
        this.doValueUpdate_(variable.getId()); // WAS variable.getId());
    }

    override shouldAddBorderRect_() {
        const block = this.getSourceBlock();
        if (!block) {
            throw new Blockly.UnattachedFieldError();
        }
        return (
            super.shouldAddBorderRect_() &&
            (!this.getConstants()!.FIELD_DROPDOWN_NO_BORDER_RECT_SHADOW ||
                block.type !== 'variables_get')
        );
    }

    /**
     * Initialize this field based on the given XML.
     *
     * @param fieldElement The element containing information about the variable
     *     field's state.
     */
    override fromXml(fieldElement: Element) {
        const block = this.getSourceBlock();
        if (!block) {
            throw new Blockly.UnattachedFieldError();
        }
        const id = fieldElement.getAttribute('id');
        const variableName = fieldElement.textContent;
        // 'variabletype' should be lowercase, but until July 2019 it was sometimes
        // recorded as 'variableType'.  Thus we need to check for both.
        const variableType =
            fieldElement.getAttribute('variabletype') ||
            fieldElement.getAttribute('variableType') ||
            '';

        // AnyDuringMigration because:  Argument of type 'string | null' is not
        // assignable to parameter of type 'string | undefined'.
        const variable = Blockly.Variables.getOrCreateVariablePackage(
            block.workspace,
            id,
            variableName as AnyDuringMigration,
            variableType,
        );

        // This should never happen :)
        if (variableType !== null && variableType !== variable.type) {
            throw Error(
                "Serialized variable type with id '" +
                    variable.getId() +
                    "' had type " +
                    variable.type +
                    ', and ' +
                    'does not match variable field that references it: ' +
                    Blockly.Xml.domToText(fieldElement) +
                    '.',
            );
        }

        this.setValue(variable.getId());
    }

    /**
     * Serialize this field to XML.
     *
     * @param fieldElement The element to populate with info about the field's
     *     state.
     * @returns The element containing info about the field's state.
     */
    override toXml(fieldElement: Element): Element {
        // Make sure the variable is initialized.
        this.initModel();

        fieldElement.id = this.variable!.getId();
        fieldElement.textContent = this.variable!.name;
        if (this.variable!.type) {
            fieldElement.setAttribute('variabletype', this.variable!.type);
        }
        return fieldElement;
    }

    /**
     * Saves this field's value.
     *
     * @param doFullSerialization If true, the variable field will serialize the
     *     full state of the field being referenced (ie ID, name, and type) rather
     *     than just a reference to it (ie ID).
     * @returns The state of the variable field.
     * @internal
     */
    override saveState(doFullSerialization?: boolean): AnyDuringMigration {
        const legacyState = this.saveLegacyState(Blockly.FieldVariable);
        if (legacyState !== null) {
            return legacyState;
        }
        // Make sure the variable is initialized.
        this.initModel();
        const state = { id: this.variable!.getId() };
        if (doFullSerialization) {
            (state as AnyDuringMigration)['name'] = this.variable!.name;
            (state as AnyDuringMigration)['type'] = this.variable!.type;
        }
        return state;
    }

    /**
     * Sets the field's value based on the given state.
     *
     * @param state The state of the variable to assign to this variable field.
     * @internal
     */
    override loadState(state: AnyDuringMigration) {
        const block = this.getSourceBlock();
        if (!block) {
            throw new Blockly.UnattachedFieldError();
        }
        if (this.loadLegacyState(Blockly.FieldVariable, state)) {
            return;
        }
        // This is necessary so that blocks in the flyout can have custom var names.
        const variable = Blockly.Variables.getOrCreateVariablePackage(
            block.workspace,
            state['id'] || null,
            state['name'],
            state['type'] || '',
        );
        this.setValue(variable.getId());
    }

    /**
     * Attach this field to a block.
     *
     * @param block The block containing this field.
     */
    override setSourceBlock(block: Blockly.Block) {
        if (block.isShadow()) {
            throw Error('Variable fields are not allowed to exist on shadow blocks.');
        }
        super.setSourceBlock(block);
    }

    /**
     * Get the variable's ID.
     *
     * @returns Current variable's ID.
     */
    override getValue(): string | null {
        return this.variable ? this.variable.getId() : null;
    }

    /**
     * Get the text from this field, which is the selected variable's name.
     *
     * @returns The selected variable's name, or the empty string if no variable
     *     is selected.
     */
    override getText(): string {
        return this.variable ? this.variable.name : '';
    }

    /**
     * Get the variable model for the selected variable.
     * Not guaranteed to be in the variable map on the workspace (e.g. if accessed
     * after the variable has been deleted).
     *
     * @returns The selected variable, or null if none was selected.
     * @internal
     */
    getVariable(): Blockly.VariableModel | null {
        return this.variable;
    }

    /**
     * Gets the validation function for this field, or null if not set.
     * Returns null if the variable is not set, because validators should not
     * run on the initial setValue call, because the field won't be attached to
     * a block and workspace at that point.
     *
     * @returns Validation function, or null.
     */
    override getValidator(): Blockly.FieldVariableValidator | null {
        // Validators shouldn't operate on the initial setValue call.
        // Normally this is achieved by calling setValidator after setValue, but
        // this is not a possibility with variable fields.
        if (this.variable) {
            return this.validator_;
        }
        return null;
    }

    /**
     * Ensure that the ID belongs to a valid variable of an allowed type.
     *
     * @param newValue The ID of the new variable to set.
     * @returns The validated ID, or null if invalid.
     */
    protected override doClassValidation_(
        newValue?: AnyDuringMigration,
    ): string | null {
        if (newValue === null) {
            return null;
        }
        const block = this.getSourceBlock();
        if (!block) {
            throw new Blockly.UnattachedFieldError();
        }
        const newId = newValue as string;
        const variable = Blockly.Variables.getVariable(block.workspace, newId);
        if (!variable) {
            console.warn(
                "Variable id doesn't point to a real variable! " +
                    'ID was ' +
                    newId +
                    ' block: ' +
                    block.id,
            );
            return null; //; // WAS null;
        }
        // Type Checks.
        const type = variable.type;
        if (!this.typeIsAllowed(type)) {
            console.warn("Variable type doesn't match this field!  Type was " + type);
            return null;
        }
        return newId;
    }

    /**
     * Update the value of this variable field, as well as its variable and text.
     *
     * The variable ID should be valid at this point, but if a variable field
     * validator returns a bad ID, this could break.
     *
     * @param newId The value to be saved.
     */
    protected override doValueUpdate_(newId: string) {
        const block = this.getSourceBlock();
        if (!block) {
            throw new Blockly.UnattachedFieldError();
        }
        this.variable = Blockly.Variables.getVariable(block.workspace, newId as string);
        super.doValueUpdate_(newId);
    }

    /**
     * Check whether the given variable type is allowed on this field.
     *
     * @param type The type to check.
     * @returns True if the type is in the list of allowed types.
     */
    private typeIsAllowed(type: string): boolean {
        const typeList = this.getVariableTypes();
        if (!typeList) {
            return true; // If it's null, all types are valid.
        }
        for (let i = 0; i < typeList.length; i++) {
            if (type === typeList[i]) {
                return true;
            }
        }
        return false;
    }

    /**
     * Return a list of variable types to include in the dropdown.
     *
     * @returns Array of variable types.
     * @throws {Error} if variableTypes is an empty array.
     */
    private getVariableTypes(): string[] {
        let variableTypes = this.variableTypes;
        if (variableTypes === null) {
            // If variableTypes is null, return all variable types.
            if (this.sourceBlock_ && !this.sourceBlock_.isDeadOrDying()) {
                return this.sourceBlock_.workspace.getVariableTypes();
            }
        }
        variableTypes = variableTypes || [''];
        if (variableTypes.length === 0) {
            // Throw an error if variableTypes is an empty list.
            const name = this.getText();
            throw Error(
                "'variableTypes' of field variable " + name + ' was an empty list',
            );
        }
        return variableTypes;
    }

    /**
     * Parse the optional arguments representing the allowed variable types and
     * the default variable type.
     *
     * @param variableTypes A list of the types of variables to include in the
     *     dropdown.  If null or undefined, variables of all types will be
     *     displayed in the dropdown.
     * @param defaultType The type of the variable to create if this field's
     *     value is not explicitly set.  Defaults to ''.
     */
    private setTypes(variableTypes: string[] | null = null, defaultType = '') {
        // If you expected that the default type would be the same as the only entry
        // in the variable types array, tell the Blockly team by commenting on
        // #1499.
        // Set the allowable variable types.  Null means all types on the workspace.
        if (Array.isArray(variableTypes)) {
            // Make sure the default type is valid.
            let isInArray = false;
            for (let i = 0; i < variableTypes.length; i++) {
                if (variableTypes[i] === defaultType) {
                    isInArray = true;
                }
            }
            if (!isInArray) {
                throw Error(
                    "Invalid default type '" +
                        defaultType +
                        "' in " +
                        'the definition of a FieldVariable',
                );
            }
        } else if (variableTypes !== null) {
            throw Error(
                "'variableTypes' was not an array in the definition of " +
                    'a FieldVariable',
            );
        }
        // Only update the field once all checks pass.
        this.defaultType = defaultType;
        this.variableTypes = variableTypes;
    }

    /**
     * Refreshes the name of the variable by grabbing the name of the model.
     * Used when a variable gets renamed, but the ID stays the same. Should only
     * be called by the block.
     *
     * @internal
     */
    override refreshVariableName() {
        this.forceRerender();
    }

    /**
     * Handle the selection of an item in the variable dropdown menu.
     * Special case the 'Rename variable...' and 'Delete variable...' options.
     * In the rename case, prompt the user for a new name.
     *
     * @param menu The Menu component clicked.
     * @param menuItem The MenuItem selected within menu.
     */
    protected override onItemSelected_(menu: Blockly.Menu, menuItem: Blockly.MenuItem) {
        const id = menuItem.getValue();
        // // Handle special cases.
        // if (this.sourceBlock_ && !this.sourceBlock_.isDeadOrDying()) {
        //     if (id === internalConstants.RENAME_VARIABLE_ID) {
        //         // Rename variable.
        //         Blockly.Variables.renameVariable(
        //             this.sourceBlock_.workspace,
        //             this.variable as Blockly.VariableModel,
        //         );
        //         return;
        //     } else if (id === internalConstants.DELETE_VARIABLE_ID) {
        //         // Delete variable.
        //         this.sourceBlock_.workspace.deleteVariableById(this.variable!.getId());
        //         return;
        //     }
        // }
        // Handle unspecial case.
        this.setValue(id);
    }

    /**
     * Overrides referencesVariables(), indicating this field refers to a
     * variable.
     *
     * @returns True.
     * @internal
     */
    override referencesVariables(): boolean {
        return true;
    }

    /**
     * Construct a FieldVariable from a JSON arg object,
     * dereferencing any string table references.
     *
     * @param options A JSON object with options (variable, variableTypes, and
     *     defaultType).
     * @returns The new field instance.
     * @nocollapse
     * @internal
     */
    static override fromJson(
        options: Blockly.FieldVariableFromJsonConfig,
    ): CustomFieldVariable {
        const varName = Blockly.utils.parsing.replaceMessageReferences(
            options.variable,
        );
        // `this` might be a subclass of FieldVariable if that class doesn't
        // override the static fromJson method.
        return new this(varName, undefined, undefined, undefined, options);
    }

    /**
     * Return a sorted list of variable names for variable dropdown menus.
     * Include a special option at the end for creating a new variable name.
     *
     * @returns Array of variable names/id tuples.
     */
    static dropdownCreate(this: CustomFieldVariable): Blockly.MenuOption[] {
        if (!this.variable) {
            throw Error(
                'Tried to call dropdownCreate on a variable field with no' +
                    ' variable selected.',
            );
        }

        let variableModelList: Blockly.VariableModel[] = [];
        if (this.sourceBlock_ && !this.sourceBlock_.isDeadOrDying()) {
            const variableTypes = this.getVariableTypes();
            // Get a copy of the list, so that adding rename and new variable options
            // doesn't modify the workspace's list.
            for (let i = 0; i < variableTypes.length; i++) {
                const variableType = variableTypes[i];
                const variables =
                    this.sourceBlock_.workspace.getVariablesOfType(variableType);
                variableModelList = variableModelList.concat(variables);
            }

            console.log(
                `searched var in ${this.sourceBlock_.workspace.id}:${this.sourceBlock_.workspace.isFlyout} - ${this.sourceBlock_}`,
            );
        } else {
            console.log(`did not search ${this.sourceBlock_}`);
        }
        variableModelList.sort(Blockly.VariableModel.compareByName);

        let options: [string, string][] = [];
        for (let i = 0; i < variableModelList.length; i++) {
            // Set the UUID as the internal representation of the variable.
            options[i] = [variableModelList[i].name, variableModelList[i].getId()];
        }

        if (options.length > 1) {
            options = options.filter((a) => !a[1].startsWith(NONE_SELECTED));
        }

        if (options.length === 0) {
            options.push(['dummy nix', NONE_SELECTED + this.defaultType]);
        }

        // options.push([Msg['RENAME_VARIABLE'], internalConstants.RENAME_VARIABLE_ID]);
        // if (Msg['DELETE_VARIABLE']) {
        //     options.push([
        //         Msg['DELETE_VARIABLE'].replace('%1', name),
        //         internalConstants.DELETE_VARIABLE_ID,
        //     ]);
        // }

        return options;
    }
}

// /**
//  * Config options for the variable field.
//  */
// export interface FieldVariableConfig extends Blockly.FieldConfig {
//     variableTypes?: string[];
//     defaultType?: string;
// }

// /**
//  * fromJson config options for the variable field.
//  */
// export interface FieldVariableFromJsonConfig extends FieldVariableConfig {
//     variable?: string;
// }

// /**
//  * A function that is called to validate changes to the field's value before
//  * they are set.
//  *
//  * @see {@link https://developers.google.com/blockly/guides/create-custom-blocks/fields/validators#return_values}
//  * @param newValue The value to be validated.
//  * @returns One of three instructions for setting the new value: `T`, `null`,
//  * or `undefined`.
//  *
//  * - `T` to set this function's returned value instead of `newValue`.
//  *
//  * - `null` to invoke `doValueInvalid_` and not set a value.
//  *
//  * - `undefined` to set `newValue` as is.
//  */
// export type FieldVariableValidator = Blockly.FieldDropdownValidator;
