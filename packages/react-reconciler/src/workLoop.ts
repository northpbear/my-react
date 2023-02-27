import { beginWork } from './beginWork';
import { commitMutationEffects } from './commitWork';
import { completeWork } from './completeWork';
import { createWorkInProgress, FiberNode, FiberRootNode } from './fiber';
import { MutationMask, NoFlags } from './fiberFlags';
import { HostRoot } from './workTags';

let workInprogress: FiberNode | null = null;

function prepareFreshStack(root: FiberRootNode) {
    // 初始化
    workInprogress = createWorkInProgress(root.current, {});
}

export function scheduleUpdateOnFiber(fiber: FiberNode) {
    // 首屏渲染 入参fiber是hostRootFiber，其余情况都是Component对应的Fiber

    // TODO 实现调度
    const root = markUpdateFromFiberToRoot(fiber);
    renderRoot(root);
}
function markUpdateFromFiberToRoot(fiber: FiberNode) {
    let node = fiber;
    let parent = node.return;
    while (parent !== null) {
        // hostRootFiber没有return属性，也就没有parent，不会进入循环中
        // hostRootFiber有一个stateNode属性指向fiberRootNode
        node = parent;
        parent = parent.return;
    }
    if (node.tag === HostRoot) {
        return node.stateNode;
    }
    return null;
}
function renderRoot(root: FiberRootNode) {
    prepareFreshStack(root);
    do {
        try {
            workLoop();
            break;
        } catch (e) {
            if (__DEV__) {
                console.warn('workLoop 报错');
            }
            workInprogress = null;
        }
    } while (true);

    const finishedWork = root.current.alternate;
    root.finishedWork = finishedWork;

    commitRoot(root);
}

function commitRoot(root: FiberRootNode) {
    const finishedWork = root.finishedWork;

    if (finishedWork === null) {
        return;
    }

    if (__DEV__) {
        console.warn('commit阶段开始', finishedWork);
    }

    root.finishedWork = null;

    // 通过root的flags和subtreeFlags判断是否存在突变
    const subtreeHasEffect =
        (finishedWork.subTreeFlags & MutationMask) !== NoFlags;
    const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags;

    if (subtreeHasEffect || rootHasEffect) {
        // beforeMutation
        // mutation
        commitMutationEffects(finishedWork);
        root.current = finishedWork;
        // layout
    } else {
        root.current = finishedWork;
    }
}
function workLoop() {
    // 深度优先遍历
    while (workInprogress !== null) {
        performUnitOfWork(workInprogress);
    }
}
function performUnitOfWork(fiber: FiberNode) {
    // next 是子节点
    const next = beginWork(fiber);
    fiber.memoizedProps = fiber.pendingProps;
    if (next === null) {
        completeUnitOfWork(fiber);
    } else {
        workInprogress = next;
    }
}
function completeUnitOfWork(fiber: FiberNode) {
    let node: FiberNode | null = fiber;

    do {
        completeWork(node);
        const sibling = node.sibling;
        if (sibling !== null) {
            workInprogress = sibling;
            return;
        }
        node = node.return;
        workInprogress = node;
    } while (node !== null);
}
