import {
  Marks,
  MarksLeo,
  Report_Card,
  Report_CardLeo,
  Report,
  ReportLeo,
  Counts,
  CountsLeo
} from "../types/types_test";
import {
  leo2js,
  tx,
  parseJSONLikeString
} from "@doko-js/core";
import {
  PrivateKey
} from "@aleohq/sdk"


export function getMarks(marks: MarksLeo): Marks {
  const result: Marks = {
    english: leo2js.u32(marks.english),
    math: leo2js.u32(marks.math),
    nepali: leo2js.u32(marks.nepali),
  }
  return result;
}

export function getReport_Card(report_Card: Report_CardLeo): Report_Card {
  const result: Report_Card = {
    attendance: leo2js.u32(report_Card.attendance),
    mark: getMarks(report_Card.mark),
  }
  return result;
}

export function getReport(report: ReportLeo): Report {
  const result: Report = {
    percentage: leo2js.u32(report.percentage),
    pass: leo2js.boolean(report.pass),
  }
  return result;
}

export function getCounts(counts: CountsLeo): Counts {
  const result: Counts = {
    owner: leo2js.address(counts.owner),
    increased_by: leo2js.u64(counts.increased_by),
    _nonce: leo2js.group(counts._nonce),
  }
  return result;
}


export function decryptCounts(counts: tx.RecordOutput < Counts > | string, privateKey: string): Counts {
  const encodedRecord: string = typeof counts === 'string' ? counts : counts.value;
  const decodedRecord: string = PrivateKey.from_string(privateKey).to_view_key().decrypt(encodedRecord);
  const result: Counts = getCounts(parseJSONLikeString(decodedRecord));

  return result;
}