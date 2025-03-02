import { FiberRoot } from "@my-react/react-reconciler/src/ReactInternalTypes";

export type Container =
  | (Element & { _reactRootContainer?: FiberRoot })
  | (Document & { _reactRootContainer?: FiberRoot })
  | (DocumentFragment & { _reactRootContainer?: FiberRoot });
