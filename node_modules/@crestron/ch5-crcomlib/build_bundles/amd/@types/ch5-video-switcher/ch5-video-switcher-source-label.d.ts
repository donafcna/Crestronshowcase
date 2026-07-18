import { Ch5Log } from "../ch5-common/ch5-log";
import { ICh5VideoSwitcherSourceLabelDocumentation } from "./interfaces";
export declare class Ch5VideoSwitcherSourceLabel extends Ch5Log implements ICh5VideoSwitcherSourceLabelDocumentation {
    static ELEMENT_NAME: string;
    static registerCustomElement(): void;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
}
