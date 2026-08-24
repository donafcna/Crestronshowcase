export declare class Ch5BaseLog {
    componentName: string;
    isDebugEnabled: boolean;
    isTraceEnabled: boolean;
    crId: string;
    constructor(componentName: string, isDebugEnabled: boolean, isTraceEnabled?: boolean, crId?: string);
    start(message: string): void;
    log(...message: any[]): void;
    info(message?: any, ...optionalParams: any[]): void;
    error(message: any, ...optionalParams: any[]): void;
    stop(methodName?: string): void;
}
