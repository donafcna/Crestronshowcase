import { ICh5CommonAttributesVideoSwitcher } from "../../ch5-common/interfaces/i-ch5-common-attributes-video-switcher";
import { TCh5VideoSwitcherSourceListPosition, TCh5VideoSwitcherScreenAspectRatio, TCh5VideoSwitcherContractSourceLabelType, TCh5VideoSwitcherContractScreenLabelType } from './t-ch5-video-switcher';
export interface ICh5VideoSwitcherAttributes extends ICh5CommonAttributesVideoSwitcher {
    sourceListPosition: TCh5VideoSwitcherSourceListPosition;
    endless: boolean;
    numberOfSourceListDivisions: number;
    scrollbar: boolean;
    numberOfSources: number;
    numberOfScreenColumns: number;
    indexId: string;
    displayScreenLabel: boolean;
    screenAspectRatio: TCh5VideoSwitcherScreenAspectRatio;
    numberOfScreens: number;
    sourceIconClass: string;
    sourceIconUrl: string;
    sendEventOnDrop: string;
    sendEventOnChange: string;
    receiveStateSourceChanged: string;
    receiveStateSourceLabel: string;
    receiveStateScriptSourceLabelHtml: string;
    receiveStateScreenLabel: string;
    receiveStateScriptScreenLabelHtml: string;
    receiveStateNumberOfScreens: string;
    contractName: string;
    useContractForEnable: boolean;
    useContractForShow: boolean;
    contractSourceLabelType: TCh5VideoSwitcherContractSourceLabelType;
    contractScreenLabelType: TCh5VideoSwitcherContractScreenLabelType;
}
