import { Ch5Log } from "../ch5-common/ch5-log";
import { ICh5PropertySettings } from "../ch5-core/ch5-property";
import { TCh5VideoSwitcherScreenAlignLabel } from "./interfaces/t-ch5-video-switcher";
import { ICh5VideoSwitcherScreenAttributes } from "./interfaces";
export declare class Ch5VideoSwitcherScreen extends Ch5Log implements ICh5VideoSwitcherScreenAttributes {
    static ELEMENT_NAME: string;
    static readonly ALIGN_LABEL: TCh5VideoSwitcherScreenAlignLabel[];
    static readonly COMPONENT_PROPERTIES: ICh5PropertySettings[];
    private _ch5Properties;
    private parentComponent;
    set alignLabel(value: TCh5VideoSwitcherScreenAlignLabel);
    get alignLabel(): TCh5VideoSwitcherScreenAlignLabel;
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
    private screenLabelHelper;
}
