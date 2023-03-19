import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';
import { Props } from 'shared/ReactTypes';
import { ReactElementType } from 'shared/reactTypes';
import {
    createFiberFromElement,
    createWorkInProgress,
    FiberNode
} from './fiber';
import { ChildDeletion, Placement } from './fiberFlags';
import { HostText } from './workTags';

function ChildReconciler(shouldTrackEffects: boolean) {
    function deleteChild(returnFiber: FiberNode, childToDelete: FiberNode) {
        if (!shouldTrackEffects) {
            return;
        }
        const deletions = returnFiber.deletions;
        if (deletions === null) {
            returnFiber.deletions = [childToDelete];
            returnFiber.flags |= ChildDeletion;
        } else {
            deletions.push(childToDelete);
        }
    }
    function deleteRemainingChildren(
        returnFiber: FiberNode,
        currentFirstChild: FiberNode | null
    ) {
        if (!shouldTrackEffects) {
            return;
        }
        let childToDelete = currentFirstChild;
        while (childToDelete !== null) {
            deleteChild(returnFiber, childToDelete);
            childToDelete = childToDelete.sibling;
        }
    }
    function reconcileSingleElement(
        returnFiber: FiberNode,
        currentFiber: FiberNode | null,
        element: ReactElementType
    ) {
        const key = element.key;
        while (currentFiber !== null) {
            // update
            if (currentFiber.key === key) {
                // key 相同
                if (element.$$typeof === REACT_ELEMENT_TYPE) {
                    if (currentFiber.type === element.type) {
                        // type 相同
                        const existing = useFiber(currentFiber, element.props);
                        existing.return = returnFiber;
                        // 当前节点可复用，标记剩余节点删除
                        deleteRemainingChildren(
                            returnFiber,
                            currentFiber.sibling
                        );
                        return existing;
                    }
                    // 删掉旧的
                    deleteRemainingChildren(returnFiber, currentFiber);
                    break;
                } else {
                    if (__DEV__) {
                        console.warn('还未实现的react类型', element);
                        break;
                    }
                }
            } else {
                // key 不同
                // 删掉旧的
                deleteChild(returnFiber, currentFiber);
                currentFiber = currentFiber.sibling;
            }
        }
        const fiber = createFiberFromElement(element);
        fiber.return = returnFiber;
        return fiber;
    }
    function reconcileSingleTextNode(
        returnFiber: FiberNode,
        currentFiber: FiberNode | null,
        content: string | number
    ) {
        while (currentFiber !== null) {
            // update
            if (currentFiber.tag === HostText) {
                // 类型没变
                const existing = useFiber(currentFiber, { content });
                existing.return = returnFiber;
                deleteRemainingChildren(returnFiber, currentFiber.sibling);
                return existing;
            }
            deleteChild(returnFiber, currentFiber);
            currentFiber = currentFiber.sibling;
        }
        const fiber = new FiberNode(HostText, { content }, null);
        fiber.return = returnFiber;
        return fiber;
    }

    function placeSingleChild(fiber: FiberNode) {
        if (shouldTrackEffects && fiber.alternate === null) {
            fiber.flags |= Placement;
        }
        return fiber;
    }
    return function reconcileChildFibers(
        returnFiber: FiberNode,
        currentFiber: FiberNode | null,
        newChild?: ReactElementType
    ) {
        if (typeof newChild === 'object' && newChild !== null) {
            switch (newChild.$$typeof) {
                case REACT_ELEMENT_TYPE:
                    return placeSingleChild(
                        reconcileSingleElement(
                            returnFiber,
                            currentFiber,
                            newChild
                        )
                    );

                default:
                    if (__DEV__) {
                        console.warn('为实现的reconcile类型', newChild);
                    }
                    break;
            }
        }
        // TODO 多节点

        if (typeof newChild === 'string' || typeof newChild === 'number') {
            return placeSingleChild(
                reconcileSingleTextNode(returnFiber, currentFiber, newChild)
            );
        }

        // 兜底逻辑
        if (currentFiber !== null) {
            deleteChild(returnFiber, currentFiber);
        }

        if (__DEV__) {
            console.warn('为实现的reconcile类型', newChild);
        }

        return null;
    };
}

function useFiber(fiber: FiberNode, pendingProps: Props): FiberNode {
    const clone = createWorkInProgress(fiber, pendingProps);
    clone.index = 0;
    clone.sibling = null;
    return clone;
}

export const reconcileChildFibers = ChildReconciler(true);
export const mountChildFibers = ChildReconciler(false);
