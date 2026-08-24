import { Ch5Log } from "../ch5-common/ch5-log";
import { ICh5PropertySettings } from "../ch5-core/ch5-property";
import { ICh5VideoSwitcherSourceAttributes } from "./interfaces";
export declare class Ch5VideoSwitcherSource extends Ch5Log implements ICh5VideoSwitcherSourceAttributes {
    static ELEMENT_NAME: string;
    static readonly COMPONENT_PROPERTIES: ICh5PropertySettings[];
    private _ch5Properties;
    private parentComponent;
    set iconClass(value: string);
    get iconClass(): string;
    set iconUrl(value: string);
    get iconUrl(): string;
    set labelInnerHTML(value: string);
    get labelInnerHTML(): string;
    static registerCustomElement(): void;
    constructor();
    static get observedAttributes(): string[];
    attributeChangedCallback(attr: string, oldValue: string, newValue: string): void;
    connectedCallback(): void;
    private getParentElement;
    disconnectedCallback(): void;
    protected initAttributes(): void;
    private sourceLabelHelper;
    private handleIcon;
}
