export interface ICh5VideoBackground {
    action: string;
    id: string;
    top: number;
    left: number;
    width: number;
    height: number;
}
export interface ICh5VideoPublishEvent {
    action: string;
    id: number;
    credentials?: ICh5VideoCredentials;
    source?: ICh5VideoSource;
    location?: ICh5VideoLocation;
    alphablend?: boolean;
    starttime?: number;
    endtime?: number;
    timing?: string;
}
export interface ICh5VideoCredentials {
    userid: string;
    password: string;
}
export interface ICh5VideoSource {
    type: string;
    url: string;
}
export interface ICh5VideoLocation {
    top: number;
    left: number;
    width: number;
    height: number;
    z: number;
}
export type TDimension = {
    width: number;
    height: number;
};
export type TVideoResponse = {
    currenttime: number;
    id: number;
    status: string;
    statuscode: number;
    location: TVideoLocationResponse;
};
export type TVideoLocationResponse = {
    height: number;
    left: number;
    top: number;
    width: number;
};
export type TPosDimension = {
    width: number;
    height: number;
    posX: number;
    posY: number;
};
export type IVideoElementDimensions = {
    offsetLeft: number;
    offsetTop: number;
    totalHeight: number;
    totalWidth: number;
};
export type TSnapShotSignalName = {
    index: number;
    videoTagId: string;
    snapshotURL: string;
    snapshotRefreshRate: number;
    snapshotUser: string;
    snapshotPass: string;
    isMultipleVideo: boolean;
};
export type ITouchOrdinates = {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
};
export type TVideoTouchManagerParams = {
    onTouchStartHandler: () => {};
    onTouchMoveHandler: () => {};
    onTouchEndHandler: () => {};
    onTouchCancelHandler: () => {};
    pollingDuration: number;
    componentID: string;
};
export interface TMultiVideoSignalName {
    url: string;
    userId: string;
    password: string;
    sourceType: string;
    snapshotURL: string;
    snapshotUserId: string;
    snapshotPassword: string;
    snapshotRefreshRate: string;
}
