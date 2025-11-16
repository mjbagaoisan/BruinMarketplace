import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import Image from "next/image";

export interface ListingData {
  title: string;
  price: string;
  description: string;
  imgUrls: string[];
}

export default function ListingCard(props: ListingData) {
  return (
    <Card className="w-full max-w-sm">
        <div className="relative h-75 w-7/8 mx-auto rounded-lg overflow-hidden">
            <Image
            src={ props.imgUrls[0] }
            alt="Bruin Logo"
            fill
            style={{ objectFit: "cover" }} 
            />
        </div>
      <CardHeader>
        <CardTitle>{ props.title }</CardTitle>
        <Label><b>${ props.price }</b></Label>
      </CardHeader>
    </Card>
  )
}
