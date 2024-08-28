import clsx from "clsx";
import { FC } from "react";
import Shimmer from "./Shimmer";

interface SkeletonBaseProps {
  type: string;
  className?: string;
}

const SkeletonBaseElement: FC<SkeletonBaseProps> = ({ type, className }) => {
  const baseClasses = `skeleton ${type}`;
  const combinedClasses = clsx(baseClasses, className);
  return (
    <div className={combinedClasses}>
      <Shimmer />
    </div>
  );
};

export default SkeletonBaseElement;
