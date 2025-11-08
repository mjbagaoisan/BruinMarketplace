"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from "@/components/ui/input-group";

import { useDebounce } from "@uidotdev/usehooks";

type Props = {
  delay?: number;               // debounce delay (ms)
  api?: string;                 // your search endpoint (GET ?q=)
  onResults?: (rows: any[]) => void; // consume results outside
};

export default function DebouncedSearch({
  delay = 300,
  api = `${process.env.NEXT_PUBLIC_API_URL}/api/search`,
  onResults,
}: Props) {
  const [q, setQ] = React.useState("");
  const debouncedQ = useDebounce(q, delay);

  React.useEffect(() => {
    if (!debouncedQ.trim()) {
      onResults?.([]);
      return;
    }

    fetch(`${api}?q=${encodeURIComponent(debouncedQ)}`, {
      headers: { "cache-control": "no-store" },
    })
      .then((r) => r.json())
      .then((data) => onResults?.(data))
      .catch((e) => console.error("Search error:", e));
  }, [debouncedQ, api, onResults]);

  return (
    <div className="w-full max-w-lg">
      <form
        action={api}
        onSubmit={(e) => {
          e.preventDefault();
          setQ((v) => v.trim());
        }}
      >
        <label htmlFor="site-search" className="sr-only">
          Search
        </label>

        <InputGroup>
          <InputGroupAddon aria-hidden="true">
            <Search className="h-4 w-4" />
          </InputGroupAddon>

          <InputGroupInput
            id="site-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search for a listing…"
            autoComplete="off"
          />

          {q && (
            <InputGroupButton
              type="button"
              onClick={() => setQ("")}
              title="Clear"
              aria-label="Clear"
            >
              <X className="h-4 w-4" />
            </InputGroupButton>
          )}
        </InputGroup>

      </form>
    </div>
  );
}
