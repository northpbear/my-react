import { Key, Props } from 'shared/reactTypes';
import { WorkTag } from './workTags';

export class FiberNode {
    tag: WorkTag;
    pendingProps: Props;
    key: Key;
    stateNode: any;
    type: any;

    return: FiberNode | null;
    sibling: FiberNode | null;
    child: FiberNode | null;
    index: number;

    memoizedProps: Props | null;
    
    constructor(tag: WorkTag, pendingProps: Props, key: Key) {
        // 节点类型
        this.tag = tag;
        this.key = key;

        // jsx对应的DOM
        this.stateNode = null;

        // 函数组件是函数本身，类组件是组件实例
        this.type = null;

        // 树状结构关系字段：
        // 指向父fiberNode节点
        this.return = null;
        // 兄弟节点
        this.sibling = null;
        // 第一个子节点
        this.child = null;
        // 是父节点的第几个子节点
        this.index = 0;

        // 工作单元相关字段：
        this.pendingProps = pendingProps;
        this.memoizedProps = null;
    }
}
