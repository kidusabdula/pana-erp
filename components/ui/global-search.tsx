"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search, Package, Users, FileText, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  title: string;
  type: "item" | "customer" | "invoice" | "quote";
  url: string;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async (query: string) => {
    if (!query) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement actual search API
      // For now, using mock data
      const mockResults: SearchResult[] = [
        {
          id: "1",
          title: "Business Card Premium",
          type: "item",
          url: "/stock/item/BC-PREMIUM",
        },
        {
          id: "2",
          title: "John Doe",
          type: "customer",
          url: "/crm/customers/JOHN-DOE",
        },
        {
          id: "3",
          title: "INV-2024-001",
          type: "invoice",
          url: "/accounting/sales/INV-2024-001",
        },
      ].filter(result => 
        result.title.toLowerCase().includes(query.toLowerCase())
      );

      setResults(mockResults);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "item":
        return <Package className="h-4 w-4" />;
      case "customer":
        return <Users className="h-4 w-4" />;
      case "invoice":
        return <FileText className="h-4 w-4" />;
      case "quote":
        return <Calculator className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const handleSelect = (result: SearchResult) => {
    router.push(result.url);
    setOpen(false);
    setSearchQuery("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="relative h-9 w-64 p-0 justify-start">
          <Search className="h-4 w-4 mx-3" />
          <span className="text-sm text-muted-foreground">
            Search everything...
          </span>
          <kbd className="pointer-events-none absolute right-2 top-2.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search items, customers, invoices..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            onValueChange={(value) => {
              setSearchQuery(value);
              handleSearch(value);
            }}
          />
          <CommandList>
            {loading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            ) : results.length === 0 ? (
              <CommandEmpty>No results found.</CommandEmpty>
            ) : (
              <CommandGroup heading="Results">
                {results.map((result) => (
                  <CommandItem
                    key={result.id}
                    onSelect={() => handleSelect(result)}
                    className="flex items-center gap-2"
                  >
                    {getIcon(result.type)}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{result.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {result.type}
                      </p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}