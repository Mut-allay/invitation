import * as React from "react"
import { cn } from "@/lib/utils"

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

interface SelectTriggerProps {
  children: React.ReactNode
  className?: string
  placeholder?: string
}

interface SelectContentProps {
  children: React.ReactNode
  className?: string
}

interface SelectItemProps {
  value: string
  children: React.ReactNode
  className?: string
}

interface SelectValueProps {
  placeholder?: string
  children?: React.ReactNode
}

const SelectContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}>({
  isOpen: false,
  setIsOpen: () => {},
})

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ value, onValueChange, children }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false)

    return (
      <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen }}>
        <div ref={ref} className="relative">
          {children}
        </div>
      </SelectContext.Provider>
    )
  }
)
Select.displayName = "Select"

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ children, className }, ref) => {
    const { isOpen, setIsOpen } = React.useContext(SelectContext)

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {children}
        <svg
          className={cn(
            "h-4 w-4 opacity-50 transition-transform",
            isOpen && "rotate-180"
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ children, className }, ref) => {
    const { isOpen } = React.useContext(SelectContext)

    if (!isOpen) return null

    return (
      <div
        ref={ref}
        className={cn(
          "absolute top-full z-50 mt-1 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md",
          className
        )}
      >
        <div className="p-1">
          {children}
        </div>
      </div>
    )
  }
)
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ value, children, className }, ref) => {
    const { onValueChange, setIsOpen, value: selectedValue } = React.useContext(SelectContext)

    const handleClick = () => {
      if (onValueChange) {
        onValueChange(value)
        setIsOpen(false)
      }
    }

    const isSelected = selectedValue === value

    return (
      <div
        ref={ref}
        role="option"
        aria-selected={isSelected}
        onClick={handleClick}
        className={cn(
          "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground",
          isSelected && "bg-accent text-accent-foreground",
          className
        )}
      >
        {children}
      </div>
    )
  }
)
SelectItem.displayName = "SelectItem"

const SelectValue = React.forwardRef<HTMLSpanElement, SelectValueProps>(
  ({ placeholder, children }, ref) => {
    const { value } = React.useContext(SelectContext)

    return (
      <span ref={ref} className="line-clamp-1">
        {children || value || placeholder}
      </span>
    )
  }
)
SelectValue.displayName = "SelectValue"

export {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} 