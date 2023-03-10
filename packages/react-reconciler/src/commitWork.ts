import { FiberNode, FiberRootNode } from './fiber';
import {
    ChildDeletion,
    MutationMask,
    NoFlags,
    Placement,
    Update
} from './fiberFlags';
import {
    appendChildToContainer,
    commitUpdate,
    Container,
    removeChild
} from 'hostConfig';
import {
    FunctionComponent,
    HostComponent,
    HostRoot,
    HostText
} from './workTags';

let nextEffect: FiberNode | null = null;
export const commitMutationEffects = (finishedWork: FiberNode) => {
    nextEffect = finishedWork;
    while (nextEffect !== null) {
        const child: FiberNode | null = nextEffect.child;
        if (
            (nextEffect.subTreeFlags & MutationMask) !== NoFlags &&
            child !== null
        ) {
            // 一直找到最叶子的突变节点
            nextEffect = child;
        } else {
            // 向上遍历
            up: while (nextEffect !== null) {
                commitMutationEffectsOnFiber(nextEffect);
                const sibling: FiberNode | null = nextEffect.sibling;
                if (sibling !== null) {
                    nextEffect = sibling;
                    break up;
                }
                nextEffect = nextEffect.return;
            }
        }
    }
};

const commitMutationEffectsOnFiber = (finishedWork: FiberNode) => {
    const flags = finishedWork.flags;
    if ((flags & Placement) !== NoFlags) {
        commitPlacement(finishedWork);
        finishedWork.flags &= ~Placement;
    }
    // Update
    if ((flags & Update) !== NoFlags) {
        commitUpdate(finishedWork);
        finishedWork.flags &= ~Update;
    }
    // ChildDeletion
    if ((flags & ChildDeletion) !== NoFlags) {
        const deletions = finishedWork.deletions;
        if (deletions !== null) {
            deletions.forEach((childToDelete) => {
                commitDeletion(childToDelete);
            });
        }
        finishedWork.flags &= ~ChildDeletion;
    }
};

const commitDeletion = (childToDelete: FiberNode) => {
    let rootHostNode: FiberNode | null = null;
    // 递归子树
    commitNestedComponent(childToDelete, (unmountFiber) => {
        switch (unmountFiber.tag) {
            case HostComponent:
                if (rootHostNode === null) {
                    rootHostNode = unmountFiber;
                }
                // TODO 解绑ref
                break;
            case HostText:
                if (rootHostNode === null) {
                    rootHostNode = unmountFiber;
                }
                break;
            case FunctionComponent:
                // TODO useEffect unmount, 解绑ref
                break;
            default:
                if (__DEV__) {
                    console.warn('未处理的unmount类型');
                }
                break;
        }
    });
    // 移除子树
    if (rootHostNode !== null) {
        const hostParent = getHostParent(childToDelete);
        if (hostParent !== null) {
            removeChild((rootHostNode as FiberNode).stateNode, hostParent);
        }
    }
    childToDelete.return = null;
    childToDelete.child = null;
};

function commitNestedComponent(
    root: FiberNode,
    onCommitUnmount: (fiber: FiberNode) => void
) {
    let node = root;
    while (true) {
        onCommitUnmount(node);

        if (node.child !== null) {
            node.child.return = node;
            node = node.child;
            continue;
        }
        if (node === root) {
            return;
        }
        while (node.sibling === null) {
            if (node.return === null || node.return === root) {
                return;
            }
            // 归
            node = node.return;
        }
        node.sibling.return = node.return;
        node = node.sibling;
    }
}

const commitPlacement = (finishedWork: FiberNode) => {
    if (__DEV__) {
        console.warn('执行Placement', finishedWork);
    }
    const hostParent = getHostParent(finishedWork);
    if (hostParent !== null) {
        appendPlacementNodeIntoContainer(finishedWork, hostParent);
    }
};

function getHostParent(fiber: FiberNode): Container | null {
    let parent = fiber.return;
    while (parent) {
        const parentTag = parent.tag;
        if (parentTag === HostComponent) {
            return parent.stateNode as Container;
        }
        if (parentTag === HostRoot) {
            return (parent.stateNode as FiberRootNode).container;
        }
        parent = parent.return;
    }
    if (__DEV__) {
        console.warn('未找到host parent');
    }
    return null;
}

function appendPlacementNodeIntoContainer(
    finishedWork: FiberNode,
    hostParent: Container
) {
    // 如果已经遍历到最下层叶子节点
    if (finishedWork.tag === HostComponent || finishedWork.tag === HostText) {
        appendChildToContainer(hostParent, finishedWork.stateNode);
        return;
    }

    // 向下遍历子节点
    const child = finishedWork.child;
    if (child !== null) {
        appendPlacementNodeIntoContainer(child, hostParent);
        let sibling = child.sibling;
        while (sibling !== null) {
            appendPlacementNodeIntoContainer(sibling, hostParent);
            sibling = sibling.sibling;
        }
    }
}
