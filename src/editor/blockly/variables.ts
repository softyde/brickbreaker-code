// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import * as Blockly from 'blockly';

export const VAR_ENTRY_NONE = 'NONE';

function getVariableType(name: string) {
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
    constructor(
        menuGenerator: Blockly.MenuGenerator,
        validator?: Blockly.FieldDropdownValidator,
        config?: Blockly.FieldDropdownConfig,
    ) {
        super(menuGenerator, validator, config);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    saveState(_doFullSerialization?: boolean): any {
        console.log('saveState');

        const state = super.saveState();

        //     console.log(state);

        return state;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    loadState(state: string) {
        //const options = this.getOptions(false);

        //      console.log('loadState');

        //if (options.find((o) => o[1] === state)) {
        super.loadState(state);
        //} else {
        //    console.debug(`ignoring value for now');
        //}
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
            }
            //return null;
        }
        return newValue;
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
            const varType = getVariableType(input.name);

            input.appendField(
                new VariableDropDown(() => {
                    const result: Blockly.MenuOption[] = [];

                    const ws = Blockly.getMainWorkspace();

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
                        result.push(['<KEINER>', VAR_ENTRY_NONE]);
                    }

                    console.log(
                        `got options with ${result.map((a) => a[0]).join(',')}`,
                    );

                    return result;
                }),
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
