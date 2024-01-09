import Shell from '@/utils/shell';

export function leoExecute(filePath: string) {
  const shell = new Shell(`ts-node ${filePath}`);
  return shell.asyncExec();
}
