import { Ch5Signal } from "./ch5-signal";
import { Ch5Common } from "../ch5-common/ch5-common";
import { Ch5Log } from "../ch5-common/ch5-log";
import { Ch5BaseClass } from "../ch5-base/ch5-base-class";
export type TPropertyTypes = boolean | number | string | object | any;
export interface ICh5PropertySettings {
    default: any;
    enumeratedValues?: any[];
    isNullable?: boolean;
    isObservableProperty: boolean;
    isSignal?: boolean;
    name: string;
    nameForSignal?: string;
    signalType?: string;
    removeAttributeOnNull: boolean;
    type: string;
    valueOnAttributeEmpty: any;
    numberProperties?: {
        min: number;
        max: number;
        conditionalMin: number;
        conditionalMax: number;
        conditionalMinValue: number;
        conditionalMaxValue: number;
    };
    attributes?: {};
    signals?: {
        name: string;
    };
}
export declare class Ch5Property {
    ch5Component: Ch5Common | Ch5BaseClass | Ch5Log;
    property: ICh5PropertySettings;
    private _attributeName;
    private _signalName;
    private _signalValue;
    private _signalState;
    private _propertyName;
    private _propertyPreviousValue;
    private _propertyValue;
    private _propertySignalValue;
    private initializedValue;
    private _propertySignalType;
    constructor(ch5Component: Ch5Common | Ch5BaseClass | Ch5Log, property: ICh5PropertySettings);
    get signalType(): string;
    get previousValue(): boolean | string | object | any;
    get value(): boolean | string | object | any;
    set value(value: boolean | string | object | any);
    get name(): string;
    get attributeName(): string;
    get signalName(): string;
    set signalName(value: string);
    get signalValue(): string;
    set signalValue(value: string);
    get signalState(): string;
    set signalState(value: string);
    setValue<T>(value: T, callback?: any, signalCallback?: any): void;
    setValueFromSignal<T>(value: T, callback?: any, signalCallback?: any): void;
    clearProperty(): void;
    private processValue;
    setSignalByNumber(signalValue: string): Ch5Signal<number> | null;
    setSignalByString(signalValue: string): Ch5Signal<string> | null;
    setSignalByBoolean(signalValue: string): Ch5Signal<boolean> | null;
    private toBoolean;
}
