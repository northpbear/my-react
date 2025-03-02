import { createRoot as createRootImpl } from "./ReactDOMRoot";

export function createRoot(
  container: Element | Document | DocumentFragment,
  options?: any,
) {
  return createRootImpl(container, options);
}
