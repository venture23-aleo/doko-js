import { ContractConfig } from "./types";
import { ExecutionContext, ExecutionOutput } from "./types";
import { ExecutionOutputParser, StdoutResponseParser } from "./output-parser";
import { formatArgs, execute } from "./execution-helper";

export class LeoRunContext implements ExecutionContext {
    constructor(private config: ContractConfig, private parser: ExecutionOutputParser = new StdoutResponseParser()) {
    }

    async execute(transitionName: string, params: string[]): Promise<ExecutionOutput> {
        const formattedParams = formatArgs(params);
        const cmd = `cd ${this.config.contractPath} && leo run ${transitionName} ${formattedParams}`;
        console.log(cmd);
        const { stdout } = await execute(cmd);
        console.log(stdout);
        const parsed = this.parser.parse(stdout);
        return parsed;
    }
}