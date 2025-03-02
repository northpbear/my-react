import { ConcurrentRoot } from "@my-react/react-reconciler/src/ReactRootTags";
import { createContainer } from "@my-react/react-reconciler/src/ReactFiberReconciler";

export function createRoot(
  container: Element | Document | DocumentFragment,
  options?: any,
) {
  const root = createContainer(container, ConcurrentRoot);

  // TODO
}
