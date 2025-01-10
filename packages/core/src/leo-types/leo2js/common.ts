import { DokoJSError, DokoJSLogger, ERRORS } from '@doko-js/utils';
import { ExternalRecord } from '@/utils';

const PRIVATE = '.private';
const PUBLIC = '.public';

const replaceValue = (value: string, searchValue = '') =>
  value.replace(searchValue, '').replace(PRIVATE, '').replace(PUBLIC, '');

export const address = (value: string): string => replaceValue(value);

export const field = (value: string): bigint => {
  const parsed = BigInt(replaceValue(value, 'field'));
  return parsed;
};

export const scalar = (value: string): bigint => {
  const parsed = BigInt(replaceValue(value, 'scalar'));
  return parsed;
};

export const group = (value: string): bigint => {
  const parsed = BigInt(replaceValue(value, 'group'));
  return parsed;
};

export const fieldToString = (value: string): string => {
  const parsed = replaceValue(value, 'field');
  return parsed;
};

export const u8 = (value: string): number => {
  const parsed = Number(replaceValue(value, 'u8'));
  if (isNaN(parsed)) DokoJSLogger.warn('u8 parsing failed');
  return parsed;
};

export const u16 = (value: string): number => {
  const parsed = Number(replaceValue(value, 'u16'));
  if (isNaN(parsed)) DokoJSLogger.warn('u16 parsing failed');
  return parsed;
};

export const u32 = (value: string): number => {
  const parsed = Number(replaceValue(value, 'u32'));
  if (isNaN(parsed)) DokoJSLogger.warn('u32 parsing failed');
  return parsed;
};

export const u64 = (value: string): bigint => {
  const parsed = BigInt(replaceValue(value, 'u64'));
  return parsed;
};

export const u128 = (value: string): bigint => {
  const parsed = BigInt(replaceValue(value, 'u128'));
  return parsed;
};

export const i8 = (value: string): number => {
  const parsed = Number(replaceValue(value, 'i8'));
  if (isNaN(parsed)) DokoJSLogger.warn('i8 parsing failed');
  return parsed;
};

export const i16 = (value: string): number => {
  const parsed = Number(replaceValue(value, 'i16'));
  if (isNaN(parsed)) DokoJSLogger.warn('i16 parsing failed');
  return parsed;
};

export const i32 = (value: string): number => {
  const parsed = Number(replaceValue(value, 'i32'));
  if (isNaN(parsed)) DokoJSLogger.warn('i32 parsing failed');
  return parsed;
};

export const i64 = (value: string): bigint => {
  const parsed = BigInt(replaceValue(value, 'i64'));
  return parsed;
};

export const i128 = (value: string): bigint => {
  const parsed = BigInt(replaceValue(value, 'i128'));
  return parsed;
};

export const signature = (value: string): string => {
  const parsed = replaceValue(value, 'sign1');
  return parsed;
};

export const boolean = (value: string): boolean => {
  const parsed = replaceValue(value, '');
  if (parsed === 'true') {
    return true;
  } else if (parsed === 'false') {
    return false;
  } else {
    throw new DokoJSError(ERRORS.INTERNAL.TYPE_PARSING_FAILED, {
      type: 'boolean'
    });
  }
};

// eslint-disable-next-line @typescript-eslint/ban-types
export const array = (value: Array<any>, converterFn: Function): any[] => {
  return value.map((v) => converterFn(v));
};

export const json = (value: string): string => {
  return JSON.stringify(value, (_, v) =>
    typeof v === 'bigint' ? v.toString() : v
  );
};

// For LeoRun the output is returned as json string
// whereas for SnarkExecute it is returned as ciphertext
export const record = (value: any): string => {
  if (typeof value === 'string' && value.startsWith('record1')) return value;
  return json(value);
};

export const externalRecord = <P extends string, R extends string>(
  value: string,
  name: `${P}.aleo/${R}`
): ExternalRecord<P, R> => {
  return new ExternalRecord<P, R>(name);
};
