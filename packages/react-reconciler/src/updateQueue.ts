import { Action } from 'shared/ReactTypes';

export interface Update<State> {
    action: Action<State>; // this.setState接收的第一个参数，或者useState的Dispatch方法的入参
}
export interface UpdateQueue<State> {
    // 为了wip和current同时可以拿到最新的 update，所以通过shared对象的形式传递指针
    shared: {
        pending: Update<State> | null;
    };
}

export const createUpdate = <State>(action: Action<State>): Update<State> => {
    return {
        action
    };
};

export const createUpdateQueue = <State>() => {
    return {
        shared: {
            pending: null
        }
    } as UpdateQueue<State>;
};

export const enqueueUpdate = <State>(
    updateQueue: UpdateQueue<State>,
    update: Update<State>
) => {
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
