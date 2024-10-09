import { Shell } from '@doko-js/utils';

export function leoExecute(filePath: string) {
  const shell = new Shell(`ts-node ${filePath}`);
  return shell.asyncExec();
}
