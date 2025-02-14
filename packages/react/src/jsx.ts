import type { ReactElement as ReactElementType } from "shared/ReactElementType";
import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols";
import { Type, Key, Ref, Props } from "shared/ReactTypes";

const RESERVED_PROPS = {
  key: true,
  ref: true, // removed in v19
};

function hasValidKey(config: any) {
  return config.key !== undefined;
}

function hasValidRef(config: any) {
  return config.ref !== undefined;
}

const ReactElement = function (
  type: Type,
  key: Key,
  ref: Ref,
  props: Props
): ReactElementType {
  const element = {
    $$typeof: REACT_ELEMENT_TYPE,

    type,
    key,
    ref,
    props,

    __north_p_bear: true as const,
  };

  if (Object.freeze) {
    Object.freeze(element.props);
    Object.freeze(element);
  }

  return element;
};

export const jsx = function (type: Type, config: any, maybeKey?: Key) {
  let propName;

  let key = null;
  let ref = null;
  const props: Props = {};

  if (maybeKey !== undefined) {
    key = "" + maybeKey;
  }

  if (hasValidKey(config)) {
    key = "" + config.key;
  }

  // removed in v19
  if (hasValidRef(config)) {
    ref = config.ref;
  }

  // 把非key，ref的字段组装到props中，v19之后ref也变成了普通的props
  for (propName in config) {
    if (
      Object.prototype.hasOwnProperty.call(config, propName) &&
      !RESERVED_PROPS.hasOwnProperty(propName)
    ) {
      props[propName] = config[propName];
    }
  }

  // 给未赋值的props设置默认值
  if (type && type.defaultProps) {
    const defaultProps = type.defaultProps;
    for (propName in defaultProps) {
      if (props[propName] === undefined) {
        props[propName] = defaultProps[propName];
      }
    }
  }

  return ReactElement(type, key, ref, props);
};
