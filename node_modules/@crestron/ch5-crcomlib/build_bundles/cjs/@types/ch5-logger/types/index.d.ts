import { LogLevelEnum } from '../enums/index';
export type TDataLog = {
    level: LogLevelEnum;
    source: string;
    message: string;
};
export type TLogMessageType = any[];
export type TAppenderConfig = {
    hostname: string;
    port: string;
    secure: boolean;
};
