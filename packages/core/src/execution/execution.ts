import { isDefined } from './execution-helper';
import { LeoExecuteContext } from './leo-execute';
import { LeoRunContext } from './leo-run';
import { SnarkExecuteContext } from './snark-execute';
import { ContractConfig, ExecutionContext, ExecutionMode } from './types';

export function CreateExecutionContext(
  config: ContractConfig
): ExecutionContext {
  if (!isDefined(config.mode))
    throw Error('Execution mode not selected in contract config');
  if (config.isImportedAleo && config.mode !== ExecutionMode.SnarkExecute)
    throw Error(
      "Execution of imported code is possible only with 'SnarkExecute' mode"
    );
  switch (config.mode) {
    case ExecutionMode.LeoRun:
      return new LeoRunContext(config);
    case ExecutionMode.LeoExecute:
      return new LeoExecuteContext(config);
    case ExecutionMode.SnarkExecute:
      return new SnarkExecuteContext(config);
  }
  throw new Error('Unsupported Execution Mode');
}
