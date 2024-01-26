import {Shell} from '@aleojs/utils';

export function runTest(fileName: string) {
  const shell = new Shell(`npm run test -- ${fileName}`);
  return shell.asyncExec();
}
