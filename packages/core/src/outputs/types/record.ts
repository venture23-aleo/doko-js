import { LeoAddress } from '@/leo-types';

export type BaseRecord = {
  owner: LeoAddress;
  _nonce: bigint;
};
