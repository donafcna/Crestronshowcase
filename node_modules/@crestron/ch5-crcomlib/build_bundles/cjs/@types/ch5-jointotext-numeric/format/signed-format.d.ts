import { NumericFormat } from "./numeric-format";
export type SignedFormatOptions = {
    length: number;
};
export declare class SignedFormat extends NumericFormat {
    format(value: number, options: SignedFormatOptions): string;
}
