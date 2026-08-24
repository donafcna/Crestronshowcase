import { ICh5CommonAttributesForDir } from "../../ch5-common/interfaces/common/i-ch5-common-attributes-dir";
import { ICh5CommonAttributesForId } from "../../ch5-common/interfaces/common/i-ch5-common-attributes-id";
import { ICh5CommonAttributesForNoShowType } from "../../ch5-common/interfaces/common/i-ch5-common-attributes-noshowtype";
import { ICh5CommonAttributesForReceiveStateShow } from "../../ch5-common/interfaces/common/i-ch5-common-attributes-receivestateshow";
import { ICh5CommonAttributesForShow } from "../../ch5-common/interfaces/common/i-ch5-common-attributes-show";
export interface ICh5QrCodeAttributes extends ICh5CommonAttributesForDir, ICh5CommonAttributesForShow, ICh5CommonAttributesForReceiveStateShow, ICh5CommonAttributesForNoShowType, ICh5CommonAttributesForId {
    color: string;
    backgroundColor: string;
    size: number;
    qrCode: string;
    receiveStateQrCode: string;
}
