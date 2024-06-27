import { getAleoConfig } from '..';
import { ErrorDescriptor, ERRORS, getErrorCode } from './errors-list';

const inspect = Symbol.for('nodejs.util.inspect.custom');

export function replaceAll(
  str: string,
  toReplace: string,
  replacement: string
) {
  return str.split(toReplace).join(replacement);
}

export function applyErrorMessageTemplate(
  template: string,
  values: { [templateVar: string]: any }
): string {
  return _applyErrorMessageTemplate(template, values, false);
}

function _applyErrorMessageTemplate(
  template: string,
  values: { [templateVar: string]: any },
  isRecursiveCall: boolean
): string {
  if (!isRecursiveCall) {
    for (const variableName of Object.keys(values)) {
      if (variableName.match(/^[a-zA-Z][a-zA-Z0-9]*$/) === null) {
        throw new DokoJSError(ERRORS.INTERNAL.TEMPLATE_INVALID_VARIABLE_NAME, {
          variable: variableName
        });
      }

      const variableTag = `%${variableName}%`;

      if (!template.includes(variableTag)) {
        throw new DokoJSError(ERRORS.INTERNAL.TEMPLATE_VARIABLE_TAG_MISSING, {
          variable: variableName
        });
      }
    }
  }

  if (template.includes('%%')) {
    return template
      .split('%%')
      .map((part) => _applyErrorMessageTemplate(part, values, true))
      .join('%');
  }

  for (const variableName of Object.keys(values)) {
    let value: string;

    if (values[variableName] === undefined) {
      value = 'undefined';
    } else if (values[variableName] === null) {
      value = 'null';
    } else {
      value = values[variableName].toString();
    }

    if (value === undefined) {
      value = 'undefined';
    }

    const variableTag = `%${variableName}%`;

    if (value.match(/%([a-zA-Z][a-zA-Z0-9]*)?%/) !== null) {
      throw new DokoJSError(
        ERRORS.INTERNAL.TEMPLATE_VALUE_CONTAINS_VARIABLE_TAG,
        { variable: variableName }
      );
    }

    template = replaceAll(template, variableTag, value);
  }

  return template;
}

export class CustomError extends Error {
  private _stack: string;

  constructor(
    message: string,
    public readonly parent?: Error
  ) {
    super(message);

    this.name = this.constructor.name;

    // We do this to avoid including the constructor in the stack trace
    if ((Error as any).captureStackTrace !== undefined) {
      (Error as any).captureStackTrace(this, this.constructor);
    }

    this._stack = this.stack ?? '';

    Object.defineProperty(this, 'stack', {
      get: () => this[inspect]()
    });
  }

  public [inspect](): string {
    let str = this._stack;
    if (this.parent !== undefined) {
      const parentAsAny = this.parent as any;
      const causeString =
        parentAsAny[inspect]?.() ??
        parentAsAny.inspect?.() ??
        parentAsAny.stack ??
        parentAsAny.toString();
      const nestedCauseStr = causeString
        .split('\n')
        .map((line: string) => `    ${line}`)
        .join('\n')
        .trim();
      str += `

    Caused by: ${nestedCauseStr}`;
    }
    return str;
  }
}

export class DokoJSError extends CustomError {
  public static isDokoJSError(other: any): other is DokoJSError {
    return (
      other !== undefined && other !== null && other._isDokoJSError === true
    );
  }

  public static isDokoJSErrorType(
    other: any,
    descriptor: ErrorDescriptor
  ): other is DokoJSError {
    return (
      DokoJSError.isDokoJSError(other) &&
      other.errorDescriptor.number === descriptor.number
    );
  }

  public readonly errorDescriptor: ErrorDescriptor;
  public readonly number: number;
  public readonly messageArguments: Record<string, any>;

  private readonly _isDokoJSError: boolean;

  constructor(
    errorDescriptor: ErrorDescriptor,
    messageArguments: Record<string, string | number> = {},
    parentError?: Error
  ) {
    const prefix = `${getErrorCode(errorDescriptor)}: `;

    const formattedMessage = applyErrorMessageTemplate(
      errorDescriptor.message,
      messageArguments
    );

    super(prefix + formattedMessage, parentError);

    this.errorDescriptor = errorDescriptor;
    this.number = errorDescriptor.number;
    this.messageArguments = messageArguments;

    this._isDokoJSError = true;
    Object.setPrototypeOf(this, DokoJSError.prototype);
  }
}

enum DEBUGGER_INITIALIZATION_STATE {
  IDLE,
  IN_PROGRESS,
  COMPLETED
}

const debuggerInitializationState = DEBUGGER_INITIALIZATION_STATE.IDLE;

export class DokoJSLogger {
  static readonly LogLevels: Record<string, string> = {
    DEBUG: 'debug',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error'
  };

  static currentLogLevel = 'debug';

  static setLogLevel(_logLevel: string | number) {
    console.log(_logLevel);
    let logLevel = this.LogLevels.INFO;

    //@ts-expect-error Number required of isNaN
    if (!isNaN(_logLevel)) {
      logLevel = Object.values(this.LogLevels)[_logLevel as number];
    }

    if (Object.values(this.LogLevels).includes(logLevel)) {
      this.currentLogLevel = logLevel;
    } else {
      console.error(
        `Invalid log level ${logLevel}, resetting to default value. Supported value is one of ${Object.values(this.LogLevels)}`
      );
    }
  }

  static canLog(loglevel: string) {
    const index = Object.values(this.LogLevels).indexOf(loglevel);
    const currentLogLevel = Object.values(this.LogLevels).indexOf(
      this.currentLogLevel
    );

    return index >= currentLogLevel;
  }

  static log(...args: any[]) {
    if (this.canLog(this.LogLevels.INFO)) console.log(...args);
  }

  static info(message: any) {
    if (this.canLog(this.LogLevels.INFO)) console.log(message);
  }

  static debug(message: any) {
    if (this.canLog(this.LogLevels.DEBUG))
      console.debug(`\x1b[31;1;34m${message}\x1b[0m`);
  }

  static warn(message: any) {
    if (this.canLog(this.LogLevels.WARN))
      console.warn(`\x1b[31;1;33m${message}\x1b[0m`);
  }

  static error(error: unknown) {
    console.log(`\x1b[31;1;31m${error}\x1b[0m`);
  }
}

export { ERRORS };
