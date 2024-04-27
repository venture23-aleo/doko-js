import { isDefined } from "./execution-helper";
import { LeoRunContext } from "./leo-run";
import { ContractConfig, ExecutionContext, ExecutionMode } from "./types";

export function CreateExecutionContext(config: ContractConfig): ExecutionContext {
    if (!isDefined(config.mode)) throw Error("Execution mode not selected in contract config");
    switch (config.mode) {
        case ExecutionMode.LeoRun:
            return new LeoRunContext(config);
        case ExecutionMode.LeoExecute:
        case ExecutionMode.SnarkExecute:
            break;
    }
    throw new Error('Unsupported Execution Mode');
}