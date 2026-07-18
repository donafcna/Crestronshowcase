export declare class Ch5CommonLog {
    isDebugEnabled: boolean;
    isTraceEnabled: boolean;
    crId: string;
    componentId: string;
    constructor(isDebugEnabled: boolean, isTraceEnabled?: boolean, crId?: string, componentId?: string);
    start(message: string, componentName?: string): void;
    log(...message: any[]): void;
    info(message?: any, ...optionalParams: any[]): void;
    error(message: any, ...optionalParams: any[]): void;
    stop(): void;
}
