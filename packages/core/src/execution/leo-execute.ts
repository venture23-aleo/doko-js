import { ContractConfig } from "./types";
import { ExecutionContext, ExecutionOutput } from "./types";
import { ExecutionOutputParser, StdoutResponseParser } from "./output-parser";
import { formatArgs, execute, decryptOutput } from "./execution-helper";

export class LeoExecuteContext implements ExecutionContext {
    constructor(private config: ContractConfig, private parser: ExecutionOutputParser = new StdoutResponseParser()) {
    }

    async execute(transitionName: string, params: string[]): Promise<ExecutionOutput> {
        const formattedParams = formatArgs(params);
        const cmd = `cd ${this.config.contractPath} && leo execute ${transitionName} ${formattedParams}`;
        console.log(cmd);
        const { stdout } = await execute(cmd);
        console.log(stdout);
        const { transaction } = this.parser.parse(stdout);
        const programName = this.config.appName + '.aleo';
        const decrypedData = decryptOutput(
            transaction!,
            transitionName,
            programName,
            this.config.privateKey || ''
        );
        return {
            data: decrypedData,
            transaction
        };
    }
}

