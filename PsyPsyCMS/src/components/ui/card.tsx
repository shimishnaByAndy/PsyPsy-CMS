import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
))
CardFooter.displayName = "CardFooter"

// Healthcare-specific card variants
const HealthcareCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'patient' | 'appointment' | 'professional' | 'alert' | 'stat'
    priority?: 'low' | 'medium' | 'high'
  }
>(({ className, variant = 'default', priority, ...props }, ref) => {
  const variantClasses = {
    patient: "border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20",
    appointment: "border-l-4 border-l-green-500 bg-green-50/50 dark:bg-green-950/20",
    professional: "border-l-4 border-l-purple-500 bg-purple-50/50 dark:bg-purple-950/20",
    alert: "border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-950/20",
    stat: "border-l-4 border-l-psypsy-primary bg-green-50/30 dark:bg-green-950/10",
  }

  const priorityClasses = {
    low: "shadow-sm",
    medium: "shadow-md",
    high: "shadow-lg ring-1 ring-orange-200 dark:ring-orange-800",
  }

  return (
    <Card
      ref={ref}
      className={cn(
        "healthcare-card transition-all duration-200 hover:shadow-md",
        variant !== 'default' && variantClasses[variant],
        priority && priorityClasses[priority],
        className
      )}
      {...props}
    />
  )
})
HealthcareCard.displayName = "HealthcareCard"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, HealthcareCard }