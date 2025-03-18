// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import * as Blockly from 'blockly';

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

function asd(this: Blockly.Block) {
    console.log(this.inputList);

    this.inputList
        .filter(
            (input) =>
                input.type === Blockly.inputs.inputTypes.DUMMY &&
                input.name.startsWith('LIST.'),
        )
        .forEach((input) => {
            const varType = getVariableType(input.name);

            input.appendField(
                new Blockly.FieldDropdown(() => {
                    const result: Blockly.MenuOption[] = [];

                    const variables = this.workspace.getVariablesOfType(varType);
                    variables.forEach((variable) => {
                        result.push([variable.name, variable.getId()]);
                    });

                    if (result.length === 0) {
                        result.push(['<KEINER>', 'NONE']);
                    }

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
