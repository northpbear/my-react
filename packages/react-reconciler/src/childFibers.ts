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

type ExistingChildren = Map<string | number, FiberNode>;

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

    function reconcileChildrenArray(
        returnFiber: FiberNode,
        currentFirstChild: FiberNode | null,
        newChild: any[]
    ) {
        // 最后一个可复用fiber在current中的索引位置
        let lastPlacedIndex: number = 0;
        // 创建的最后一个fiber
        let lastNewFiber: FiberNode | null = null;
        // 创建的第一个fiber
        let firstNewFiber: FiberNode | null = null;

        // 将current保存再map中
        const existingChildren: ExistingChildren = new Map();

        let current = currentFirstChild;
        while (current !== null) {
            const keyToUse = current.key !== null ? current.key : current.index;
            existingChildren.set(keyToUse, current);
            current = current.sibling;
        }
        for (let i = 0; i < newChild.length; i++) {
            // 遍历newChild 寻找是否可复用
            const after = newChild[i];
            const newFiber = updateFromMap(
                returnFiber,
                existingChildren,
                i,
                after
            );
            if (newFiber === null) {
                continue;
            }

            // 标记移动还是插入
            newFiber.index = i;
            newFiber.return = returnFiber;
            if (lastNewFiber === null) {
                lastNewFiber = newFiber;
                firstNewFiber = newFiber;
            } else {
                lastNewFiber.sibling = newFiber;
                lastNewFiber = lastNewFiber.sibling;
            }
            if (!shouldTrackEffects) {
                continue;
            }

            const current = newFiber.alternate;
            if (current !== null) {
                const oldIndex = current.index;
                if (oldIndex < lastPlacedIndex) {
                    // 移动
                    newFiber.flags |= Placement;
                    continue;
                } else {
                    // 不移动
                    lastPlacedIndex = oldIndex;
                }
            } else {
                // mount
                newFiber.flags |= Placement;
            }
        }
        // 将map中剩下的标记为删除
        existingChildren.forEach((fiber) => {
            deleteChild(returnFiber, fiber);
        });

        return firstNewFiber;
    }

    function updateFromMap(
        returnFiber: FiberNode,
        existingChildren: ExistingChildren,
        index: number,
        element: any
    ): FiberNode | null {
        const keyToUse = element.key === null ? element.key : index;
        const before = existingChildren.get(keyToUse);
        if (typeof element === 'string' || typeof element === 'number') {
            // HostText
            if (before) {
                if (before.tag === HostText) {
                    existingChildren.delete(keyToUse);
                    return useFiber(before, { content: element + '' });
                }
            }
            return new FiberNode(HostText, { content: element + '' }, null);
        }

        if (typeof element === 'object' && element !== null) {
            switch (element.$$typeof) {
                case REACT_ELEMENT_TYPE:
                    if (before) {
                        if (before.type === element.type) {
                            existingChildren.delete(keyToUse);
                            return useFiber(before, element.type);
                        }
                    }
                    return createFiberFromElement(element);
                default:
                    break;
            }
        }

        // TODO 数组类型
        if (Array.isArray(element) && __DEV__) {
            console.warn('还未实现数组类型的child');
        }
        return null;
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
        // 多节点
        if (Array.isArray(newChild)) {
            return reconcileChildrenArray(returnFiber, currentFiber, newChild);
        }

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
