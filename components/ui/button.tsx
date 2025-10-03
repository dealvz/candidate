import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[calc(var(--radius)-2px)] font-sans text-sm font-semibold tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[state=open]:bg-muted/60",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:shadow-none dark:shadow-[0_0_0_1px_rgba(12,18,28,0.6)]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 focus-visible:ring-destructive/30 active:shadow-none dark:bg-destructive/70",
        outline:
          "border border-border/70 bg-card/70 text-foreground shadow-[0_2px_8px_-4px_rgba(15,23,42,0.25)] hover:bg-card/90 hover:text-foreground active:shadow-none dark:border-border/40 dark:bg-background/50 dark:hover:bg-background/70",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm shadow-black/10 hover:bg-secondary/80 active:shadow-none",
        ghost:
          "text-foreground hover:bg-muted/60 hover:text-foreground active:scale-[0.99]",
        link: "text-link underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 has-[>svg]:px-4",
        sm: "h-9 px-4 text-sm has-[>svg]:px-3",
        lg: "h-11 px-6 text-base has-[>svg]:px-5",
        icon: "size-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
