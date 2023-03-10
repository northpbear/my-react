import { FiberNode } from 'react-reconciler/src/fiber';
import { HostText } from 'react-reconciler/src/workTags';

export type Container = Element;
export type Instance = Element;
export type TextInstance = Text;

// 模拟宿主环境生成对应的元素
export const createInstance = (type: string, props: any): Instance => {
    const element = document.createElement(type);
    // TODO 处理props
    return element;
};

export const appendInitialChild = (
    parent: Instance | Container,
    child: Instance
) => {
    parent.appendChild(child);
};

export const createTextInstance = (content: string) => {
    return document.createTextNode(content) as any as Instance;
};
export const appendChildToContainer = appendInitialChild;

export const commitUpdate = (fiber: FiberNode) => {
    switch (fiber.tag) {
        case HostText:
            const text = fiber.memoizedProps.content;
            return commitTextUpdate(fiber.stateNode, text);
        default:
            if (__DEV__) {
                console.warn('未实现的Update类型');
            }
            break;
    }
};

export function commitTextUpdate(textInstance: TextInstance, content: string) {
    textInstance.textContent = content;
}

export function removeChild(
    child: Instance | TextInstance,
    container: Container
) {
    container.removeChild(child);
}
