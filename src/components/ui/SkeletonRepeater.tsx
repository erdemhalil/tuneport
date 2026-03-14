import { Fragment, type ReactNode } from "react";

interface SkeletonRepeaterProps {
  count: number;
  children: (index: number) => ReactNode;
}

export function SkeletonRepeater({ count, children }: SkeletonRepeaterProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Fragment key={index}>{children(index)}</Fragment>
      ))}
    </>
  );
}
