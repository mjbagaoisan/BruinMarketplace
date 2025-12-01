"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft,
  Calendar,
  CreditCard,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";


export default function EditListingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
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
    created_at: "",
    media: [] as any[],
  });


  useEffect(() => {
    async function fetchListing() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/listings/${id}`,
          { credentials: "include" }
        );

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setError(errData.error || "Failed to load listing.");
          return;
        }

        const data = await res.json();
        setForm({
          title: data.title,
          price: data.price,
          description: data.description || "",
          condition: data.condition,
          category: data.category,
          location: data.location,
          preferred_payment: data.preferred_payment,
          created_at: data.created_at,
          media: data.media || [],
        });
      } catch (e) {
        setError("Unable to load listing.");
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchListing();
  }, [id]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveChanges = async (e: any) => {
    e.preventDefault();
    setSaving(true);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/listings/${id}`,
      {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }
    );

    setSaving(false);

    if (res.ok) router.push(`/listings/${id}`);
    else {
      const err = await res.json();
      alert(err.error || "Failed to update listing.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-xl font-bold">{error}</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 text-gray-600 hover:text-gray-900"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <main className="container mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">

            <div className="overflow-hidden rounded-xl border-none shadow-md bg-black/5">
              {form.media.length > 0 ? (
                <Carousel className="w-full">
                  <CarouselContent>
                    {form.media.map((m: any) => (
                      <CarouselItem
                        key={m.id}
                        className="flex items-center justify-center bg-black aspect-video"
                      >
                        <img
                          src={m.url}
                          alt="Listing image"
                          className="max-h-[500px] w-auto object-contain"
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>

                  {form.media.length > 1 && (
                    <>
                      <CarouselPrevious className="left-4" />
                      <CarouselNext className="right-4" />
                    </>
                  )}
                </Carousel>
              ) : (
                <div className="aspect-video bg-gray-200 flex text-gray-400 items-center justify-center">
                  No images
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border space-y-4">
              <h2 className="text-xl font-semibold">Description</h2>
              <textarea
                name="description"
                value={form.description ?? ""}
                onChange={handleChange}
                rows={6}
                className="w-full border rounded p-3"
              />
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gray-500" />
                Location
              </h2>
              <select
                name="location"
                value={form.location}
                onChange={handleChange}
                className="border p-2 rounded w-full"
              >
                <option value="hill">Hill</option>
                <option value="on campus">On Campus</option>
                <option value="off campus">Off Campus</option>
              </select>
            </div>
          </div>

          <div className="space-y-6">

            <div className="bg-white rounded-xl p-6 shadow-sm border space-y-6">

              <div>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full text-2xl font-bold border-b pb-1"
                />

                <div className="flex items-center justify-between mt-3">
                  <input 
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={handleChange}
                    className="text-3xl font-bold w-28 border rounded px-2"
                  />

                  <select
                    name="condition"
                    value={form.condition}
                    onChange={handleChange}
                    className="border rounded p-2 capitalize"
                  >
                    <option value="new">New</option>
                    <option value="like_new">Like New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4 text-sm text-gray-600">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>Posted on {new Date(form.created_at).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-gray-400" />
                  <select
                    name="preferred_payment"
                    value={form.preferred_payment ?? ""}
                    onChange={handleChange}
                    className="border rounded p-2 capitalize"
                  >
                    <option value="cash">Cash</option>
                    <option value="zelle">Zelle</option>
                    <option value="venmo">Venmo</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold border border-gray-400 rounded px-1">
                    C
                  </span>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="border p-2 rounded capitalize"
                  >
                    <option value="textbooks">Textbooks</option>
                    <option value="electronics">Electronics</option>
                    <option value="furniture">Furniture</option>
                    <option value="parking">Parking</option>
                    <option value="clothing">Clothing</option>
                    <option value="tickets">Tickets</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <Button 
                onClick={saveChanges}
                disabled={saving}
                className="w-full py-6 text-base"
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
