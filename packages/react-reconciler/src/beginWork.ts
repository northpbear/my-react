import { ReactElementType } from 'shared/reactTypes';
import { mountChildFibers, reconcileChildFibers } from './childFibers';
import { FiberNode } from './fiber';
import { renderWithHooks } from './fiberHooks';
import { processUpdateQueue, UpdateQueue } from './updateQueue';
import {
    FunctionComponent,
    HostComponent,
    HostRoot,
    HostText
} from './workTags';

export const beginWork = (wip: FiberNode) => {
    // 递归fiber树，返回子节点
    switch (wip.tag) {
        case HostRoot:
            return updateHostRoot(wip);
        case HostComponent:
            return updateHostComponent(wip);
        case HostText:
            return null;
        case FunctionComponent:
            return updateFunctionComponent(wip);

        default:
            if (__DEV__) {
                console.warn('beginWork 未实现');
            }
            break;
    }
    return null;
};

function updateFunctionComponent(wip: FiberNode) {
    const nextChildren = renderWithHooks(wip);
    reconcileChildren(wip, nextChildren);
    return wip.child;
}

function updateHostRoot(wip: FiberNode) {
    const baseState = wip.memoizedState;
    const updateQueue = wip.updateQueue as UpdateQueue<Element>;
    const pending = updateQueue.shared.pending;
    updateQueue.shared.pending = null;
    const { memoizedState } = processUpdateQueue(baseState, pending);
    wip.memoizedState = memoizedState;

    const nextChildren = wip.memoizedState;
    reconcileChildren(wip, nextChildren);
    return wip.child;
}

function updateHostComponent(wip: FiberNode) {
    const nextProps = wip.pendingProps;
    const nextChildren = nextProps.children;
    reconcileChildren(wip, nextChildren);
    return wip.child;
}

function reconcileChildren(wip: FiberNode, children?: ReactElementType) {
    const current = wip.alternate;
    if (current !== null) {
        // update
        wip.child = reconcileChildFibers(wip, current?.child, children);
    } else {
        // mount
        wip.child = mountChildFibers(wip, null, children);
    }
}
