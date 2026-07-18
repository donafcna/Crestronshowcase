import { NumericFormat } from "./numeric-format";
export type TimeFormatOptions = {};
export declare class TimeFormat extends NumericFormat {
    format(value: number, options: TimeFormatOptions): string;
}
