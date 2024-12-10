import { cn } from "src/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("bg-gray-200 rounded animate-pulse", className)}
      {...props}
    />
  )
}

export { Skeleton }