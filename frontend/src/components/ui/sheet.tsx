"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;

const SheetPortal = ({ ...props }: DialogPrimitive.DialogPortalProps) => <DialogPrimitive.Portal {...props} />;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-surface-overlay backdrop-blur-sm", className)}
    {...props}
  />
));
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-2xl flex-col overflow-y-auto border-l border-border-subtle bg-white shadow-elevated",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="sr-only">Close</DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = DialogPrimitive.Content.displayName;

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("sticky top-0 z-10 border-b border-border-subtle bg-white/95 px-6 py-5 backdrop-blur", className)} {...props} />
);

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn("text-2xl font-semibold text-ink-900", className)} {...props} />
));
SheetTitle.displayName = DialogPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn("text-sm text-ink-700", className)} {...props} />
));
SheetDescription.displayName = DialogPrimitive.Description.displayName;

const SheetDismissButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <SheetClose asChild>
      <button
        ref={ref}
        className={cn("rounded-card border border-border-soft p-2 text-ink-700 transition hover:bg-slate-50", className)}
        {...props}
      >
        <X className="h-4 w-4" />
      </button>
    </SheetClose>
  )
);
SheetDismissButton.displayName = "SheetDismissButton";

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetDismissButton,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
};
