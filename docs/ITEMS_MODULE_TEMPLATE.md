# Pana ERP v1.3 - Items Module Template Documentation

## Overview

The Items Module serves as the **production-ready template** for all future modules in Pana ERP. This document outlines the architectural patterns, reusable components, and best practices established in this module.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Directory Structure](#directory-structure)
3. [Reusable Components](#reusable-components)
4. [Data Layer Pattern](#data-layer-pattern)
5. [Type System](#type-system)
6. [UI Patterns](#ui-patterns)
7. [Implementation Checklist](#implementation-checklist)

---

## Architecture Overview

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **UI Framework** | Next.js 16 (App Router) | Server/Client Components, Routing |
| **State Management** | TanStack Query 5 | Server state, caching, mutations |
| **Forms** | React Hook Form 7 + Zod 3 | Form state, validation |
| **Styling** | Tailwind CSS 4 | Utility-first CSS |
| **Font** | Plus Jakarta Sans (next/font) | Premium typography |
| **Icons** | Lucide React | Consistent iconography |
| **Backend** | Frappe via Next.js API Routes | Data persistence |

### Data Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐     ┌──────────────┐
│  UI Component   │ ──▶ │ TanStack Query   │ ──▶ │ API Route       │ ──▶ │ Frappe SDK   │
│  (Client)       │ ◀── │ Hook             │ ◀── │ (/api/...)      │ ◀── │ (Backend)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘     └──────────────┘
```

---

## Directory Structure

```
app/stock/item/                    # Module Root
├── page.tsx                       # List View (index)
├── new/
│   └── page.tsx                   # Create Form
└── [name]/
    ├── page.tsx                   # Detail View
    └── edit/
        └── page.tsx               # Edit Form

hooks/data/
└── useItemsQuery.ts               # Data hooks (queries + mutations)

lib/schemas/
└── item.ts                        # Zod schemas + type utilities

types/
└── item.ts                        # TypeScript interfaces

components/ui/
├── page-header.tsx                # Floating header component
├── info-card.tsx                  # Card components
├── form-field.tsx                 # Form field components
└── list-toolbar.tsx               # Search/Filter/Export toolbar

app/api/stock/item/
├── route.ts                       # CRUD endpoints
├── [name]/
│   └── route.ts                   # Single item endpoints
└── options/
    └── route.ts                   # Dropdown options endpoint
```

---

## Reusable Components

### 1. PageHeader

Floating header with back navigation, title, status, and actions.

```tsx
import { PageHeader } from "@/components/ui/page-header";

<PageHeader
  backUrl="/stock/item"
  label="Editing"
  title={item.item_name}
  status={{ label: "Active", variant: "success" }}
  hasChanges={hasChanges}
  primaryAction={{
    label: "Save",
    icon: <Save className="h-4 w-4" />,
    onClick: handleSubmit,
    loading: isPending,
    disabled: !hasChanges,
  }}
>
  {/* Additional actions (dropdowns, etc.) */}
</PageHeader>
```

**Props:**
- `backUrl` / `onBack` - Navigation
- `label` - Small text above title
- `title` - Main heading
- `status` - Badge with variant (success/warning/destructive/default)
- `hasChanges` - Shows unsaved indicator
- `primaryAction` - Main action button config
- `children` - Additional elements (dropdown menus)

### 2. InfoCard

Card container with title, variants, and animation.

```tsx
import { InfoCard, DataPoint, StatCard } from "@/components/ui/info-card";

<InfoCard
  title={<><Package className="h-4 w-4" /> Core Data</>}
  variant="gradient"
  delay={100}
>
  <DataPoint label="Item Name" value={item.item_name} />
  <StatCard label="Stock" value="1,240" />
</InfoCard>
```

**Variants:**
- `default` - White card with shadow
- `gradient` - Gradient background
- `transparent` - No background/border

### 3. Form Field Components

```tsx
import { DataField, PremiumInput, ToggleCard } from "@/components/ui/form-field";

// Text input with label
<DataField label="Item Name" required error={errors.item_name?.message}>
  <PremiumInput {...register("item_name")} />
</DataField>

// Toggle card
<ToggleCard
  checked={isStockItem}
  onChange={setIsStockItem}
  title="Stock Item"
  description="Track inventory"
  variant="default" // or "destructive"
/>
```

### 4. ListToolbar

Search, filter, and export toolbar.

```tsx
import { ListToolbar } from "@/components/ui/list-toolbar";

<ListToolbar
  searchQuery={searchQuery}
  onSearchChange={setSearchQuery}
  searchPlaceholder="Search items..."
  onExport={handleExport}
  isExporting={isExporting}
  filters={[
    {
      key: "group",
      label: "Item Group",
      value: groupFilter,
      onChange: setGroupFilter,
      options: [
        { label: "All Groups", value: "all" },
        ...groups.map(g => ({ label: g, value: g })),
      ],
    },
  ]}
/>
```

---

## Data Layer Pattern

### Query Keys Convention

```typescript
// List queries
["items"]                      // All items
["items", { group: "Raw Materials" }]  // Filtered

// Single item queries
["item", "ITEM-001"]

// Options queries  
["itemOptions"]
```

### Hook Structure

```typescript
// hooks/data/useItemsQuery.ts

// 1. List query
export function useItemsQuery(filters?: ItemFilters) {
  return useQuery({
    queryKey: ["items", filters],
    queryFn: async () => fetch("/api/stock/item").then(r => r.json()),
    staleTime: 60 * 1000,
  });
}

// 2. Single item query
export function useItemQuery(name: string) {
  return useQuery({
    queryKey: ["item", name],
    queryFn: async () => fetch(`/api/stock/item/${name}`).then(r => r.json()),
    enabled: !!name,
  });
}

// 3. Options query (for dropdowns)
export function useItemOptionsQuery() {
  return useQuery({
    queryKey: ["itemOptions"],
    staleTime: 10 * 60 * 1000, // Cache longer
  });
}

// 4. Mutations with toast notifications
export function useCreateItemMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => fetch("/api/stock/item", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      toast.success("Item created");
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
    onError: (error) => toast.error(error.message),
  });
}
```

---

## Type System

### Frappe ↔ Form Type Conversion

Frappe uses `0/1` for booleans, but forms use `true/false`.

```typescript
// lib/schemas/item.ts

// 1. Zod schema for form validation
export const itemFormSchema = z.object({
  item_name: z.string().min(1, "Required"),
  item_code: z.string().min(1, "Required"),
  is_stock_item: z.boolean(),
  // ...
});

export type ItemFormData = z.infer<typeof itemFormSchema>;

// 2. Default values
export const defaultItemFormValues: ItemFormData = {
  item_name: "",
  item_code: "",
  is_stock_item: true,
  // ...
};

// 3. Conversion functions
export function formToFrappe(data: ItemFormData) {
  return {
    ...data,
    is_stock_item: data.is_stock_item ? 1 : 0,
  };
}

export function frappeToForm(item: Item): ItemFormData {
  return {
    ...item,
    is_stock_item: Boolean(item.is_stock_item),
  };
}
```

### Types vs Interfaces

```typescript
// types/item.ts

// Use interfaces for API responses (Frappe format)
export interface Item {
  name: string;
  item_code: string;
  is_stock_item: number; // 0 or 1
}

// Use Zod inference for form types
export type ItemFormData = z.infer<typeof itemFormSchema>;
```

---

## UI Patterns

### 1. Page Layout

```tsx
// Standard page structure
<div className="max-w-6xl mx-auto space-y-8 pb-20">
  <PageHeader ... />
  
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
    {/* Main content - 8 columns */}
    <div className="lg:col-span-8 space-y-8">
      <InfoCard>...</InfoCard>
    </div>
    
    {/* Sidebar - 4 columns */}
    <div className="lg:col-span-4 space-y-6">
      <div className="sticky top-20">
        <InfoCard>...</InfoCard>
      </div>
    </div>
  </div>
</div>
```

### 2. Animation Classes

```css
/* Built-in animations */
.animate-slide-up     /* Slide up with fade */
.animate-scale-in     /* Scale up */
.delay-100           /* Animation delay */

/* Usage with stagger */
{items.map((item, idx) => (
  <div 
    className="animate-slide-up"
    style={{ animationDelay: `${idx * 50}ms` }}
  />
))}
```

### 3. Premium Input Styling

```tsx
// Standard input classes
className="h-12 rounded-xl bg-secondary/30 hover:bg-secondary/50 focus:bg-white border-0 shadow-none"

// Select trigger
className="h-12 rounded-xl bg-secondary/30 hover:bg-secondary/50 focus:bg-white border-0"

// Select content
className="rounded-2xl shadow-xl bg-white/95 backdrop-blur-xl border-0"
```

### 4. Status Badges

```tsx
<div className={cn(
  "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border",
  isActive 
    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
    : "bg-destructive/10 text-destructive border-destructive/20"
)}>
  {isActive ? "Active" : "Inactive"}
</div>
```

---

## Implementation Checklist

When creating a new module, follow this checklist:

### 1. Types & Schema
- [ ] Create `types/{module}.ts` with interfaces
- [ ] Create `lib/schemas/{module}.ts` with Zod schema
- [ ] Add default form values
- [ ] Add `formToFrappe` and `frappeToForm` converters

### 2. Data Layer
- [ ] Create `hooks/data/use{Module}Query.ts`
- [ ] Implement list query hook
- [ ] Implement single item query hook
- [ ] Implement options query hook (if dropdowns needed)
- [ ] Implement create mutation with toast
- [ ] Implement update mutation with toast
- [ ] Implement delete mutation with toast

### 3. API Routes
- [ ] Create `app/api/{module}/route.ts` (GET list, POST create)
- [ ] Create `app/api/{module}/[id]/route.ts` (GET, PUT, DELETE)
- [ ] Create `app/api/{module}/options/route.ts` (if dropdowns)

### 4. Pages
- [ ] Create list page with `ListToolbar`
- [ ] Create detail page with export functionality
- [ ] Create new/create form page
- [ ] Create edit form page

### 5. Testing
- [ ] Test TypeScript compilation
- [ ] Test all CRUD operations
- [ ] Test filters and search
- [ ] Test export (CSV/PDF)
- [ ] Test form validation
- [ ] Test loading/error states

---

## Quick Reference

### Import Statements Template

```tsx
// Page component imports
"use client";

import { useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/ui/page-header";
import { InfoCard, DataPoint } from "@/components/ui/info-card";
import { DataField, PremiumInput, ToggleCard } from "@/components/ui/form-field";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { useExport } from "@/hooks/useExport";
import { moduleFormSchema, type ModuleFormData, formToFrappe, frappeToForm, defaultFormValues } from "@/lib/schemas/{module}";
import { useModulesQuery, useModuleQuery, useCreateModuleMutation, useUpdateModuleMutation, useDeleteModuleMutation } from "@/hooks/data/use{Module}Query";
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-12-14 | Initial template finalization |

---

*This template is maintained by the Pana ERP development team. For questions or improvements, contact the architecture team.*
