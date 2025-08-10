"use client"

import * as React from "react"
import { Toaster as SonnerToaster } from "sonner"

type ToasterProps = React.ComponentProps<typeof SonnerToaster>

export function Toaster({ ...props }: ToasterProps) {
  return (
    <SonnerToaster
      richColors
      closeButton
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:border-border group-[.toaster]:bg-background group-[.toaster]:text-foreground",
          title: "text-foreground",
          description: "text-muted-foreground",
          actionButton: "text-primary",
          cancelButton: "text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { toast } from "sonner"


