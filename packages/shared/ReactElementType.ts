import { Key, Props, Ref, Type } from "./ReactTypes";

export interface ReactElement {
  $$typeof: symbol;
  type: Type;
  key: Key;
  ref: Ref;
  props: Props;

  __north_p_bear: true;
}
