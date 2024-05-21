import { AleoExecutionOutput } from "./transaction-model"

export interface TransactionResponseParser {
    parse(output: string): AleoExecutionOutput;
}

export function parseRecordString(
    recordString: string
): Record<string, unknown> {
    const json = recordString.replace(/(['"])?([a-z0-9A-Z_.]+)(['"])?/g, '"$2" ');
    const correctJson = json;
    return JSON.parse(correctJson);
};


export class StdoutResponseParser implements TransactionResponseParser {

    parse(cmdOutput: string): AleoExecutionOutput {
        // Try splitting as if it is multiple output
        const result: AleoExecutionOutput = {
            data: []
        };

        let strAfterOutput = cmdOutput.split('Outputs')[1];
        // if it has multiple outputs
        if (!strAfterOutput) {
            strAfterOutput = cmdOutput.split('Output')[1];
            // No output at all
            if (!strAfterOutput) {
                const stringBlock = cmdOutput.split('\n\n').slice(3);
                stringBlock.pop();
                if (stringBlock.length > 0) result.transaction = JSON.parse(stringBlock[0]);
                return result;
            }
        }

        // this separates the string after the output into three logical blocks
        // 1. Outputs, 2. Transactions(if present), 3. Leo execute/run block
        const stringBlock = strAfterOutput
            .split('\n\n')
            .filter((str) => str.trim().length > 0);
        // Remove the last line as this is just the status result of execution command
        stringBlock.pop();

        // Remove unnecessary character
        const outputs = stringBlock
            .shift()
            ?.split('•')
            .filter((line) => line.trim().length > 0);

        if (outputs && outputs.length > 0)
            result.data = outputs.map((output) => parseRecordString(output));

        // Parse transaction block if it is present
        if (stringBlock.length > 0)
            result.transaction = JSON.parse(stringBlock.shift() || '');

        // Process transaction block if present
        return result;
    }
}


export class SnarkStdoutResponseParser implements TransactionResponseParser {
    parse(output: string): AleoExecutionOutput {
        return {
            data: [],
            transaction: JSON.parse(output.match(/\{([^)]+)\}/)![0])
        }
    }
}