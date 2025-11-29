"use client";

import React, { useEffect } from "react";
import { useState, useRef } from "react";
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

import { Input } from "@/components/ui/input"

import { Switch } from "@/components/ui/switch"

import { Textarea } from "@/components/ui/textarea"

import { Button } from "@/components/ui/button"

import ListingCard, { ListingData } from '@/components/ListingCard'

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

import { File, X } from 'lucide-react';

interface CreateListingProps {
    children: React.ReactNode;
}

export default function CreateListing(props: CreateListingProps){

    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const [filesToUpload, setFilesToUpload] = useState<File[]>([]);

    const [filesForPreview, setFilesForPreview] = useState<any[]>([]);
    
    const handleFileDrop = (acceptedFiles: File[]) => {
      setFilesToUpload(prevFiles => [...prevFiles, ...acceptedFiles].slice(0, 5));
      const newFilesForPreview = acceptedFiles.map(file => {
        return Object.assign(file, {
          preview: URL.createObjectURL(file),
          errors: [], 
        });
      });

      setFilesForPreview(prev => [...prev, ...newFilesForPreview].slice(0, 5));
    }

    const handleFileRemove = (fileToRemove: any) => {
      URL.revokeObjectURL(fileToRemove.preview);
      setFilesToUpload(prev => prev.filter(f => f.name !== fileToRemove.name));
      setFilesForPreview(prev => prev.filter(f => f.name !== fileToRemove.name));
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop: handleFileDrop, // Use your existing handler
      accept: { 'image/*': [], 'video/*': [] },
      maxFiles: 5,
    });

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const form = e.currentTarget;
        
        const formData = new FormData(e.currentTarget);

        for (const file of filesToUpload) {
          formData.append('mediaFiles', file); 
        }

        formData.append('status', 'active');

        setSubmitting(true);
        setSubmitError(null);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/listings`, {
              method: 'POST',
              credentials: 'include',
              body: formData, 
            });

            if (!response.ok) {
              const err = await response.json();
              throw new Error(err.error || 'Failed to create listing');
            }

            form.reset();
            setFilesToUpload([]);
            setFilesForPreview([]);
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

    // reset pending uploads on close for when they reopen
    useEffect(() => {
        if (open == false) {
            setFilesToUpload([]);
            setFilesForPreview([]);
            setSubmitError(null);
        }
    }, [open])
 

    return(
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {props.children}
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

                        <Field orientation="horizontal">
                            <Field className="w-35">
                            <FieldLabel>Price</FieldLabel>
                            <Field orientation="horizontal">
                                <FieldLabel>$</FieldLabel>
                                <Input name="price" required/>
                            </Field>
                            </Field>

                            <Field className="pl-10 w-full">
                            <FieldLabel>Preferred Payment</FieldLabel>
                            <Select defaultValue="" name="preferred_payment">
                                <SelectTrigger>
                                <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="zelle">Zelle</SelectItem>
                                    <SelectItem value="cash">Cash</SelectItem>
                                    <SelectItem value="venmo">Venmo</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            </Field>
                        </Field>

                        <Field>
                            <FieldLabel>Media</FieldLabel>

                            <div 
                            {...getRootProps()} 
                            className={`mt-1 flex flex-col items-center rounded-md border-2 border-dashed border-gray-300 px-6 pb-5 pt-5 ${isDragActive ? 'border-blue-500 bg-blue-50' : ''}`}
                            >
                            <input {...getInputProps()} />
                            
                            <div className="text-center pt-2 pb-5">
                                <p>Drag 5 drop files here, or click to select</p>
                                <p className="text-xs text-gray-500">Up to 5 files, 10MB each</p>
                            </div>

                            {filesForPreview.length > 0 && (
                                <ul className="space-y-2 w-full">
                                {filesForPreview.map((file: any) => (
                                    <li key={file.name} className="flex items-center gap-x-4 rounded-md border border-gray-200 p-2 w-full">

                                    {file.type.startsWith('image/') ? (
                                        <img 
                                            src={file.preview}
                                            alt={file.name}
                                            className="h-10 w-10 shrink-0 rounde border object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border bg-gray-100">
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-0"> 
                                        <span className="block truncate text-sm">{file.name}</span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation(); 
                                            handleFileRemove(file);
                                        }}
                                        className="shrink-0 text-sm font-medium text-grey pr-3"
                                    >
                                        <X size={18} />
                                    </button>
                                    </li>
                                ))}
                                </ul>
                            )}

                            </div>
                        </Field>

                        <Field>
                            <FieldLabel>
                                Category
                            </FieldLabel>
                            <Select defaultValue="" name="category">
                                <SelectTrigger>
                                <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="textbooks">Textbooks</SelectItem>
                                    <SelectItem value="electronics">Electronics</SelectItem>
                                    <SelectItem value="furniture">Furniture</SelectItem>
                                    <SelectItem value="parking">Parking</SelectItem>
                                    <SelectItem value="clothing">Clothing</SelectItem>
                                    <SelectItem value="tickets">Tickets</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field>
                            <FieldLabel>
                                Condition
                            </FieldLabel>
                            <Select defaultValue="" name="condition">
                                <SelectTrigger>
                                <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="new">New</SelectItem>
                                    <SelectItem value="like_new">Like-new</SelectItem>
                                    <SelectItem value="good">Good</SelectItem>
                                    <SelectItem value="fair">Fair</SelectItem>
                                    <SelectItem value="poor">Poor</SelectItem>
                                </SelectContent>
                            </Select>
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
                                    <SelectItem value="hill">The Hill</SelectItem>
                                    <SelectItem value="univ_apps">University Apartments</SelectItem>
                                    <SelectItem value="on_campus">On-Campus</SelectItem>
                                    <SelectItem value="off_campus">Off-Campus</SelectItem>
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