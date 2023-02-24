import { ReactElementType } from 'shared/reactTypes';
import { FiberNode, FiberRootNode } from './fiber';
import { Container } from './hostConfig';
import {
    createUpdate,
    createUpdateQueue,
    enqueueUpdate,
    UpdateQueue
} from './updateQueue';
import { scheduleUpdateOnFiber } from './workLoop';
import { HostRoot } from './workTags';

/**
 * 创建hostRootFiber，将 hostRootFiber 和 fiberRootNode 连系起来
 * @param container
 * @returns
 */
export function createContainer(container: Container) {
    const hostRootFiber = new FiberNode(HostRoot, {}, null);
    const root = new FiberRootNode(container, hostRootFiber);
    hostRootFiber.updateQueue = createUpdateQueue();
    return root;
}

export function updateContainer(
    element: ReactElementType | null,
    root: FiberRootNode
) {
    const hostRootFiber = root.current;
    const update = createUpdate<ReactElementType | null>(element);

    enqueueUpdate(
        hostRootFiber.updateQueue as UpdateQueue<ReactElementType | null>,
        update
    );
    scheduleUpdateOnFiber(hostRootFiber);
    return element;
}
