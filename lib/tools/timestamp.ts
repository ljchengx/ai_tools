export type TimestampUnit = "auto" | "seconds" | "milliseconds";
export type TimestampOutputUnit = Exclude<TimestampUnit, "auto">;
export type TimezoneMode = "local" | "utc";

export interface TimestampResult {
  date: Date;
  seconds: number;
  milliseconds: number;
  detectedUnit: TimestampOutputUnit;
}

export class TimestampTransformError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TimestampTransformError";
  }
}

const DATE_TIME_PATTERN = /^(\d{4,6})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/;

export function detectTimestampUnit(value: number | string): TimestampOutputUnit {
  const timestamp = parseTimestamp(value);
  return Math.abs(timestamp) >= 100_000_000_000 ? "milliseconds" : "seconds";
}

export function timestampToDate(value: number | string, unit: TimestampUnit = "auto"): TimestampResult {
  const timestamp = parseTimestamp(value);
  const detectedUnit = unit === "auto" ? detectTimestampUnit(timestamp) : unit;
  const milliseconds = detectedUnit === "seconds" ? timestamp * 1000 : timestamp;
  const date = new Date(milliseconds);

  assertValidDate(date);

  return {
    date,
    seconds: milliseconds / 1000,
    milliseconds,
    detectedUnit,
  };
}

export function dateTimeToTimestamp(
  value: string,
  unit: TimestampOutputUnit = "seconds",
  timezone: TimezoneMode = "local",
): number {
  const match = DATE_TIME_PATTERN.exec(value.trim());
  if (!match) {
    throw new TimestampTransformError("请输入完整且有效的日期时间。");
  }

  const [, yearText, monthText, dayText, hourText, minuteText, secondText = "0", millisecondText = "0"] = match;
  const parts = {
    year: Number(yearText),
    month: Number(monthText),
    day: Number(dayText),
    hour: Number(hourText),
    minute: Number(minuteText),
    second: Number(secondText),
    millisecond: Number(millisecondText.padEnd(3, "0")),
  };

  if (
    parts.month < 1 || parts.month > 12
    || parts.day < 1 || parts.day > 31
    || parts.hour > 23
    || parts.minute > 59
    || parts.second > 59
  ) {
    throw new TimestampTransformError("请输入完整且有效的日期时间。");
  }

  const date = timezone === "utc"
    ? new Date(Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second, parts.millisecond))
    : new Date(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second, parts.millisecond);
  assertValidDate(date);

  const actual = timezone === "utc"
    ? [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds()]
    : [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()];
  const expected = [parts.year, parts.month, parts.day, parts.hour, parts.minute, parts.second, parts.millisecond];

  if (actual.some((part, index) => part !== expected[index])) {
    throw new TimestampTransformError("该日期不存在，请检查年月日。");
  }

  return unit === "seconds" ? Math.trunc(date.getTime() / 1000) : date.getTime();
}

export function formatLocalDateTime(date: Date): string {
  assertValidDate(date);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`;
}

export function formatUtcDateTime(date: Date): string {
  assertValidDate(date);
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}.${pad(date.getUTCMilliseconds(), 3)} UTC`;
}

export function formatDateTimeInput(date: Date, timezone: TimezoneMode): string {
  assertValidDate(date);
  const year = timezone === "utc" ? date.getUTCFullYear() : date.getFullYear();
  const month = timezone === "utc" ? date.getUTCMonth() + 1 : date.getMonth() + 1;
  const day = timezone === "utc" ? date.getUTCDate() : date.getDate();
  const hour = timezone === "utc" ? date.getUTCHours() : date.getHours();
  const minute = timezone === "utc" ? date.getUTCMinutes() : date.getMinutes();
  const second = timezone === "utc" ? date.getUTCSeconds() : date.getSeconds();
  return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:${pad(second)}`;
}

function parseTimestamp(value: number | string): number {
  const normalized = typeof value === "string" ? value.trim() : value;
  if (normalized === "" || (typeof normalized === "string" && !/^-?\d+(?:\.\d+)?$/.test(normalized))) {
    throw new TimestampTransformError("请输入有效的数字时间戳。");
  }

  const timestamp = Number(normalized);
  if (!Number.isFinite(timestamp)) {
    throw new TimestampTransformError("请输入有效的数字时间戳。");
  }
  return timestamp;
}

function assertValidDate(date: Date): void {
  if (Number.isNaN(date.getTime())) {
    throw new TimestampTransformError("时间超出可转换范围。");
  }
}

function pad(value: number, length = 2): string {
  return String(value).padStart(length, "0");
}
