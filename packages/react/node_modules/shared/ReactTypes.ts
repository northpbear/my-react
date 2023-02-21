export type ElementType = any;
export type Key = string | null;
export type Ref = any;
export type Props = {
    [key: string]: any;
    children?: any;
};

export interface ReactElementType {
    $$typeof: symbol | number;
    type: ElementType;
    key: Key;
    ref: Ref;
    props: Props;
}
