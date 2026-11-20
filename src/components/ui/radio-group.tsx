import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"

import { cn } from "@/lib/utils"

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root
    ref={ref}
    className={cn("grid gap-1", className)}
    {...props}
  />
))
RadioGroup.displayName = "RadioGroup"

type RadioGroupItemProps = React.ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Item
> & {
  /** Texto clicável ao lado. A linha tem 44px no celular. */
  label?: React.ReactNode
}

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ className, label, ...props }, ref) => {
  const bolinha = (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "peer aspect-square h-4 w-4 shrink-0 rounded-full border border-input bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive data-[state=checked]:border-primary",
        // Com rótulo, só a linha esmaece (has-[:disabled]); sem rótulo, o próprio controle.
        label && "disabled:opacity-100",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <span className="h-2 w-2 rounded-full bg-primary" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
  if (!label) return bolinha
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-2 text-body has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50 sm:min-h-6">
      {bolinha}
      {label}
    </label>
  )
})
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
