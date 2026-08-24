import { Ch5Dpad } from "./ch5-dpad";
import { Ch5DpadButtonBase } from "./ch5-dpad-button-base";
import { ICh5DpadButtonBaseAttributes } from "./interfaces/i-ch5-dpad-button-base-attributes";
export declare class Ch5DpadButton extends Ch5DpadButtonBase implements ICh5DpadButtonBaseAttributes {
    static readonly ELEMENT_NAME = "ch5-dpad-button";
    static registerCustomElement(): void;
    static registerSignalAttributeTypes(): void;
    constructor(parentDpad: Ch5Dpad, isDisabled?: boolean);
}
