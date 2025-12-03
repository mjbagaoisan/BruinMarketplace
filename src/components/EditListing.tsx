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

interface EditListingProps {
  children?: React.ReactNode;   
  listingId: string;         
  initialData: any;     
}

export default function EditListing({ children, listingId, initialData }: EditListingProps){

    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
      title: "",
      price: "",
      description: "",
      condition: "",
      category: "",
      location: "",
      preferred_payment: "",
      media: [] as any[],
    });

    const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
    const [filesForPreview, setFilesForPreview] = useState<any[]>([]);
    const [existingMedia, setExistingMedia] = useState<any[]>([]);
    const [mediaToDelete, setMediaToDelete] = useState<number[]>([]);

    // get initial data
    useEffect(() => {
      if (open && initialData) {
        setForm({
          title: initialData.title,
          price: initialData.price,
          description: initialData.description || "",
          condition: initialData.condition,
          category: initialData.category,
          location: initialData.location,
          preferred_payment: initialData.preferred_payment ?? "",
          media: initialData.media || [],
        });
      }
      setExistingMedia(initialData.media || []);
    }, [open, initialData]);
    

    const handleChange = (e: any) => {
      setForm({ 
        ...form, 
        [e.target.name]: e.target.value 
      });
     };

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
    const handleExistingMediaRemove = (mediaId: number) => {
      setExistingMedia(prev => prev.filter(m => m.id !== mediaId));
      setMediaToDelete(prev => [...prev, mediaId]);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop: handleFileDrop, // Use your existing handler
      accept: { 'image/*': [], 'video/*': [] },
      maxFiles: 5,
    });


    const saveChanges = async (e: any) => {
      e.preventDefault();
      setSaving(true);
      
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        formData.append(key, val as any);
      });

      filesToUpload.forEach(file => {
        formData.append("mediaFiles", file);
      });

      formData.append("mediaToDelete", JSON.stringify(mediaToDelete));


      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/listings/${listingId}`, {
            method: "PUT",
            credentials: "include",
            body: formData
          }
        );

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "Failed to update listing");
        }

        setOpen(false);
        window.location.reload();
      } catch (err: any) {
        setError(err.message);
      } finally {
        setSaving(false);
      }
    };

     useEffect(() => {
      if (!open) {
        filesForPreview.forEach(f => URL.revokeObjectURL(f.preview));
        setFilesToUpload([]);
        setFilesForPreview([]);
        setError(null);
      }
    }, [open]);


    return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Listing</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <form onSubmit={saveChanges}>
          <ScrollArea className="h-[60vh] w-full pr-4">
            
            <FieldGroup>

              <Field>
                <FieldLabel>Title</FieldLabel>
                <Input name="title" value={form.title} onChange={handleChange} required />
              </Field>

              <Field className="flex gap-6">
                <Field className="w-36">
                  <FieldLabel>Price</FieldLabel>
                  <div className="flex items-center gap-2">
                    <span>$</span>
                    <Input name="price" value={form.price} onChange={handleChange} required />
                  </div>
                </Field>

                <Field className="flex-1">
                  <FieldLabel>Preferred Payment</FieldLabel>
                  <Select
                    defaultValue={form.preferred_payment}
                    onValueChange={(v) => setForm({ ...form, preferred_payment: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zelle">Zelle</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="venmo">Venmo</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </Field>

              {existingMedia.length > 0 && (
                <Field>
                  <FieldLabel>Current Media</FieldLabel>
                  <ul className="space-y-2">
                    {existingMedia.map(m => (
                      <li key={m.id} className="flex items-center gap-4 border p-2 rounded-md">
                        <img src={m.url} className="h-10 w-10 object-cover rounded border" />
                        <span className="flex-1 truncate">{m.url.split("/").pop()}</span>
                        <button
                          type="button"
                          onClick={() => handleExistingMediaRemove(m.id)}
                        >
                          <X size={18} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </Field>
              )}

              <Field>
                <FieldLabel>Upload New Media</FieldLabel>

                <div
                  {...getRootProps()}
                  className={`mt-1 flex flex-col items-center rounded-md border-2 border-dashed px-6 pb-5 pt-5 ${
                    isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
                  }`}
                >
                  <input {...getInputProps()} />

                  <div className="text-center pb-3">
                    <p>Drag or drop files here</p>
                    <p className="text-xs text-gray-500">Up to 5 files</p>
                  </div>

                  {filesForPreview.length > 0 && (
                    <ul className="space-y-2 w-full">
                      {filesForPreview.map(file => (
                        <li key={file.name} className="flex items-center gap-4 border p-2 rounded-md">
                          <img src={file.preview} className="h-10 w-10 object-cover rounded border" />
                          <span className="flex-1 truncate">{file.name}</span>
                          <button type="button" onClick={() => handleFileRemove(file)}>
                            <X size={18} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Field>

              <Field>
                <FieldLabel>Category</FieldLabel>
                <Select 
                  defaultValue={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
                <FieldLabel>Condition</FieldLabel>
                <Select 
                  defaultValue={form.condition}
                  onValueChange={(v) => setForm({ ...form, condition: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="like_new">Like New</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Location</FieldLabel>
                <Select 
                  defaultValue={form.location}
                  onValueChange={(v) => setForm({ ...form, location: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hill">The Hill</SelectItem>
                    <SelectItem value="univ_apps">University Apartments</SelectItem>
                    <SelectItem value="on_campus">On-Campus</SelectItem>
                    <SelectItem value="off_campus">Off-Campus</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Description</FieldLabel>
                <Textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="resize-none"
                />
              </Field>

            </FieldGroup>
          </ScrollArea>

          <FieldGroup className="mt-4">
            <div className="flex gap-4">
              <Button type="submit" disabled={saving} className="w-3/4">
                {saving ? "Saving..." : "Save Changes"}
              </Button>

              <DialogClose asChild>
                <Button variant="outline" className="w-1/4">Cancel</Button>
              </DialogClose>
            </div>

            {error && <FieldError>{error}</FieldError>}
          </FieldGroup>

        </form>
      </DialogContent>
    </Dialog>
  );

  }