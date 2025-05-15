// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

//import { isProcedureBlock } from '@blockly/block-shareable-procedures';
import * as Blockly from 'blockly';
import { Order, PythonGenerator } from 'blockly/python';

import Repository from '../../blocks/repository';
import { Direction, Port } from '../../blocks/types';
import { CodeIssue, Severity } from '../../expert/codeIssue';
import { VAR_HUB_FRONT_AXIS, VAR_HUB_TOP_AXIS } from './blocks';
//import { VAR_HUB_NAME } from './blocks';

const robotHubName = 'my_robot';

export class CodeExpert {
    _codeIssues: CodeIssue[] = [];

    _usedPorts: Port[] = [];
    _motors: { name: string; direction: Direction }[] = [];

    _hubMotors: string[] = [];

    usePort(port: Port): boolean {
        if (this._usedPorts.indexOf(port) >= 0) {
            return false;
        }

        this._usedPorts.push(port);
        return true;
    }

    addHubMotors(motors: string[]) {
        this._hubMotors.push(...motors);
    }

    isHubMotor(motor: string): boolean {
        return this._hubMotors.indexOf(motor) >= 0;
    }

    addMotor(name: string, direction: Direction) {
        this._motors.push({ name, direction });
    }

    isMotorDefined(motor: string): boolean {
        return this._motors.find((m) => m.name === motor) !== undefined;
    }

    haveSameDirection(motor1: string, motor2: string): boolean {
        const m1 = this._motors.find((m) => m.name === motor1);
        const m2 = this._motors.find((m) => m.name === motor2);

        if (m1 === undefined || m2 === undefined) {
            return false;
        }

        return m1.direction === m2.direction;
    }

    add(severity: Severity, label: string, block: Blockly.Block) {
        this._codeIssues.push({ severity, label, blockId: block.id });
    }
}

export class BlocklyPythonGenerator extends PythonGenerator {
    variablePrefix = 0;

    codeExpert!: CodeExpert;

    init(workspace: Blockly.Workspace): void {
        super.init(workspace);

        this.resetVariablePrefix();

        this.addReservedWords(
            'PrimeHub,Motor,ColorSensor,UltrasonicSensor,ForceSensor,Button,Color,Direction,Port,Side,Stop,Axis,DriveBase,wait,StopWatch',
        );

        this.codeExpert = new CodeExpert();
    }

    resetVariablePrefix(): void {
        this.variablePrefix = 0;
    }

    getNextVariableName(): string {
        return `var_${this.variablePrefix++}`;
    }

    prefixWithBlock(v: string, b: Blockly.Block): string {
        if (b.outputConnection) {
            return v;
        }

        if (v === null || v.trim().length === 0) {
            return v;
        }

        let line = v
            .split('\n')
            .map((l) =>
                l.trim().length > 0 && !l.trim().startsWith('<<')
                    ? `<<${b.id}>>${l}`
                    : l,
            )
            .join('\n');

        if (!line.endsWith('\n')) {
            line = `${line}\n`;
        }
        line = `${line}\n`;

        return line;
    }

    /**
     * Common tasks for generating Python from blocks.
     * Handles comments for the specified block and any connected value blocks.
     * Calls any statements following this block.
     *
     * @param block The current block.
     * @param code The Python code created for this block.
     * @param thisOnly True to generate code for only this statement.
     * @returns Python code with comments and subsequent blocks added.
     */
    scrub_(block: Blockly.Block, code: string, thisOnly = false): string {
        let commentCode = '';
        // Only collect comments for blocks that aren't inline.
        if (!block.outputConnection || !block.outputConnection.targetConnection) {
            // Collect comment for this block.
            let comment = block.getCommentText();
            if (comment) {
                comment = Blockly.utils.string.wrap(comment, this.COMMENT_WRAP - 3);
                commentCode += this.prefixLines(comment + '\n', '# ');
            }
            // Collect comments for all value arguments.
            // Don't collect comments for nested statements.
            for (let i = 0; i < block.inputList.length; i++) {
                if (block.inputList[i].type === Blockly.inputs.inputTypes.VALUE) {
                    const childBlock = block.inputList[i].connection!.targetBlock();
                    if (childBlock) {
                        comment = this.allNestedComments(childBlock);
                        if (comment) {
                            commentCode += this.prefixLines(comment, '# ');
                        }
                    }
                }
            }
        }
        const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
        const nextCode = thisOnly ? '' : this.blockToCode(nextBlock);
        return (
            this.prefixWithBlock(commentCode, block) +
            this.prefixWithBlock(code, block) +
            nextCode
        );
    }
}

const pythonGenerator = new BlocklyPythonGenerator('python');

Repository.addAll(pythonGenerator);

pythonGenerator.forBlock['hub_block'] = (block, _generator) => {
    //const nextCode = generator.blockToCode(block.getNextBlock());

    const topAxis = block.getFieldValue(VAR_HUB_TOP_AXIS);
    const frontAxis = block.getFieldValue(VAR_HUB_FRONT_AXIS);

    return `${robotHubName} = PrimeHub(top_side=${topAxis}, front_side=${frontAxis})`;
};

pythonGenerator.forBlock['procedures_defnoreturn'] = (block, generator) => {
    const funcName = generator.getProcedureName(block.getFieldValue('NAME'));

    const parameters = block.getVars();
    const parString = parameters.map((p) => generator.getVariableName(p)).join(', ');

    const statements = generator.statementToCode(block, 'STACK');

    return `async def ${funcName}(${parString}):
${statements}`;
};

/*pythonGenerator.forBlock['procedures_callreturn'] = (block, generator) => {
    if (isProcedureBlock(block)) {
        const model = block.getProcedureModel();

        block.getProcedureModel().getParameters;

        const funcName = model.getName();
        const funcVar = generator.getVariableName(funcName);

        const args = [];
        const variables = block.getVars();
        for (let i = 0; i < variables.length; i++) {
            args[i] = generator.valueToCode(block, 'ARG' + i, Order.NONE) || 'None';
            //args[i] = generator.statementToCode(block, 'ARG' + i) || 'None';
        }
        // const parameters = model.getParameters();
        // const parString = parameters
        //     .map((p) => generator.getVariableName(p.getName()))
        //     .join(', ');

        return [`await ${funcVar}(${args.join(', ')})`, Order.FUNCTION_CALL];
    }

    return [`invalid function`, Order.FUNCTION_CALL];
};*/
pythonGenerator.forBlock['procedures_callnoreturn'] = (block, generator) => {
    const funcName = generator.getProcedureName(block.getFieldValue('NAME'));

    const args = [];
    const variables = block.getVars();
    for (let i = 0; i < variables.length; i++) {
        args[i] = generator.valueToCode(block, 'ARG' + i, Order.NONE) || 'None';
        //args[i] = generator.statementToCode(block, 'ARG' + i) || 'None';
    }
    // const parameters = model.getParameters();
    // const parString = parameters
    //     .map((p) => generator.getVariableName(p.getName()))
    //     .join(', ');

    return `await ${funcName}(${args.join(', ')})`;
};

/*pythonGenerator.forBlock['procedures_defreturn'] = (block, generator) => {
    if (isProcedureBlock(block)) {
        const model = block.getProcedureModel();

        block.getProcedureModel().getParameters;

        const funcName = model.getName();
        const funcVar = generator.getVariableName(funcName);

        const parameters = model.getParameters();
        const parString = parameters
            .map((p) => generator.getVariableName(p.getName()))
            .join(', ');

        const statements = generator.statementToCode(block, 'STACK');

        const returnValue = generator.statementToCode(block, 'RETURN').trim();

        return `async def ${funcVar}(${parString}):
${statements}
  return ${returnValue}`;
    }

    return `# invalid function`;
};*/

// pythonGenerator.forBlock['drive_motor_block'] = (block, _generator) => {
//     const port = block.getFieldValue(VAR_MOTOR_PORT);
//     const direction = block.getFieldValue(VAR_MOTOR_DIRECTION);

//     return [`Motor(${port}, ${direction})`, Order.ATOMIC];
// };

/* ---- */

// pythonGenerator.forBlock['drive_init'] = (_block, _generator) => {
//     return `left_motor = Motor(Port.A, Direction.COUNTERCLOCKWISE)
// right_motor = Motor(Port.B)

// drive_base = DriveBase(left_motor, right_motor, wheel_diameter=56, axle_track=112)
// drive_base.use_gyro(True)`;
// };

export default pythonGenerator;
