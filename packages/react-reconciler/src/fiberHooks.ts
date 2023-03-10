import { Dispatch, Dispatcher } from 'react/src/currentDispatcher';
import internals from 'shared/internals';
import { Action } from 'shared/reactTypes';
import { FiberNode } from './fiber';
import {
    createUpdate,
    createUpdateQueue,
    enqueueUpdate,
    processUpdateQueue,
    UpdateQueue
} from './updateQueue';
import { scheduleUpdateOnFiber } from './workLoop';

let currentlyRenderingFiber: FiberNode | null = null;
let workInProgressHook: Hook | null = null;
let currentHook: Hook | null = null;

const { currentDispatcher } = internals;

interface Hook {
    memoizedState: any; // 保存当前这个hook自身的状态，不同hook值的含义不同，且不同于Fiber中的memoizedState字段含义
    updateQueue: unknown;
    next: Hook | null;
}

export function renderWithHooks(wip: FiberNode) {
    // 初始化赋值
    currentlyRenderingFiber = wip;
    wip.memoizedState = null;

    const current = wip.alternate;
    if (current !== null) {
        //update
        currentDispatcher.current = HooksDispatcherOnUpdate;
    } else {
        //mount
        currentDispatcher.current = HooksDispatcherOnMount;
    }

    const Component = wip.type;
    const props = wip.pendingProps;
    const children = Component(props);

    // 执行完重置为null
    currentlyRenderingFiber = null;
    workInProgressHook = null;
    currentHook = null;
    return children;
}

const HooksDispatcherOnMount: Dispatcher = {
    useState: mountState
};
const HooksDispatcherOnUpdate: Dispatcher = {
    useState: updateState
};

function updateState<State>(): [State, Dispatch<State>] {
    // 找到当前useState对应的hook数据
    const hook = updateWorkInProgressHook();

    // 计算新的state
    const queue = hook.updateQueue as UpdateQueue<State>;
    const pending = queue.shared.pending;

    if (pending !== null) {
        const { memoizedState } = processUpdateQueue(
            hook.memoizedState,
            pending
        );
        hook.memoizedState = memoizedState;
    }

    return [hook.memoizedState, queue.dispatch as Dispatch<State>];
}

function mountState<State>(
    initialState: (() => State) | State
): [State, Dispatch<State>] {
    // 找到当前useState对应的hook数据
    const hook = mountWorkInProgressHook();
    let memoizedState;
    if (initialState instanceof Function) {
        memoizedState = initialState();
    } else {
        memoizedState = initialState;
    }
    const queue = createUpdateQueue<State>();
    hook.updateQueue = queue;
    hook.memoizedState = memoizedState;

    // @ts-ignore
    const dispatch = dispatchSetState.bind(
        null,
        currentlyRenderingFiber,
        queue
    );
    queue.dispatch = dispatch;
    return [memoizedState, dispatch];
}

function dispatchSetState<State>(
    fiber: FiberNode,
    updateQueue: UpdateQueue<State>,
    action: Action<State>
) {
    const update = createUpdate(action);
    enqueueUpdate(updateQueue, update);
    scheduleUpdateOnFiber(fiber);
}

function updateWorkInProgressHook(): Hook {
    // TODO render阶段触发的更新
    let nextCurrentHook: Hook | null;

    if (currentHook === null) {
        // FC update时的第一个hook
        const current = currentlyRenderingFiber?.alternate;
        if (current !== null) {
            nextCurrentHook = current?.memoizedState;
        } else {
            nextCurrentHook = null;
        }
    } else {
        // 这个FC update 后续的hook
        nextCurrentHook = currentHook.next;
    }

    if (nextCurrentHook === null) {
        // hook声明在if里的违规情况
        throw new Error(
            `组件${currentlyRenderingFiber?.type}中当前执行的hook上次render时不存在`
        );
    }

    currentHook = nextCurrentHook as Hook;
    const newHook: Hook = {
        memoizedState: currentHook.memoizedState,
        updateQueue: currentHook.updateQueue,
        next: null
    };
    if (workInProgressHook === null) {
        // mount 第一个hook
        if (currentlyRenderingFiber === null) {
            throw new Error('请在函数组件内调用hook');
        } else {
            workInProgressHook = newHook;
            currentlyRenderingFiber.memoizedState = workInProgressHook;
        }
    } else {
        // mount 后面的hook
        workInProgressHook.next = newHook;
        workInProgressHook = newHook;
    }
    return workInProgressHook;
}

function mountWorkInProgressHook(): Hook {
    const hook: Hook = {
        memoizedState: null,
        updateQueue: null,
        next: null
    };
    if (workInProgressHook === null) {
        // mount 第一个hook
        if (currentlyRenderingFiber === null) {
            throw new Error('请在函数组件内调用hook');
        } else {
            workInProgressHook = hook;
            currentlyRenderingFiber.memoizedState = workInProgressHook;
        }
    } else {
        // mount 后面的hook
        workInProgressHook.next = hook;
        workInProgressHook = hook;
    }
    return workInProgressHook;
}
