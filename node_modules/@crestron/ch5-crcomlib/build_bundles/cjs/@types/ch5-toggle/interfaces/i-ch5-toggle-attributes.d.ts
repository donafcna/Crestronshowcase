import { ICh5CommonAttributesToggle } from "../../ch5-common/interfaces/i-ch5-common-attributes-toggle";
import { TCh5ToggleHandleShape, TCh5ToggleOrientation, TCh5ToggleSize } from './t-ch5-toggle';
import { TCh5CommonInputFeedbackModes } from "../../ch5-common-input/interfaces/t-ch5-common-input";
export interface ICh5ToggleAttributes extends ICh5CommonAttributesToggle {
    handleShape: TCh5ToggleHandleShape;
    label: string;
    labelOn: string;
    labelOff: string;
    iconOn: string;
    iconOff: string;
    orientation: TCh5ToggleOrientation;
    size: TCh5ToggleSize;
    value: boolean;
    receiveStateValue: string;
    receiveStateScriptLabelHTML: string;
    sendEventOnClick: string;
    feedbackMode: TCh5CommonInputFeedbackModes;
    sendEventOnTouch: string;
    signalValueSyncTimeout: string | number;
    onclean: {};
    ondirty: {};
}
