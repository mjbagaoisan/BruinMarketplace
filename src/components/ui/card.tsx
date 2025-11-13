import * as React from "react"

import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground w-[300px] h-[380px] flex flex-col rounded-xl border shadow-sm overflow-hidden",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("row-start-1 font-semibold text-lg", className)}
      {...props}
    />
  )
}


function CardMedia({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-media"
      className={cn(
        "relative w-full h-[200px] overflow-hidden bg-gray-100",
        className
      )}
      {...props}
    />
  )
}

function CardPrice({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-price"
      className={cn("row-start-2 font-semibold text-lg", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}



export {
  Card,
  CardAction,
  CardTitle,
  CardMedia,
  CardPrice,
}
