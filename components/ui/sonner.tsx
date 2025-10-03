"use client"

import type { CSSProperties } from "react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()
  const surfaceStyles = {
    "--normal-bg": "var(--card)",
    "--normal-text": "var(--foreground)",
    "--normal-border": "var(--border)",
    "--success-bg": "var(--primary)",
    "--success-text": "var(--primary-foreground)",
    "--error-bg": "var(--destructive)",
    "--error-text": "var(--destructive-foreground)",
  } as CSSProperties

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-right"
      offset={24}
      richColors
      duration={4500}
      closeButton
      className="toaster pointer-events-none"
      toastOptions={{
        classNames: {
          toast:
            "pointer-events-auto flex w-full min-w-[18rem] max-w-[22rem] items-start gap-3 rounded-[calc(var(--radius)-2px)] border border-border/60 bg-card/95 px-4 py-3 font-sans text-sm text-foreground shadow-[0_18px_40px_-20px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:bg-background/95",
          title: "text-sm font-semibold text-foreground",
          description: "text-sm leading-relaxed text-muted-foreground",
          actionButton:
            "rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90",
          cancelButton:
            "rounded-md border border-border/60 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/60",
          closeButton:
            "rounded-md border border-transparent p-1.5 text-muted-foreground transition-colors hover:border-border/70 hover:bg-muted/50 hover:text-foreground",
        },
      }}
      style={surfaceStyles}
      {...props}
    />
  )
}

export { Toaster }
