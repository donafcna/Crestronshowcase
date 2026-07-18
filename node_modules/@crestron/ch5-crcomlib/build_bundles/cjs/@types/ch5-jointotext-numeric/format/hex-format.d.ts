import { NumericFormat } from "./numeric-format";
export type HexFormatOptions = {
    length: number;
};
export declare class HexFormat extends NumericFormat {
    format(value: number, options: HexFormatOptions): string;
}
