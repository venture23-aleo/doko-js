import { StdoutResponseParser } from '@/execution/output-parser';
import { DokoJSError, DokoJSLogger, Shell } from '@doko-js/utils';
import { exec } from 'child_process';
import { promisify } from 'util';

type CommandOption = { key: string; value: string };

interface Command {
  baseCmd: string;
  options: Array<CommandOption>;
  flags: string[];
  args: string[];
}

class UnixCommandBuilder {
  private currentCommand: Command = this.initializeCommand();
  private commands = new Array<string>();

  constructor(
    public parser: StdoutResponseParser = new StdoutResponseParser()
  ) {}

  private initializeCommand(): Command {
    return {
      baseCmd: '',
      options: [],
      flags: [],
      args: []
    };
  }

  private ensureBaseCmdExists() {
    if (!this.currentCommand.baseCmd) throw new Error('No base command');
  }

  addBaseCommand(baseCmd: string) {
    this.currentCommand.baseCmd = baseCmd;
    return this;
  }

  addOptions(options: Array<CommandOption>) {
    this.ensureBaseCmdExists();
    this.currentCommand.options.push(...options);
    return this;
  }

  addArgs(args: Array<string>) {
    this.ensureBaseCmdExists();
    this.currentCommand.args.push(...args);
    return this;
  }

  addFlags(flags: Array<string>) {
    this.ensureBaseCmdExists();
    this.currentCommand.flags.push(...flags);
    return this;
  }

  chain(operator: string) {
    this.ensureBaseCmdExists();

    this.commands.push(this.buildBaseCommand());
    this.commands.push(operator);

    this.currentCommand = this.initializeCommand();
    return this;
  }

  buildBaseCommand() {
    const cmds = [this.currentCommand.baseCmd];

    this.currentCommand.args.forEach((o) => {
      cmds.push(o);
    });

    this.currentCommand.flags.forEach((o) => {
      cmds.push(o);
    });

    this.currentCommand.options.forEach((o) => {
      cmds.push(`${o.key} ${o.value}`);
    });
    return cmds.join(' ').trim();
  }

  build() {
    if (this.currentCommand.baseCmd)
      this.commands.push(this.buildBaseCommand());

    return this.commands.join(' ').trim();
  }

  async execute(cmd?: string, shell?: boolean, parse: boolean = true) {
    const _execute = promisify(exec);

    if (!cmd) {
      if (this.commands.length < 0) throw new Error('No commands');
      cmd = this.build();
    }

    try {
      if (shell) {
        const shell = new Shell(cmd);
        return shell.asyncExec();
      }

      const { stdout, stderr } = await _execute(cmd, { maxBuffer: undefined });
      if (stderr) throw new Error(stderr);
      if (parse) {
        const output = this.parser.parse(stdout);
        return output;
      }
      return stdout;
    } catch (e) {
      DokoJSLogger.error(`this is ${e}`);
    }
  }

  copy(source: string, destination: string) {
    this.addBaseCommand('cd').addArgs([source, destination]);
    this.commands.push(this.buildBaseCommand());
  }

  remove(path: string, folder: boolean) {
    this.addBaseCommand('rm').addArgs([folder ? '-r' : '', path]);
    this.commands.push(this.buildBaseCommand());
  }

  changeDir(path: string) {
    this.addBaseCommand('cd').addArgs([path]);
    this.commands.push(this.buildBaseCommand());
  }

  mkdir(path: string) {
    this.addBaseCommand('mkdir').addArgs(['-p', path]);
    this.commands.push(this.buildBaseCommand());
  }
}

export { UnixCommandBuilder, CommandOption };
