import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

const Container = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-screen-2xl px-3 lg:px-10 py-10 ",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default Container;
