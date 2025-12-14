// hooks/data/useItemsQuery.ts
// Pana ERP v1.3 - Item Data Hooks with TanStack Query

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Item,
  ItemOptions,
  ItemFilters,
  ItemCreateRequest,
  ItemUpdateRequest,
} from "@/types/item";
import { toast } from "sonner";

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch all items with optional filters
 */
export function useItemsQuery(filters?: ItemFilters) {
  return useQuery({
    queryKey: ["items", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.name) params.append("name", filters.name);
      if (filters?.group && filters.group !== "all")
        params.append("group", filters.group);
      if (filters?.status && filters.status !== "all")
        params.append("status", filters.status);
      if (filters?.id) params.append("id", filters.id);

      const response = await fetch(`/api/stock/item?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to fetch items");
      }
      return response.json() as Promise<{ data: { items: Item[] } }>;
    },
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Fetch a single item by name
 */
export function useItemQuery(name: string) {
  return useQuery({
    queryKey: ["item", name],
    queryFn: async () => {
      const response = await fetch(
        `/api/stock/item/${encodeURIComponent(name)}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || errorData.details || "Failed to fetch item"
        );
      }
      return response.json() as Promise<{ item: Item }>;
    },
    enabled: !!name,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Fetch item options (groups and UOMs) for dropdowns
 */
export function useItemOptionsQuery() {
  return useQuery({
    queryKey: ["itemOptions"],
    queryFn: async () => {
      const response = await fetch("/api/stock/item/options");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to fetch item options");
      }
      return response.json() as Promise<{ data: ItemOptions }>;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

interface MutationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

/**
 * Create a new item
 */
export function useCreateItemMutation(
  options?: MutationOptions<{ data: { item: Item } }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ItemCreateRequest) => {
      const response = await fetch("/api/stock/item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to create item");
      }

      return response.json() as Promise<{ data: { item: Item } }>;
    },
    onSuccess: (data) => {
      toast.success(`Item "${data.data.item.item_name}" created successfully`);
      queryClient.invalidateQueries({ queryKey: ["items"] });
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create item: ${error.message}`);
      options?.onError?.(error);
    },
  });
}

/**
 * Update an existing item
 */
export function useUpdateItemMutation(
  options?: MutationOptions<{ data: { item: Item } }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      data,
    }: {
      name: string;
      data: ItemUpdateRequest;
    }) => {
      const response = await fetch(
        `/api/stock/item?name=${encodeURIComponent(name)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to update item");
      }

      return response.json() as Promise<{ data: { item: Item } }>;
    },
    onSuccess: (data, variables) => {
      toast.success(`Item "${data.data.item.item_name}" updated successfully`);
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["item", variables.name] });
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update item: ${error.message}`);
      options?.onError?.(error);
    },
  });
}

/**
 * Delete an item
 */
export function useDeleteItemMutation(
  options?: MutationOptions<{ message: string }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch(
        `/api/stock/item?name=${encodeURIComponent(name)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to delete item");
      }

      return response.json() as Promise<{ message: string }>;
    },
    onSuccess: (data, name) => {
      toast.success("Item deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.removeQueries({ queryKey: ["item", name] });
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete item: ${error.message}`);
      options?.onError?.(error);
    },
  });
}
