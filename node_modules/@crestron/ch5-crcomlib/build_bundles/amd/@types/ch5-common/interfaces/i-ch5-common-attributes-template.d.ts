import { ICh5CommonAttributesForAppendClassWhenInViewPort } from "./common/i-ch5-common-attributes-appendclasswheninviewport";
import { ICh5CommonAttributesForDir } from "./common/i-ch5-common-attributes-dir";
import { ICh5CommonAttributesForId } from "./common/i-ch5-common-attributes-id";
import { ICh5CommonAttributesForNoShowType } from "./common/i-ch5-common-attributes-noshowtype";
import { ICh5CommonAttributesForReceiveStateHidePulse } from "./common/i-ch5-common-attributes-receivestatehidepulse";
import { ICh5CommonAttributesForReceiveStateShow } from "./common/i-ch5-common-attributes-receivestateshow";
import { ICh5CommonAttributesForReceiveStateShowPulse } from "./common/i-ch5-common-attributes-receivestateshowpulse";
import { ICh5CommonAttributesForSendEventOnShow } from "./common/i-ch5-common-attributes-sendeventonshow";
import { ICh5CommonAttributesForShow } from "./common/i-ch5-common-attributes-show";
export interface ICh5CommonAttributesTemplate extends ICh5CommonAttributesForDir, ICh5CommonAttributesForShow, ICh5CommonAttributesForAppendClassWhenInViewPort, ICh5CommonAttributesForSendEventOnShow, ICh5CommonAttributesForReceiveStateHidePulse, ICh5CommonAttributesForReceiveStateShowPulse, ICh5CommonAttributesForReceiveStateShow, ICh5CommonAttributesForNoShowType, ICh5CommonAttributesForId {
}
