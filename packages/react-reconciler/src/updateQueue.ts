import { Dispatch } from 'react/src/currentDispatcher';
import { Action } from 'shared/ReactTypes';

export interface Update<State> {
    action: Action<State>; // this.setState接收的第一个参数，或者useState的Dispatch方法的入参
    next: Update<any> | null;
}
export interface UpdateQueue<State> {
    // 为了wip和current同时可以拿到最新的 update，所以通过shared对象的形式传递指针
    shared: {
        pending: Update<State> | null;
    };
    // hook
    dispatch: Dispatch<State> | null;
}

export const createUpdate = <State>(action: Action<State>): Update<State> => {
    return {
        action,
        next: null
    };
};

export const createUpdateQueue = <State>() => {
    return {
        shared: {
            pending: null
        },
        dispatch: null
    } as UpdateQueue<State>;
};

export const enqueueUpdate = <State>(
    updateQueue: UpdateQueue<State>,
    update: Update<State>
) => {
    const pending = updateQueue.shared.pending;
    // 构造环状链表
    if (pending === null) {
        // 如果是第一次更新，next指向自己
        update.next = update;
    } else {
        // 此时 pending 是上一次入队的最后一次更新，pending.next 拿到的永远是第一次更新
        // 让新的最后一次更新的 next 指向 第一次更新
        update.next = pending.next;
        // 执行入队操作，把 pending.next 赋值为新的最后一次更新
        pending.next = update;
    }
    // pending 永远指向最后一次的更新
    updateQueue.shared.pending = update;
};

export const processUpdateQueue = <State>(
    baseState: State,
    pendingUpdate: Update<State> | null
): {
    memoizedState: State;
} => {
    const result: ReturnType<typeof processUpdateQueue<State>> = {
        memoizedState: baseState
    };
    if (pendingUpdate !== null) {
        const action = pendingUpdate.action;
        if (action instanceof Function) {
            result.memoizedState = action(baseState);
        } else {
            result.memoizedState = action;
        }
    }
    return result;
};
