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

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { ScrollArea } from "@/components/ui/scroll-area"

import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/dropzone'
import { useSupabaseUpload } from '@/hooks/use-supabase-upload'

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

    const dropzoneProps = useSupabaseUpload({
        bucketName: 'test',
        path: 'test',
        allowedMimeTypes: ['image/*'],
        maxFiles: 5,
        maxFileSize: 1000 * 1000 * 10, // 10MB,
    })
 

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
                    <DialogDescription></DialogDescription> {/* required, suppresses warning */}
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <ScrollArea className="h-[60vh] w-full pr-4">
                    <FieldGroup></FieldGroup> {/* for spacing */}
                    <FieldGroup className="pl-1 pr-1 pb-1">
                        <Field>
                            <FieldLabel>Title</FieldLabel>
                            <Input name="title" placeholder="e.g. Nike Blazer Highs" required/>
                        </Field>

                        <Field className="w-20">
                        <FieldLabel>Price</FieldLabel>
                        <Field orientation="responsive">
                            <FieldLabel>$</FieldLabel>
                            <Input name="price" required/>
                        </Field>
                        </Field>

                        <Field>
                            <FieldLabel>Media</FieldLabel>
                            <Dropzone {...dropzoneProps}>
                                <DropzoneEmptyState />
                                <DropzoneContent />
                            </Dropzone>
                        </Field>

                        <Field>
                            <FieldLabel>
                                Location
                            </FieldLabel>
                            <Select defaultValue="">
                                <SelectTrigger>
                                <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="the-hill">The Hill</SelectItem>
                                    <SelectItem value="ua">University Apartments</SelectItem>
                                    <SelectItem value="off-campus">Off-Campus</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="description">Description</FieldLabel>
                            <Textarea name="description" placeholder="Describe your listing" className="resize-none"/>
                        </Field>
                    </FieldGroup>
                    </ScrollArea>

                    <FieldGroup className="mt-4">
                    <Field orientation="horizontal">
                        <Button type="submit">Post</Button>
                        <DialogClose asChild>
                            <Button variant="outline" type="button">Cancel</Button>
                        </DialogClose>
                    </Field>
                    </FieldGroup>
                </form>
                
            </DialogContent>
        </Dialog>
    )
}