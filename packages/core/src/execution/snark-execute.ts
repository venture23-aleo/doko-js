import { ContractConfig } from "./types";
import { ExecutionContext, ExecutionOutput } from "./types";
import { ExecutionOutputParser, SnarkStdoutResponseParser } from "./output-parser";
import { formatArgs, execute, decryptOutput } from "./execution-helper";
import { broadcastTransaction } from "./utils";

export class SnarkExecuteContext implements ExecutionContext {
    constructor(private config: ContractConfig, private parser: ExecutionOutputParser = new SnarkStdoutResponseParser()) {
    }

    async execute(transitionName: string, params: string[]): Promise<ExecutionOutput> {
        const formattedParams = formatArgs(params);
        const nodeEndPoint = this.config['network']?.endpoint;
        if (!nodeEndPoint) throw new Error('Network endpoint is not defined')
        const cmd = `cd ${this.config.contractPath} && snarkos developer execute ${this.config.appName}.aleo ${transitionName} ${formattedParams} --private-key ${this.config.privateKey} --query ${nodeEndPoint} --dry-run`;
        console.log(cmd);
        const { stdout } = await execute(cmd);
        console.log(stdout);
        const { transaction } = this.parser.parse(stdout);
        if (!transaction) throw new Error('Failed to execute transaction');
        await broadcastTransaction(transaction!, nodeEndPoint!);
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

