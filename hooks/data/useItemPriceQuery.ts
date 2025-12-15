// hooks/data/useItemPriceQuery.ts
// Pana ERP - Item Price Data Hooks

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ItemPrice,
  ItemPriceCreateRequest,
  ItemPriceUpdateRequest,
  ItemPriceFilters,
  ItemPriceOptions,
} from "@/types/item-price";
import { toast } from "sonner";

// Fetch all item prices
export function useItemPricesQuery(filters?: ItemPriceFilters) {
  return useQuery({
    queryKey: ["item-prices", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.item_code) params.append("item_code", filters.item_code);
      if (filters?.price_list) params.append("price_list", filters.price_list);
      if (filters?.customer) params.append("customer", filters.customer);
      if (filters?.supplier) params.append("supplier", filters.supplier);
      if (filters?.valid !== undefined)
        params.append("valid", String(filters.valid));

      const response = await fetch(
        `/api/stock/item-price?${params.toString()}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to fetch item prices");
      }
      return response.json() as Promise<{ data: { item_prices: ItemPrice[] } }>;
    },
    staleTime: 60 * 1000,
  });
}

// Fetch a single item price by name
export function useItemPriceQuery(name: string) {
  return useQuery({
    queryKey: ["item-price", name],
    queryFn: async () => {
      const response = await fetch(
        `/api/stock/item-price/${encodeURIComponent(name)}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch item price");
      }
      return response.json() as Promise<{ item_price: ItemPrice }>;
    },
    enabled: !!name,
    staleTime: 60 * 1000,
  });
}

// Fetch item price options (price lists, items, customers, suppliers, uoms)
export function useItemPriceOptionsQuery() {
  return useQuery({
    queryKey: ["item-price-options"],
    queryFn: async () => {
      const response = await fetch("/api/stock/item-price/options");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to fetch options");
      }
      return response.json() as Promise<{ data: ItemPriceOptions }>;
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
}

// Create a new item price
export function useCreateItemPriceMutation(options?: {
  onSuccess?: (data: { data: { item_price: ItemPrice } }) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ItemPriceCreateRequest) => {
      const response = await fetch("/api/stock/item-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to create item price");
      }

      return response.json() as Promise<{ data: { item_price: ItemPrice } }>;
    },
    onSuccess: (data) => {
      toast.success(`Item Price created successfully`);
      queryClient.invalidateQueries({ queryKey: ["item-prices"] });
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      toast.error(`Failed to create item price: ${error.message}`);
      options?.onError?.(error);
    },
  });
}

// Update an existing item price
export function useUpdateItemPriceMutation(options?: {
  onSuccess?: (data: { data: { item_price: ItemPrice } }) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      data,
    }: {
      name: string;
      data: ItemPriceUpdateRequest;
    }) => {
      const response = await fetch(
        `/api/stock/item-price?name=${encodeURIComponent(name)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to update item price");
      }

      return response.json() as Promise<{ data: { item_price: ItemPrice } }>;
    },
    onSuccess: (data, variables) => {
      toast.success(`Item Price updated successfully`);
      queryClient.invalidateQueries({ queryKey: ["item-prices"] });
      queryClient.invalidateQueries({
        queryKey: ["item-price", variables.name],
      });
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      toast.error(`Failed to update item price: ${error.message}`);
      options?.onError?.(error);
    },
  });
}

// Delete an item price
export function useDeleteItemPriceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch(
        `/api/stock/item-price?name=${encodeURIComponent(name)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to delete item price");
      }

      return response.json() as Promise<{ message: string }>;
    },
    onSuccess: (_, name) => {
      toast.success("Item Price deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["item-prices"] });
      queryClient.removeQueries({ queryKey: ["item-price", name] });
    },
    onError: (error) => {
      toast.error(`Failed to delete item price: ${error.message}`);
    },
  });
}
