import { Key, Props, ReactElementType } from 'shared/reactTypes';
import { Flags, NoFlags } from './fiberFlags';
import { Container } from 'hostConfig';
import { UpdateQueue } from './updateQueue';
import { FunctionComponent, HostComponent, WorkTag } from './workTags';

export class FiberNode {
    tag: WorkTag;
    pendingProps: Props;
    key: Key;
    stateNode: any;
    type: any;

    return: FiberNode | null;
    sibling: FiberNode | null;
    child: FiberNode | null;
    index: number;

    memoizedProps: Props | null;
    memoizedState: any; // 在函数组件中 该字段储存的是函数组件内部调用的hook的链表
    alternate: FiberNode | null;
    flags: Flags;
    subTreeFlags: Flags;

    updateQueue: unknown;

    constructor(tag: WorkTag, pendingProps: Props, key: Key) {
        // 节点类型
        this.tag = tag;
        this.key = key;

        // jsx对应的DOM
        this.stateNode = null;

        // 函数组件是函数本身，类组件是组件实例
        this.type = null;

        // 树状结构关系字段：
        // 指向父fiberNode节点
        this.return = null;
        // 兄弟节点
        this.sibling = null;
        // 第一个子节点
        this.child = null;
        // 是父节点的第几个子节点
        this.index = 0;

        // 工作单元相关字段：
        this.pendingProps = pendingProps;
        this.memoizedProps = null;
        this.memoizedState = null;
        this.updateQueue = null;

        this.alternate = null;
        // 副作用
        this.flags = NoFlags;
        this.subTreeFlags = NoFlags;
    }
}
export class FiberRootNode {
    container: Container;
    current: FiberNode;
    finishedWork: FiberNode | null;
    constructor(container: Container, hostRootFiber: FiberNode) {
        this.container = container;
        this.current = hostRootFiber;
        hostRootFiber.stateNode = this; // this就是FiberRootNode实例
        this.finishedWork = null;
    }
}

export const createWorkInProgress = (
    current: FiberNode,
    pendingProps: Props
): FiberNode => {
    let wip = current.alternate;

    if (wip === null) {
        // mount 首次渲染的时候是没有wip树的
        wip = new FiberNode(current.tag, pendingProps, current.key);
        wip.stateNode = current.stateNode;

        wip.alternate = current;
        current.alternate = wip;
    } else {
        // update
        wip.pendingProps = pendingProps;
        wip.flags = NoFlags;
        wip.subTreeFlags = NoFlags;
    }
    wip.type = current.type;
    wip.updateQueue = current.updateQueue;
    wip.child = current.child;
    wip.memoizedProps = current.memoizedProps;
    wip.memoizedState = current.memoizedState;

    return wip;
};

export function createFiberFromElement(element: ReactElementType) {
    const { type, key, props } = element;
    let fiberTag: WorkTag = FunctionComponent;
    if (typeof type === 'string') {
        // <div></div>
        fiberTag = HostComponent;
    } else if (typeof type !== 'function' && __DEV__) {
        console.warn('未定义的type类型', element);
    }
    const fiber = new FiberNode(fiberTag, props, key);
    fiber.type = type;
    return fiber;
}
