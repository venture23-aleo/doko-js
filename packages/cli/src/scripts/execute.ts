import {Shell} from '@aleojs/utils';

export function leoExecute(filePath: string) {
  const shell = new Shell(`ts-node ${filePath}`);
  return shell.asyncExec();
}
