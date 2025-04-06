// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Philipp Anné

import * as Blockly from 'blockly';
import { Order, PythonGenerator } from 'blockly/python';
import {
    Direction,
    StraightDirection,
    VAR_AXLE_TRACK,
    VAR_DEGREES,
    VAR_DIAMETER,
    VAR_DIRECTION,
    VAR_DISTANCE,
    VAR_HUB_FRONT_AXIS,
    VAR_HUB_TOP_AXIS,
    VAR_MOTOR_DIRECTION,
    VAR_MOTOR_LEFT,
    VAR_MOTOR_PORT,
    VAR_MOTOR_RIGHT,
    VAR_NUMBER,
    VAR_STATEMENTS,
    VAR_TIMES,
} from './blocks';
//import { VAR_HUB_NAME } from './blocks';

const robotHubName = 'my_robot';

class BlocklyPythonGenerator extends PythonGenerator {
    variablePrefix = 0;

    init(workspace: Blockly.Workspace): void {
        super.init(workspace);

        this.resetVariablePrefix();
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

pythonGenerator.forBlock['start_program'] = (_block, _generator) => {
    //    const nextCode = generator.blockToCode(block.getNextBlock());

    return '';
};

pythonGenerator.forBlock['hub_block'] = (block, _generator) => {
    //const nextCode = generator.blockToCode(block.getNextBlock());

    const topAxis = block.getFieldValue(VAR_HUB_TOP_AXIS);
    const frontAxis = block.getFieldValue(VAR_HUB_FRONT_AXIS);

    return `${robotHubName} = PrimeHub(top_side=${topAxis}, front_side=${frontAxis})`;
};

pythonGenerator.forBlock['move_hub_block'] = (block, generator) => {
    const leftMotor = generator.valueToCode(block, VAR_MOTOR_LEFT, Order.ATOMIC);
    const rightMotor = generator.valueToCode(block, VAR_MOTOR_RIGHT, Order.ATOMIC);

    const diameter = block.getFieldValue(VAR_DIAMETER);
    const axleTrack = block.getFieldValue(VAR_AXLE_TRACK);

    return `drive_left_motor = ${leftMotor}
drive_right_motor = ${rightMotor}

drive = DriveBase(drive_left_motor, drive_right_motor, ${diameter}, ${axleTrack})
drive.use_gyro(True)`;
};

pythonGenerator.forBlock['drive_motor_block'] = (block, _generator) => {
    const port = block.getFieldValue(VAR_MOTOR_PORT);
    const direction = block.getFieldValue(VAR_MOTOR_DIRECTION);

    return [`Motor(${port}, ${direction})`, Order.ATOMIC];
};

pythonGenerator.forBlock['move_straight_block'] = (block, _generator) => {
    let distance = block.getFieldValue(VAR_DISTANCE) * 10;
    const direction = block.getFieldValue(VAR_DIRECTION);

    if (direction === StraightDirection.Backward) {
        distance *= -1;
    }

    return `drive.straight(${distance})`;
};

pythonGenerator.forBlock['move_curve_block'] = (block, _generator) => {
    let distance = block.getFieldValue(VAR_DEGREES);
    const direction = block.getFieldValue(VAR_DIRECTION);

    if (direction === Direction.Counterclockwise) {
        distance *= -1;
    }

    return `drive.turn(${distance})`;
};

pythonGenerator.forBlock['repeat_xtimes_block'] = (block, generator) => {
    const x = generator.statementToCode(block, VAR_TIMES).trim();
    const varName = generator.getNextVariableName();

    const statements = generator.statementToCode(block, VAR_STATEMENTS);

    return `${varName} = int(${x})
for _ in range(${varName}):
${statements}`;
};

pythonGenerator.forBlock['shadow_Number_Int_gt_Zero'] = (block, _generator) => {
    const value = block.getFieldValue(VAR_NUMBER);

    return `${value}`;
};

pythonGenerator.forBlock['distance_sensor_block'] = (_block, _generator) => {
    //  const value = block.getFieldValue(VAR_NUMBER);

    return ``;
};

/* ---- */

pythonGenerator.forBlock['hub_beep'] = (_block, _generator) => {
    //const nextCode = generator.blockToCode(block.getNextBlock());

    return `hub.speaker.beep(440, 75)`;
};

pythonGenerator.forBlock['drive_init'] = (_block, _generator) => {
    return `left_motor = Motor(Port.A, Direction.COUNTERCLOCKWISE)
right_motor = Motor(Port.B)

drive_base = DriveBase(left_motor, right_motor, wheel_diameter=56, axle_track=112)
drive_base.use_gyro(True)`;
};

pythonGenerator.forBlock['line_follow_block'] = (_block, _generator) => {
    return `# Jaja, das wird irgendwann`;
};

pythonGenerator.forBlock['move_follow_line'] = (_block, _generator) => {
    return `# Hey, das ist eine Alpha!`;
};

pythonGenerator.forBlock['setup_program'] = (_block, _generator) => {
    return `# Nicht implementiert: nimm "Programm starten"`;
};

export default pythonGenerator;
