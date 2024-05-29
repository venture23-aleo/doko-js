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
  js2leo
} from "@doko-js/core";


export function getMarksLeo(marks: Marks): MarksLeo {
  const result: MarksLeo = {
    english: js2leo.u32(marks.english),
    math: js2leo.u32(marks.math),
    nepali: js2leo.u32(marks.nepali),
  }
  return result;
}

export function getReport_CardLeo(report_Card: Report_Card): Report_CardLeo {
  const result: Report_CardLeo = {
    attendance: js2leo.u32(report_Card.attendance),
    mark: getMarksLeo(report_Card.mark),
  }
  return result;
}

export function getReportLeo(report: Report): ReportLeo {
  const result: ReportLeo = {
    percentage: js2leo.u32(report.percentage),
    pass: js2leo.boolean(report.pass),
  }
  return result;
}

export function getCountsLeo(counts: Counts): CountsLeo {
  const result: CountsLeo = {
    owner: js2leo.privateField(js2leo.address(counts.owner)),
    increased_by: js2leo.privateField(js2leo.u64(counts.increased_by)),
    _nonce: js2leo.publicField(js2leo.group(counts._nonce)),
  }
  return result;
}