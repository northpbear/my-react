import { beginWork } from './beginWork';
import { completeWork } from './completeWork';
import { FiberNode } from './fiber';

let workInprogress: FiberNode | null = null;

function prepareFreshStack(fiber: FiberNode) {
    // 初始化
    workInprogress = fiber;
}
function renderRoot(root: FiberNode) {
    prepareFreshStack(root);
    do {
        try {
            workLoop();
        } catch (e) {
            console.warn('workLoop 报错');
            workInprogress = null;
        }
    } while (true);
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
