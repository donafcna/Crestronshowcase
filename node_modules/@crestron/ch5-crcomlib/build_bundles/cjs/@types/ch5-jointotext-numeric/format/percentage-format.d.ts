import { NumericFormat } from "./numeric-format";
export type PercentageFormatOptions = {
    min: number;
    max: number;
    decimalLength: number;
    length: number;
};
export declare class PercentageFormat extends NumericFormat {
    format(value: number, options: PercentageFormatOptions): string;
}
