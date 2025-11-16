"use client";

import { useState } from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"

import { Input } from "@/components/ui/input"

import { Switch } from "@/components/ui/switch"

import { Textarea } from "@/components/ui/textarea"

import { Button } from "@/components/ui/button"

import ListingCard, { ListingData } from '@/components/ListingCard'

import { PlusIcon } from "lucide-react"

interface CreateListingProps {
    onListingSubmit: (newListing: ListingData) => void
}

export default function CreateListing(props: CreateListingProps){

    const [open, setOpen] = useState(false);

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        
        const formData = new FormData(e.currentTarget);

        // Using .get(name) to get fields of formData
        // names are specified in HTML <Input name="..."
        const newListingData: ListingData = {
            title: formData.get("title") as string,
            price: formData.get("price") as string,
            description: formData.get("description") as string,
            imgUrls: [URL.createObjectURL(formData.get("images") as File)]
        };

        props.onListingSubmit(newListingData);

        setOpen(false);
    }

    return(
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div className="flex flex-col gap-8">
                <Button variant="outline" size="icon-lg" className="rounded-full h-14 w-14">
                    <PlusIcon />
                </Button>
                </div>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a Listing</DialogTitle>
                    <DialogDescription></DialogDescription> {/* suppress warning */}

                    <form onSubmit={handleSubmit}>
                        <FieldGroup></FieldGroup> {/* for spacing */}
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="title">Title</FieldLabel>
                                <Input name="title" placeholder="e.g. Nike Blazer Highs" required/>
                            </Field>

                            <Field className="w-20">
                            <FieldLabel htmlFor="price">Price</FieldLabel>
                            <Field orientation="responsive">
                                <FieldLabel htmlFor="price">$</FieldLabel>
                                <Input name="price" required/>
                            </Field>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="upload-media">Upload media</FieldLabel>
                                <Input name="images" type="file" required/>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="description">Description</FieldLabel>
                                <Textarea name="description" placeholder="Describe your listing" className="resize-none"/>
                            </Field>

                        <Field orientation="horizontal">
                            <Button type="submit">Post</Button>
                            <DialogClose asChild>
                                <Button variant="outline" type="button">Cancel</Button>
                            </DialogClose>
                        </Field>
                        </FieldGroup>
                    </form>
                    
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}