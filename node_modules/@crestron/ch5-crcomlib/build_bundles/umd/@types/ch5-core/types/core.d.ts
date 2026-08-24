import { Subscription } from 'rxjs';
export type TSignalNonStandardTypeName = "boolean" | "b" | "number" | "numeric" | "n" | "string" | "s" | "object" | "o";
export type TSignalStandardTypeName = "boolean" | "number" | "string" | "object";
export type TRepeatDigitalSignalValue = {
    [key: string]: boolean | string | number | object;
};
export type TSignalValue = boolean | string | number | object;
export type TActionLogic = "set" | "link" | "toggle" | "pulse" | "increment" | "decrement" | "rcb";
export type TStringSet = Set<string>;
export type TSignalsSubscriptionsByType = {
    "boolean": TStringSet;
    "number": TStringSet;
    "string": TStringSet;
    "object": TStringSet;
    [key: string]: TStringSet;
};
export type TSignalSubscriptions = {
    [key: string]: Subscription;
};
