import { FiberNode } from './fiber';
import { NoFlags, Update } from './fiberFlags';
import {
    appendInitialChild,
    createInstance,
    createTextInstance,
    Instance
} from 'hostConfig';
import {
    Fragment,
    FunctionComponent,
    HostComponent,
    HostRoot,
    HostText
} from './workTags';
import { updateFiberProps } from 'react-dom/src/SyntheticEvent';

function markUpdate(fiber: FiberNode) {
    fiber.flags |= Update;
}

export const completeWork = (wip: FiberNode) => {
    const newProps = wip.pendingProps;
    const current = wip.alternate;
    switch (wip.tag) {
        case HostComponent:
            if (current !== null && wip.stateNode) {
                // update
                // 1. 判断props是否变化
                // 变了就打UPDATE的flag
                // 不应该在此处调用updateFiberProps，应该跟着判断属性变化的逻辑，在这里打flag
                // 再在commitWork中更新fiberProps
                updateFiberProps(wip.stateNode, newProps);
            } else {
                // mount
                // 1. 构建dom
                const instance = createInstance(wip.type, newProps);
                // 2. 将dom插入到dom树中
                appendAllChildren(instance, wip);
                wip.stateNode = instance;
            }
            bubbleProperties(wip);
            return null;
        case HostText:
            if (current !== null && wip.stateNode) {
                // update
                const oldText = current.memoizedProps?.content;
                const newText = newProps.content;
                if (oldText !== newText) {
                    markUpdate(wip);
                }
            } else {
                // mount
                // 1. 构建dom
                const instance = createTextInstance(newProps.content);
                // 2. 将dom插入到dom树中
                appendAllChildren(instance, wip);
                wip.stateNode = instance;
            }
            bubbleProperties(wip);
            return null;
        case HostRoot:
        case FunctionComponent:
        case Fragment:
            bubbleProperties(wip);
            return null;

        default:
            if (__DEV__) {
                console.warn('未处理的completeWork情况', wip);
            }
            break;
    }
};

function appendAllChildren(parent: Instance, wip: FiberNode) {
    let node = wip.child;

    while (node !== null) {
        if (node?.tag === HostComponent || node?.tag === HostText) {
            appendInitialChild(parent, node.stateNode);
        } else if (node.child !== null) {
            node.child.return = node;
            node = node.child;
            continue;
        }
        if (node === wip) {
            return;
        }

        while (node.sibling === null) {
            if (node.return === null || node.return === wip) {
                return;
            }
            node = node?.return;
        }
        node.sibling.return = node.return;
        node = node.sibling;
    }
}

// 收集子节点的副作用（flags）
function bubbleProperties(wip: FiberNode) {
    let subTreeFlags = NoFlags;
    let child = wip.child;
    while (child !== null) {
        subTreeFlags |= child.subTreeFlags;
        subTreeFlags |= child.flags;

        child.return = wip;
        child = child.sibling;
    }
    wip.subTreeFlags |= subTreeFlags;
}
