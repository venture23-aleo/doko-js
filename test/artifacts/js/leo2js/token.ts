import {
  token,
  tokenLeo
} from "../types/token";
import {
  leo2js,
  tx,
  parseJSONLikeString
} from "@doko-js/core";
import {
  PrivateKey
} from "@provablehq/sdk"


export function gettoken(token: tokenLeo): token {
  const result: token = {
    owner: leo2js.address(token.owner),
    amount: leo2js.u64(token.amount),
    _nonce: leo2js.group(token._nonce),
  }
  return result;
}


export function decrypttoken(token: tx.RecordOutput < token > | string, privateKey: string): token {
  const encodedRecord: string = typeof token === 'string' ? token : token.value;
  const decodedRecord: string = PrivateKey.from_string(privateKey).to_view_key().decrypt(encodedRecord);
  const result: token = gettoken(parseJSONLikeString(decodedRecord));

  return result;
}