import { FC } from "react";

interface SkeletonBaseProps {
  type: string;
  className?: string;
}

declare const SkeletonBaseElement: FC<SkeletonBaseProps>;
export default SkeletonBaseElement;
