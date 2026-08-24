import { NumericFormat } from "./numeric-format";
export type RawFormatOptions = {};
export declare class RawFormat extends NumericFormat {
    format(value: number, options: RawFormatOptions): string;
}
