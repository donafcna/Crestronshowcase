import { Ch5Signal } from "../ch5-signal";
export type TSignal = boolean | number | string | object;
export type TCh5Signal = Ch5Signal<boolean> | Ch5Signal<number> | Ch5Signal<string> | Ch5Signal<object> | null;
export type TSignalBagByType = {
    "boolean": {
        [key: string]: object | null;
    };
    "number": {
        [key: string]: object | null;
    };
    "object": {
        [key: string]: object | null;
    };
    "string": {
        [key: string]: object | null;
    };
    [key: string]: {
        [key: string]: object | null;
    };
};
