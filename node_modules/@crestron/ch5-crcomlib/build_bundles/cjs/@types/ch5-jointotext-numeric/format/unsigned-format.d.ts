import { NumericFormat } from "./numeric-format";
export type UnsignedFormatOptions = {
    length: number;
};
export declare class UnsignedFormat extends NumericFormat {
    format(value: number, options: UnsignedFormatOptions): string;
}
