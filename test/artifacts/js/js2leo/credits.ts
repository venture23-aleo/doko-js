import {
  credits,
  creditsLeo
} from "../types/credits";
import {
  js2leo
} from "@doko-js/core";


export function getcreditsLeo(credits: credits): creditsLeo {
  const result: creditsLeo = {
    owner: js2leo.privateField(js2leo.address(credits.owner)),
    microcredits: js2leo.privateField(js2leo.u64(credits.microcredits)),
    _nonce: js2leo.publicField(js2leo.group(credits._nonce)),
  }
  return result;
}