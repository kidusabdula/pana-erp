import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Item, ItemCreateRequest, ItemUpdateRequest, ItemOptions } from "@/types/item";
import { toast } from "sonner";

// Fetch all items
export function useItemsQuery(filters?: {
  name?: string;
  group?: string;
  status?: string;
  id?: string;
}) {
  return useQuery({
    queryKey: ["items", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.name) params.append("name", filters.name);
      if (filters?.group && filters.group !== "all") params.append("group", filters.group);
      if (filters?.status && filters.status !== "all") params.append("status", filters.status);
      if (filters?.id) params.append("id", filters.id);
      
      const response = await fetch(`/api/items?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to fetch items");
      }
      return response.json() as Promise<{ data: { items: Item[] } }>;
    },
    staleTime: 60 * 1000, // 1 minute
  });
}

// Fetch a single item by code
export function useItemQuery(code: string) {
  return useQuery({
    queryKey: ["item", code],
    queryFn: async () => {
      const response = await fetch(`/api/items/${encodeURIComponent(code)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || "Failed to fetch item");
      }
      return response.json() as Promise<{ item: Item }>;
    },
    enabled: !!code,
    staleTime: 60 * 1000, // 1 minute
  });
}

// Fetch item options (groups and UOMs)
export function useItemOptionsQuery() {
  return useQuery({
    queryKey: ["itemOptions"],
    queryFn: async () => {
      const response = await fetch("/api/items/options");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to fetch item options");
      }
      return response.json() as Promise<{ data: ItemOptions }>;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Create a new item
export function useCreateItemMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: ItemCreateRequest) => {
      const response = await fetch("/api/items", {
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
    },
    onError: (error) => {
      toast.error(`Failed to create item: ${error.message}`);
    },
  });
}

// Update an existing item
export function useUpdateItemMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ name, data }: { name: string; data: ItemUpdateRequest }) => {
      const response = await fetch(`/api/items?name=${name}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
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
    },
    onError: (error) => {
      toast.error(`Failed to update item: ${error.message}`);
    },
  });
}

// Delete an item
export function useDeleteItemMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch(`/api/items?name=${name}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to delete item");
      }
      
      return response.json() as Promise<{ message: string }>;
    },
    onSuccess: (_, name) => {
      toast.success("Item deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.removeQueries({ queryKey: ["item", name] });
    },
    onError: (error) => {
      toast.error(`Failed to delete item: ${error.message}`);
    },
  });
}