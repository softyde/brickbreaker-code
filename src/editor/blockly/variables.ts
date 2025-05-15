// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import * as Blockly from 'blockly';

export const VAR_ENTRY_NONE = 'NONE';

function getVariableType(name: string) {
    if (!name) {
        return 'asdf';
    }

    if (name.startsWith('LIST.')) {
        name = name.substring(5);
    }

    const index = name.lastIndexOf('.');
    if (index >= 0) {
        name = name.substring(0, index);
    }

    return name;
}

class VariableDropDown extends Blockly.FieldDropdown {
    _loadedState: { value: string; text: string } | null = null;

    inputName: string;

    constructor(
        inputName: string,
        validator?: Blockly.FieldDropdownValidator,
        config?: Blockly.FieldDropdownConfig,
    ) {
        super(VariableDropDown.dropdownCreate, validator, config);
        this.inputName = inputName;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    saveState(_doFullSerialization?: boolean): any {
        //  console.log(`saveState full=${doFullSerialization}`);

        const value = this.getValue();
        const text = this.getText();

        this._loadedState = null;

        return {
            value,
            text,
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    loadState(state: any) {
        // console.log(`loadState`, state);

        this._loadedState = { value: state.value, text: state.text };

        this.setValue(state.value);
    }

    /**
     * Ensure that the input value is a valid language-neutral option.
     *
     * @param newValue The input value.
     * @returns A valid language-neutral option, or null if invalid.
     */
    protected override doClassValidation_(newValue: string): string | null | undefined;
    protected override doClassValidation_(newValue?: string): string | null;
    protected override doClassValidation_(
        newValue?: string,
    ): string | null | undefined {
        const options = this.getOptions(false);
        const isValueValid = options.some((option) => option[1] === newValue);

        if (!isValueValid) {
            if (this.sourceBlock_) {
                console.warn(
                    "Cannot set the dropdown's value to an unavailable option." +
                        ' Block type: ' +
                        this.sourceBlock_.type +
                        ', Field name: ' +
                        this.name +
                        ', Value: ' +
                        newValue,
                );
                console.log(options.map((a) => `${a[0]}:${a[0]}`).join(','));
                newValue = options[0][1];
            }
            //return null;
        }
        return newValue;
    }

    /**
     * Return a sorted list of variable names for variable dropdown menus.
     * Include a special option at the end for creating a new variable name.
     *
     * @returns Array of variable names/id tuples.
     */
    static dropdownCreate(this: Blockly.FieldDropdown): Blockly.MenuOption[] {
        const result: Blockly.MenuOption[] = [];

        const dropDown = this as VariableDropDown;

        const ws = Blockly.getMainWorkspace();

        const varType = getVariableType(dropDown.inputName);

        const variables = ws.getVariablesOfType(varType);

        // const x = ws.getAllVariables();
        // console.log(
        //     `${this.type}:${
        //         this.id
        //     } - called for variable ${varType} ${variables
        //         .map((v) => v.getId())
        //         .join(',')}`,
        // );
        // console.log(`${self === this}`);
        // console.log(
        //     `called for all variable ${varType} ${x
        //         .map((v) => v.getId())
        //         .join(',')}`,
        // );

        variables.forEach((variable) => {
            result.push([variable.name, variable.getId()]);
        });

        if (result.length === 0) {
            if (dropDown._loadedState) {
                console.log('faking loaded state');
                result.push([dropDown._loadedState.text, dropDown._loadedState.value]);
            } else {
                result.push(['<KEINER>', VAR_ENTRY_NONE]);
            }
        }

        console.log(`got options with ${result.map((a) => a[0]).join(',')}`);

        return result;
    }
}

function asd(this: Blockly.Block) {
    //console.log(this.inputList);

    this.inputList
        .filter(
            (input) =>
                input.type === Blockly.inputs.inputTypes.DUMMY &&
                input.name.startsWith('LIST.'),
        )
        .forEach((input) => {
            input.appendField(
                new VariableDropDown(input.name),
                `VALUE.${input.name.substring(5)}`,
            );
        });

    /*this.getInput('INPUT')
      .appendField(new Blockly.FieldDropdown(
        function() {
          var options = [];
          var now = Date.now();
          for(var i = 0; i < 7; i++) {
            var dateString = String(new Date(now)).substring(0, 3);
            options.push([dateString, dateString.toUpperCase()]);
            now += 24 * 60 * 60 * 1000;
          }
          return options;
        }), 'DAY');
  });*/
}

export const initCustomVariableHandling = () => {
    Blockly.Extensions.register('dynamic_var_list', asd);
};
