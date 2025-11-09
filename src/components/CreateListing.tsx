import {
  Dialog,
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

export default function CreateListing(){
    return(
        <Dialog>
            <DialogTrigger>New Listing</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a Listing</DialogTitle>

                    <FieldGroup></FieldGroup>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="title">Title</FieldLabel>
                            <Input id="title" placeholder="e.g. Nike Blazer Highs" required/>
                        </Field>

                        <Field className="w-20">
                        <FieldLabel htmlFor="price">Price</FieldLabel>
                        <Field orientation="responsive">
                            <FieldLabel htmlFor="price">$</FieldLabel>
                            <Input id="price" required/>
                        </Field>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="upload-media">Upload media</FieldLabel>
                            <Input id="picture" type="file" required/>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="description">Description</FieldLabel>
                            <Textarea id="description" placeholder="Describe your listing" className="resize-none"/>
                        </Field>

                    <Field orientation="horizontal">
                        <Button type="submit">Submit</Button>
                        <Button variant="outline" type="button">Cancel</Button>
                    </Field>
                    </FieldGroup>
                    
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}