import { Key, Props, Ref, Type } from "@my-react/shared/ReactTypes";
import { REACT_ELEMENT_TYPE } from "@my-react/shared/ReactSymbols";
import type { ReactElement as ReactElementType } from "@my-react/shared/ReactElementType";

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
  props: Props,
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

export function createElement(type: Type, config: any, children: any) {
  let propName;

  let key: Key = null;
  let ref: Ref = null;
  const props: any = {};

  if (config != null) {
    if (hasValidKey(config)) {
      key = "" + config.key;
    }
    if (hasValidRef(config)) {
      ref = "" + config.ref;
    }

    for (propName in config) {
      if (
        Object.prototype.hasOwnProperty.call(config, propName) &&
        !RESERVED_PROPS.hasOwnProperty(propName)
      ) {
        props[propName] = config[propName];
      }
    }
  }

  // 这里和jsx里的实现是不一样的，从React 17.0开始支持新版jsx函数
  // 因为新版jsx转换为jsx、jsxs函数时 babel 转译的参数与旧版转译为createElement时的参数不一样
  // 新版jsx函数性能更优
  const childrenLength = arguments.length - 2;
  if (childrenLength === 1) {
    props.children = children;
  } else if (childrenLength > 1) {
    const childrenArray = Array(childrenLength);
    for (let i = 0; i < childrenLength; i++) {
      childrenArray[i] = arguments[i + 2];
    }

    props.children = childrenArray;
  }

  if (type && type.defaultProps) {
    const defaultProps = type.defaultProps;
    for (propName in defaultProps) {
      if (props[propName] === undefined) {
        props[propName] = defaultProps[propName];
      }
    }
  }

  return ReactElement(type, key, ref, props);
}
