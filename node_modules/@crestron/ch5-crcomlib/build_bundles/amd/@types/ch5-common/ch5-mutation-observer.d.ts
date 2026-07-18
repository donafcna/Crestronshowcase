import { Ch5BaseClass } from "../ch5-base/ch5-base-class";
import { Ch5Common } from "./ch5-common";
export interface IShowStyle {
    visibility: string;
    opacity: string;
}
export declare class Ch5MutationObserver {
    static ELEMENTS_MO_EXCEPTION: string[];
    isConnected: boolean;
    private _mutationsObserver;
    private _mutationsObserverConfig;
    private _element;
    static checkElementValidity(target: HTMLElement): boolean;
    constructor(element: Ch5Common | Ch5BaseClass);
    observe(target: Node): void;
    disconnectObserver(): void;
    private _updateComponentVisibility;
    private _shouldUpdateComponentVisibility;
}
