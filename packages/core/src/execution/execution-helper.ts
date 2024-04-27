// @TODO replace this with shell
import { exec } from "child_process"
import { promisify } from "util";

const _execute = promisify(exec);
export const execute = (cmd: string) => {
    return _execute(cmd, { maxBuffer: undefined });
}

export function formatArgs(params: string[]): string {
    return params.map((s) => `"${s}"`).join(' ');
}

export function isDefined(v: any) {
    return v !== null && v !== undefined;
}