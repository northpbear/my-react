export type WorkTag =
    | typeof FunctionComponent
    | typeof HostRoot
    | typeof HostComponent
    | typeof HostText;

export const FunctionComponent = 0;

export const HostRoot = 3;

// div span p ...
export const HostComponent = 5;

// jsx中的文字
export const HostText = 6;
