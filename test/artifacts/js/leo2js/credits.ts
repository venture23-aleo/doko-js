import {
  credits,
  creditsLeo
} from "../types/credits";
import {
  leo2js,
  tx,
  parseJSONLikeString
} from "@doko-js/core";
import {
  PrivateKey
} from "@aleohq/sdk"


export function getcredits(credits: creditsLeo): credits {
  const result: credits = {
    owner: leo2js.address(credits.owner),
    microcredits: leo2js.u64(credits.microcredits),
    _nonce: leo2js.group(credits._nonce),
  }
  return result;
}


export function decryptcredits(credits: tx.RecordOutput < credits > | string, privateKey: string): credits {
  const encodedRecord: string = typeof credits === 'string' ? credits : credits.value;
  const decodedRecord: string = PrivateKey.from_string(privateKey).to_view_key().decrypt(encodedRecord);
  const result: credits = getcredits(parseJSONLikeString(decodedRecord));

  return result;
}