import { ICh5CommonAttributesForAppendClassWhenInViewPort } from "./common/i-ch5-common-attributes-appendclasswheninviewport";
import { ICh5CommonAttributesForCustomClass } from "./common/i-ch5-common-attributes-customclass";
import { ICh5CommonAttributesForCustomStyle } from "./common/i-ch5-common-attributes-customstyle";
import { ICh5CommonAttributesForDir } from "./common/i-ch5-common-attributes-dir";
import { ICh5CommonAttributesForId } from "./common/i-ch5-common-attributes-id";
import { ICh5CommonAttributesForNoShowType } from "./common/i-ch5-common-attributes-noshowtype";
import { ICh5CommonAttributesForReceiveStateEnable } from "./common/i-ch5-common-attributes-receivestateenable";
import { ICh5CommonAttributesForReceiveStateHidePulse } from "./common/i-ch5-common-attributes-receivestatehidepulse";
import { ICh5CommonAttributesForReceiveStateShow } from "./common/i-ch5-common-attributes-receivestateshow";
import { ICh5CommonAttributesForReceiveStateShowPulse } from "./common/i-ch5-common-attributes-receivestateshowpulse";
import { ICh5CommonAttributesForShow } from "./common/i-ch5-common-attributes-show";
export interface ICh5CommonAttributesVideoSwitcher extends ICh5CommonAttributesForDir, ICh5CommonAttributesForShow, ICh5CommonAttributesForAppendClassWhenInViewPort, ICh5CommonAttributesForReceiveStateEnable, ICh5CommonAttributesForReceiveStateHidePulse, ICh5CommonAttributesForReceiveStateShowPulse, ICh5CommonAttributesForReceiveStateShow, ICh5CommonAttributesForNoShowType, ICh5CommonAttributesForCustomStyle, ICh5CommonAttributesForCustomClass, ICh5CommonAttributesForId {
}
