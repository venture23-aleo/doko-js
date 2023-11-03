const PRIVATE = '.private';
const PUBLIC = '.public';

const replaceValue = (value: string, searchValue = '') =>
  value.replace(searchValue, '').replace(PRIVATE, '').replace(PUBLIC, '');

export const address = (value: string): string => replaceValue(value);

export const field = (value: string): BigInt => {
  const parsed = BigInt(replaceValue(value, 'field'));
  return parsed;
};

export const scalar = (value: string): BigInt => {
  const parsed = BigInt(replaceValue(value, 'scalar'));
  return parsed;
};

export const group = (value: string): BigInt => {
  const parsed = BigInt(replaceValue(value, 'group'));
  return parsed;
};

export const fieldToString = (value: string): string => {
  const parsed = replaceValue(value, 'field');
  return parsed;
};

export const u8 = (value: string): number => {
  const parsed = Number(replaceValue(value, 'u8'));
  if (isNaN(parsed)) throw new Error('u8 parsing failed');
  return parsed;
};

export const u16 = (value: string): number => {
  const parsed = Number(replaceValue(value, 'u16'));
  if (isNaN(parsed)) throw new Error('u16 parsing failed');
  return parsed;
};

export const u32 = (value: string): number => {
  const parsed = Number(replaceValue(value, 'u32'));
  if (isNaN(parsed)) throw new Error('u32 parsing failed');
  return parsed;
};

export const u64 = (value: string): BigInt => {
  const parsed = BigInt(replaceValue(value, 'u64'));
  return parsed;
};

export const u128 = (value: string): BigInt => {
  const parsed = BigInt(replaceValue(value, 'u128'));
  // if (isNaN(parsed)) throw new Error("u128 parsing failed");
  return parsed;
};

export const i8 = (value: string): number => {
  const parsed = Number(replaceValue(value, 'i8'));
  if (isNaN(parsed)) throw new Error('i8 parsing failed');
  return parsed;
};

export const i16 = (value: string): number => {
  const parsed = Number(replaceValue(value, 'i16'));
  if (isNaN(parsed)) throw new Error('i16 parsing failed');
  return parsed;
};

export const i32 = (value: string): number => {
  const parsed = Number(replaceValue(value, 'i32'));
  if (isNaN(parsed)) throw new Error('u32 parsing failed');
  return parsed;
};

export const i64 = (value: string): BigInt => {
  const parsed = BigInt(replaceValue(value, 'i64'));
  return parsed;
};

export const i128 = (value: string): BigInt => {
  const parsed = BigInt(replaceValue(value, 'u128'));
  // if (isNaN(parsed)) throw new Error("u128 parsing failed");
  return parsed;
};

export const boolean = (value: string): boolean => {
  const parsed = replaceValue(value, '');
  if (parsed === 'true') {
    return true;
  } else if (parsed === 'false') {
    return false;
  } else {
    throw new Error('bool parsing failed');
  }
};
