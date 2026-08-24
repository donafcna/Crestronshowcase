export type TCh5KeypadStretch = 'both' | 'width' | 'height';
export type TCh5KeypadType = 'default' | 'primary' | 'info' | 'text' | 'danger' | 'warning' | 'success' | 'secondary';
export type TCh5KeypadShape = 'rounded-rectangle' | 'square' | 'circle';
export type TCh5KeypadTextOrientation = 'top' | 'right' | 'bottom' | 'left';
export type TKeypadButtonDefault = {
    key: string;
    iconClass: string;
    labelMajor: string;
    labelMinor: string;
    pressed: boolean;
    index: number;
    defaultClasses: string[];
    sendEventOnClick: string;
};
export type TCh5KeypadSize = 'regular' | 'x-small' | 'small' | 'large' | 'x-large';
