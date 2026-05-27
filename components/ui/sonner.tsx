"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      gap={8}
      icons={{
        success: <CircleCheckIcon className="size-4 text-[#005FFE]" />,
        info: <InfoIcon className="size-4 text-[#005FFE]" />,
        warning: <TriangleAlertIcon className="size-4 text-[#FF5C00]" />,
        error: <OctagonXIcon className="size-4 text-red-500" />,
        loading: <Loader2Icon className="size-4 text-[#005FFE] animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group-[.toaster]:!bg-card group-[.toaster]:!text-card-foreground group-[.toaster]:!border group-[.toaster]:!border-border group-[.toaster]:!shadow-md group-[.toaster]:!shadow-black/5 group-[.toaster]:!rounded-2xl group-[.toaster]:!px-4 group-[.toaster]:!py-3 group-[.toaster]:!font-sans group-[.toaster]:!text-sm group-[.toaster]:!backdrop-blur-sm",
          title: "group-[.toaster]:!font-semibold group-[.toaster]:!text-foreground group-[.toaster]:!text-sm",
          description: "group-[.toaster]:!text-muted-foreground group-[.toaster]:!text-xs",
          actionButton:
            "group-[.toaster]:!bg-[#005FFE] group-[.toaster]:!text-white group-[.toaster]:!rounded-xl group-[.toaster]:!text-xs group-[.toaster]:!font-medium group-[.toaster]:!px-3 group-[.toaster]:!py-1.5",
          cancelButton:
            "group-[.toaster]:!bg-muted group-[.toaster]:!text-muted-foreground group-[.toaster]:!rounded-xl group-[.toaster]:!text-xs",
          success:
            "group-[.toaster]:!border-[#005FFE]/15 group-[.toaster]:!bg-[#005FFE]/[0.03]",
          error:
            "group-[.toaster]:!border-red-500/15 group-[.toaster]:!bg-red-500/[0.03]",
          warning:
            "group-[.toaster]:!border-[#FF5C00]/15 group-[.toaster]:!bg-[#FF5C00]/[0.03]",
          info:
            "group-[.toaster]:!border-[#005FFE]/15 group-[.toaster]:!bg-[#005FFE]/[0.03]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
