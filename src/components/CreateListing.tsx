"use client";

import React from "react";
import { useState } from "react";
import { createClient as createSupabaseBrowserClient } from "@/lib/client";

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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.NEXT_PUBLIC_API_URL ||
  "";

type CreateListingPayload = {
  title: string;
  price: string;
  description?: string;
  location?: string;
};

type CreateListingResponse = {
  id: string;
  title: string;
  price: number | string;
  [key: string]: unknown;
};

async function createListingApi(payload: CreateListingPayload): Promise<CreateListingResponse> {
  if (!API_BASE_URL) {
    throw new Error("API base URL is not configured");
  }

  const supabase = createSupabaseBrowserClient();
  const { data, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error("Failed to get auth session");
  }

  const accessToken = data.session?.access_token;

  if (!accessToken) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${API_BASE_URL}/api/listings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  let body: any = null;
  try {
    body = await response.json();
  } catch {
  }

  if (!response.ok) {
    const message = body?.error ?? "Failed to create listing";
    throw new Error(message);
  }

  return body as CreateListingResponse;
}

interface CreateListingProps {
    onListingSubmit: (newListing: ListingData) => void
}

export default function CreateListing(props: CreateListingProps){

    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        
        const formData = new FormData(e.currentTarget);

        const payload: CreateListingPayload = {
            title: formData.get("title") as string,
            price: formData.get("price") as string,
            description: (formData.get("description") as string) || undefined,
            location: (formData.get("location") as string) || undefined,
        };

        setSubmitting(true);
        setSubmitError(null);

        try {
            const created = await createListingApi(payload);

            const newListingData: ListingData = {
                title: (created.title as string) ?? payload.title,
                price: String(created.price ?? payload.price),
                description: payload.description ?? "",
                location: payload.location ?? "",
            };

            props.onListingSubmit(newListingData);
            e.currentTarget.reset();
            setOpen(false);
        } catch (error) {
            if (error instanceof Error) {
                setSubmitError(error.message);
            } else {
                setSubmitError("Failed to create listing");
            }
        } finally {
            setSubmitting(false);
        }
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
                            <Select defaultValue="" name="location">
                                <SelectTrigger>
                                <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="the-hill">The Hill</SelectItem>
                                    <SelectItem value="univ-apps">University Apartments</SelectItem>
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
                        <Button type="submit" disabled={submitting}>
                            {submitting ? "Posting..." : "Post"}
                        </Button>
                        <DialogClose asChild>
                            <Button variant="outline" type="button">Cancel</Button>
                        </DialogClose>
                    </Field>
                    {submitError && (
                        <FieldError>{submitError}</FieldError>
                    )}
                    </FieldGroup>
                </form>
                
            </DialogContent>
        </Dialog>
    )
}