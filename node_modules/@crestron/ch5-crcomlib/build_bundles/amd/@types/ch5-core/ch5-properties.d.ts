import { ICh5PropertySettings, TPropertyTypes } from "./ch5-property";
import { Ch5Common } from "../ch5-common/ch5-common";
import { Ch5Log } from "../ch5-common/ch5-log";
import { Ch5BaseClass } from "../ch5-base/ch5-base-class";
export declare class Ch5Properties {
    ch5Component: Ch5Common | Ch5BaseClass | Ch5Log;
    propertiesArray: ICh5PropertySettings[];
    private _properties;
    constructor(ch5Component: Ch5Common | Ch5BaseClass | Ch5Log, propertiesArray: ICh5PropertySettings[]);
    addProperty(propertiesObject: ICh5PropertySettings): void;
    unsubscribe(): void;
    getPrevious<T>(propertyName: string): T;
    get<T>(propertyName: string): T;
    set<T>(propertyName: string, value: TPropertyTypes, callback?: any, signalCallback?: any): void;
    setForSignalResponse<T>(propertyName: string, value: TPropertyTypes, callback?: any, signalCallback?: any): void;
    private isAttributeAvailableInComponent;
    private getPropertyByName;
}
