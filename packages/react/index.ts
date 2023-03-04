// React

import { Dispatcher, resolveDispather } from './src/currentDispatcher';
import { jsxDEV } from './src/jsx';
import currentDispatcher from './src/currentDispatcher';

export const useState: Dispatcher['useState'] = (initialState) => {
    const dispatcher = resolveDispather();
    return dispatcher.useState(initialState);
};

export const __SECRET_INTERNALS__ = {
    currentDispatcher
};

export default {
    version: '1.0.0',
    createElement: jsxDEV
};
