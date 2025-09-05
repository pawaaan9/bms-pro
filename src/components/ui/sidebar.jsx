import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";
import { PanelLeft } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const _COOKIE_NAME = "_state"
const _COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const _WIDTH = "16rem"
const _WIDTH_MOBILE = "18rem"
const _WIDTH_ICON = "3rem"
const _KEYBOARD_SHORTCUT = "b"

const Context = React.createContext(null)

function use() {
  const context = React.useContext(Context)
  if (!context) {
    throw new Error("use must be used within a Provider.")
  }

  return context
}

const Provider = React.forwardRef((
  {
    defaultOpen = true,
    open: openProp,
    onOpenChange: setOpenProp,
    className,
    style,
    children,
    ...props
  },
  ref
) => {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = React.useState(false)

  // This is the internal state of the .
  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = React.useState(defaultOpen)
  const open = openProp ?? _open
  const setOpen = React.useCallback((value) => {
    const openState = typeof value === "function" ? value(open) : value
    if (setOpenProp) {
      setOpenProp(openState)
    } else {
      _setOpen(openState)
    }

    // This sets the cookie to keep the  state.
    document.cookie = `${_COOKIE_NAME}=${openState}; path=/; max-age=${_COOKIE_MAX_AGE}`
  }, [setOpenProp, open])

  // Helper to toggle the .
  const toggle = React.useCallback(() => {
    return isMobile
      ? setOpenMobile((open) => !open)
      : setOpen((open) => !open);
  }, [isMobile, setOpen, setOpenMobile])

  // Adds a keyboard shortcut to toggle the .
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        event.key === _KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault()
        toggle()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggle])

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the  with Tailwind classes.
  const state = open ? "expanded" : "collapsed"

  const contextValue = React.useMemo(() => ({
    state,
    open,
    setOpen,
    isMobile,
    openMobile,
    setOpenMobile,
    toggle,
  }), [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggle])

  return (
    (<Context.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          style={
            {
              "---width": _WIDTH,
              "---width-icon": _WIDTH_ICON,
              ...style
            }
          }
          className={cn(
            "group/-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-",
            className
          )}
          ref={ref}
          {...props}>
          {children}
        </div>
      </TooltipProvider>
    </Context.Provider>)
  );
})
Provider.displayName = "Provider"

const  = React.forwardRef((
  {
    side = "left",
    variant = "",
    collapsible = "offcanvas",
    className,
    children,
    ...props
  },
  ref
) => {
  const { isMobile, state, openMobile, setOpenMobile } = use()

  if (collapsible === "none") {
    return (
      (<div
        className={cn(
          "flex h-full w-[---width] flex-col bg- text--foreground",
          className
        )}
        ref={ref}
        {...props}>
        {children}
      </div>)
    );
  }

  if (isMobile) {
    return (
      (<Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          data-=""
          data-mobile="true"
          className="w-[---width] bg- p-0 text--foreground [&>button]:hidden"
          style={
            {
              "---width": _WIDTH_MOBILE
            }
          }
          side={side}>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>)
    );
  }

  return (
    (<div
      ref={ref}
      className="group peer hidden text--foreground md:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}>
      {/* This is what handles the  gap on desktop */}
      <div
        className={cn(
          "relative h-svh w-[---width] bg-transparent transition-[width] duration-200 ease-linear",
          "group-data-[collapsible=offcanvas]:w-0",
          "group-data-[side=right]:rotate-180",
          variant === "floating" || variant === "inset"
            ? "group-data-[collapsible=icon]:w-[calc(var(---width-icon)_+_theme(spacing.4))]"
            : "group-data-[collapsible=icon]:w-[---width-icon]"
        )} />
      <div
        className={cn(
          "fixed inset-y-0 z-10 hidden h-svh w-[---width] transition-[left,right,width] duration-200 ease-linear md:flex",
          side === "left"
            ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(---width)*-1)]"
            : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(---width)*-1)]",
          // Adjust the padding for floating and inset variants.
          variant === "floating" || variant === "inset"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(---width-icon)_+_theme(spacing.4)_+2px)]"
            : "group-data-[collapsible=icon]:w-[---width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l",
          className
        )}
        {...props}>
        <div
          data-=""
          className="flex h-full w-full flex-col bg- group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border--border group-data-[variant=floating]:shadow">
          {children}
        </div>
      </div>
    </div>)
  );
})
.displayName = ""

const Trigger = React.forwardRef(({ className, onClick, ...props }, ref) => {
  const { toggle } = use()

  return (
    (<Button
      ref={ref}
      data-="trigger"
      variant="ghost"
      size="icon"
      className={cn("h-7 w-7", className)}
      onClick={(event) => {
        onClick?.(event)
        toggle()
      }}
      {...props}>
      <PanelLeft />
      <span className="sr-only">Toggle </span>
    </Button>)
  );
})
Trigger.displayName = "Trigger"

const Rail = React.forwardRef(({ className, ...props }, ref) => {
  const { toggle } = use()

  return (
    (<button
      ref={ref}
      data-="rail"
      aria-label="Toggle "
      tabIndex={-1}
      onClick={toggle}
      title="Toggle "
      className={cn(
        "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg--border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex",
        "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className
      )}
      {...props} />)
  );
})
Rail.displayName = "Rail"

const Inset = React.forwardRef(({ className, ...props }, ref) => {
  return (
    (<main
      ref={ref}
      className={cn(
        "relative flex min-h-svh flex-1 flex-col bg-background",
        "peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow",
        className
      )}
      {...props} />)
  );
})
Inset.displayName = "Inset"

const Input = React.forwardRef(({ className, ...props }, ref) => {
  return (
    (<Input
      ref={ref}
      data-="input"
      className={cn(
        "h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring--ring",
        className
      )}
      {...props} />)
  );
})
Input.displayName = "Input"

const Header = React.forwardRef(({ className, ...props }, ref) => {
  return (
    (<div
      ref={ref}
      data-="header"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props} />)
  );
})
Header.displayName = "Header"

const Footer = React.forwardRef(({ className, ...props }, ref) => {
  return (
    (<div
      ref={ref}
      data-="footer"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props} />)
  );
})
Footer.displayName = "Footer"

const Separator = React.forwardRef(({ className, ...props }, ref) => {
  return (
    (<Separator
      ref={ref}
      data-="separator"
      className={cn("mx-2 w-auto bg--border", className)}
      {...props} />)
  );
})
Separator.displayName = "Separator"

const Content = React.forwardRef(({ className, ...props }, ref) => {
  return (
    (<div
      ref={ref}
      data-="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className
      )}
      {...props} />)
  );
})
Content.displayName = "Content"

const Group = React.forwardRef(({ className, ...props }, ref) => {
  return (
    (<div
      ref={ref}
      data-="group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      {...props} />)
  );
})
Group.displayName = "Group"

const GroupLabel = React.forwardRef(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "div"

  return (
    (<Comp
      ref={ref}
      data-="group-label"
      className={cn(
        "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text--foreground/70 outline-none ring--ring transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className
      )}
      {...props} />)
  );
})
GroupLabel.displayName = "GroupLabel"

const GroupAction = React.forwardRef(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"

  return (
    (<Comp
      ref={ref}
      data-="group-action"
      className={cn(
        "absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text--foreground outline-none ring--ring transition-transform hover:bg--accent hover:text--accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 after:md:hidden",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props} />)
  );
})
GroupAction.displayName = "GroupAction"

const GroupContent = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-="group-content"
    className={cn("w-full text-sm", className)}
    {...props} />
))
GroupContent.displayName = "GroupContent"

const Menu = React.forwardRef(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-="menu"
    className={cn("flex w-full min-w-0 flex-col gap-1", className)}
    {...props} />
))
Menu.displayName = "Menu"

const MenuItem = React.forwardRef(({ className, ...props }, ref) => (
  <li
    ref={ref}
    data-="menu-item"
    className={cn("group/menu-item relative", className)}
    {...props} />
))
MenuItem.displayName = "MenuItem"

const MenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring--ring transition-[width,height,padding] hover:bg--accent hover:text--accent-foreground focus-visible:ring-2 active:bg--accent active:text--accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg--accent data-[active=true]:font-medium data-[active=true]:text--accent-foreground data-[state=open]:hover:bg--accent data-[state=open]:hover:text--accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg--accent hover:text--accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(---border))] hover:bg--accent hover:text--accent-foreground hover:shadow-[0_0_0_1px_hsl(var(---accent))]",
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:!p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const MenuButton = React.forwardRef((
  {
    asChild = false,
    isActive = false,
    variant = "default",
    size = "default",
    tooltip,
    className,
    ...props
  },
  ref
) => {
  const Comp = asChild ? Slot : "button"
  const { isMobile, state } = use()

  const button = (
    <Comp
      ref={ref}
      data-="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(MenuButtonVariants({ variant, size }), className)}
      {...props} />
  )

  if (!tooltip) {
    return button
  }

  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip,
    }
  }

  return (
    (<Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        hidden={state !== "collapsed" || isMobile}
        {...tooltip} />
    </Tooltip>)
  );
})
MenuButton.displayName = "MenuButton"

const MenuAction = React.forwardRef(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"

  return (
    (<Comp
      ref={ref}
      data-="menu-action"
      className={cn(
        "absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text--foreground outline-none ring--ring transition-transform hover:bg--accent hover:text--accent-foreground focus-visible:ring-2 peer-hover/menu-button:text--accent-foreground [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 after:md:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        showOnHover &&
          "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text--accent-foreground md:opacity-0",
        className
      )}
      {...props} />)
  );
})
MenuAction.displayName = "MenuAction"

const MenuBadge = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-="menu-badge"
    className={cn(
      "pointer-events-none absolute right-1 flex h-5 min-w-5 select-none items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text--foreground",
      "peer-hover/menu-button:text--accent-foreground peer-data-[active=true]/menu-button:text--accent-foreground",
      "peer-data-[size=sm]/menu-button:top-1",
      "peer-data-[size=default]/menu-button:top-1.5",
      "peer-data-[size=lg]/menu-button:top-2.5",
      "group-data-[collapsible=icon]:hidden",
      className
    )}
    {...props} />
))
MenuBadge.displayName = "MenuBadge"

const MenuSkeleton = React.forwardRef(({ className, showIcon = false, ...props }, ref) => {
  // Random width between 50 to 90%.
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`;
  }, [])

  return (
    (<div
      ref={ref}
      data-="menu-skeleton"
      className={cn("flex h-8 items-center gap-2 rounded-md px-2", className)}
      {...props}>
      {showIcon && (
        <Skeleton className="size-4 rounded-md" data-="menu-skeleton-icon" />
      )}
      <Skeleton
        className="h-4 max-w-[--skeleton-width] flex-1"
        data-="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width
          }
        } />
    </div>)
  );
})
MenuSkeleton.displayName = "MenuSkeleton"

const MenuSub = React.forwardRef(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-="menu-sub"
    className={cn(
      "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border--border px-2.5 py-0.5",
      "group-data-[collapsible=icon]:hidden",
      className
    )}
    {...props} />
))
MenuSub.displayName = "MenuSub"

const MenuSubItem = React.forwardRef(({ ...props }, ref) => <li ref={ref} {...props} />)
MenuSubItem.displayName = "MenuSubItem"

const MenuSubButton = React.forwardRef(
  ({ asChild = false, size = "md", isActive, className, ...props }, ref) => {
    const Comp = asChild ? Slot : "a"

    return (
      (<Comp
        ref={ref}
        data-="menu-sub-button"
        data-size={size}
        data-active={isActive}
        className={cn(
          "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text--foreground outline-none ring--ring hover:bg--accent hover:text--accent-foreground focus-visible:ring-2 active:bg--accent active:text--accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text--accent-foreground",
          "data-[active=true]:bg--accent data-[active=true]:text--accent-foreground",
          size === "sm" && "text-xs",
          size === "md" && "text-sm",
          "group-data-[collapsible=icon]:hidden",
          className
        )}
        {...props} />)
    );
  }
)
MenuSubButton.displayName = "MenuSubButton"

export {
  Content,
  Footer,
  Group,
  GroupAction,
  GroupContent,
  GroupLabel,
  Header,
  Input,
  Inset,
  Menu,
  MenuAction,
  MenuBadge,
  MenuButton,
  MenuItem,
  MenuSkeleton,
  MenuSub,
  MenuSubButton,
  MenuSubItem,
  Provider,
  Rail,
  Separator,
  Trigger,
  use,
}
