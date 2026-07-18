import { Ch5Log } from "../ch5-common/ch5-log";
import { ICh5VideoSwitcherScreenLabelDocumentation } from "./interfaces";
export declare class Ch5VideoSwitcherScreenLabel extends Ch5Log implements ICh5VideoSwitcherScreenLabelDocumentation {
    static ELEMENT_NAME: string;
    static registerCustomElement(): void;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
}
