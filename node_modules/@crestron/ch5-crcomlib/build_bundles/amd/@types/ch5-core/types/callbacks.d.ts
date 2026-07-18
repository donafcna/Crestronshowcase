import { TSignal } from "./signal.type";
import { IResynchronizationRequestModel } from "../../ch5-resync/models/resynchronization-request-model";
import { TVideoResponse } from "../../ch5-video/interfaces";
export type Ch5SignalUpdateCallback<T extends TSignal> = (value: T) => void;
export type Ch5SignalErrorCallback = (err: any) => void;
export type TAllSignalSubscriptionUpdateCallbacks = Ch5SignalUpdateCallback<boolean> | Ch5SignalUpdateCallback<number> | Ch5SignalUpdateCallback<string> | Ch5SignalUpdateCallback<object> | Ch5SignalUpdateCallback<TVideoResponse> | Ch5SignalUpdateCallback<IResynchronizationRequestModel>;
