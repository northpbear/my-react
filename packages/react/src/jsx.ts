import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';
import {
    Key,
    Props,
    ReactElementType,
    Ref,
    ElementType
} from 'shared/reactTypes';

const ReactElement = function (
    type: ElementType,
    key: Key,
    ref: Ref,
    props: Props
): ReactElementType {
    const element = {
        $$typeof: REACT_ELEMENT_TYPE, // 表示当前对象是一个reactElement
        type,
        key,
        ref,
        props
    };
    return element;
};

export const jsx = (type: ElementType, config: any, ...maybeChildren: any) => {
    let key: Key = null;
    const props: Props = {};
    let ref: Ref = null;

    // 遍历所有属性，获取key, ref, props
    for (const prop in config) {
        const val = config[prop];
        if (prop === 'key') {
            // 没传入key字段的jsx key都是'undefined'
            key = '' + val;
            continue;
        }
        if (prop === 'ref' && val !== undefined) {
            ref = val;
            continue;
        }
        // 过滤原型属性，只保留config自身传入的属性
        if (Object.prototype.hasOwnProperty.call(config, prop)) {
            props[prop] = val;
        }
    }

    const maybeChildrenLength = maybeChildren.length;
    if (maybeChildrenLength) {
        // children可能是一个ReactElement，也可能是Array<ReactElement>
        if (maybeChildrenLength === 1) {
            props.children = maybeChildren[0];
        } else {
            props.children = maybeChildren;
        }
    }

    return ReactElement(type, key, ref, props);
};
