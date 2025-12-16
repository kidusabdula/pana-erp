// hooks/data/useItemGroupQuery.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ItemGroup, ItemGroupCreateRequest, ItemGroupUpdateRequest, ItemGroupFilters, ItemGroupOptions } from "@/types/item-group";
import { toast } from "sonner";

// List Query
export function useItemGroupsQuery(filters?: ItemGroupFilters) {
  return useQuery({
    queryKey: ["item-groups", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.name) params.append("name", filters.name);
      if (filters?.parent) params.append("parent", filters.parent);
      if (filters?.is_group !== undefined) params.append("is_group", filters.is_group ? "1" : "0");
      
      const response = await fetch(`/api/stock/settings/item-group?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to fetch");
      }
      return response.json() as Promise<{ data: { item_groups: ItemGroup[] } }>;
    },
    staleTime: 60 * 1000,
  });
}

// Tree Query - for hierarchical view
export function useItemGroupTreeQuery() {
  return useQuery({
    queryKey: ["item-group-tree"],
    queryFn: async () => {
      const response = await fetch("/api/stock/settings/item-group?view=tree");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to fetch tree");
      }
      return response.json() as Promise<{ data: { tree: ItemGroup[] } }>;
    },
    staleTime: 60 * 1000,
  });
}

// Single Item Group Query
export function useItemGroupQuery(name: string) {
  return useQuery({
    queryKey: ["item-group", name],
    queryFn: async () => {
      const response = await fetch(`/api/stock/settings/item-group/${encodeURIComponent(name)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch");
      }
      return response.json() as Promise<{ data: { item_group: ItemGroup } }>;
    },
    enabled: !!name,
    staleTime: 60 * 1000,
  });
}

// Options Query (for dropdowns)
export function useItemGroupOptionsQuery() {
  return useQuery({
    queryKey: ["item-group-options"],
    queryFn: async () => {
      const response = await fetch("/api/stock/settings/item-group/options");
      if (!response.ok) throw new Error("Failed to fetch options");
      return response.json() as Promise<{ data: ItemGroupOptions }>;
    },
    staleTime: 10 * 60 * 1000,
  });
}

// Create Mutation
export function useCreateItemGroupMutation(options?: {
  onSuccess?: (data: { data: { item_group: ItemGroup } }) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ItemGroupCreateRequest) => {
      const response = await fetch("/api/stock/settings/item-group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to create");
      }
      return response.json() as Promise<{ data: { item_group: ItemGroup } }>;
    },
    onSuccess: (data) => {
      toast.success("Item Group created successfully");
      queryClient.invalidateQueries({ queryKey: ["item-groups"] });
      queryClient.invalidateQueries({ queryKey: ["item-group-tree"] });
      queryClient.invalidateQueries({ queryKey: ["item-group-options"] });
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create: ${error.message}`);
      options?.onError?.(error);
    },
  });
}

// Update Mutation
export function useUpdateItemGroupMutation(options?: {
  onSuccess?: (data: { data: { item_group: ItemGroup } }) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, data }: { name: string; data: ItemGroupUpdateRequest }) => {
      const response = await fetch(`/api/stock/settings/item-group?name=${encodeURIComponent(name)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to update");
      }
      return response.json() as Promise<{ data: { item_group: ItemGroup } }>;
    },
    onSuccess: (data, variables) => {
      toast.success("Item Group updated successfully");
      queryClient.invalidateQueries({ queryKey: ["item-groups"] });
      queryClient.invalidateQueries({ queryKey: ["item-group-tree"] });
      queryClient.invalidateQueries({ queryKey: ["item-group", variables.name] });
      queryClient.invalidateQueries({ queryKey: ["item-group-options"] });
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update: ${error.message}`);
      options?.onError?.(error);
    },
  });
}

// Delete Mutation
export function useDeleteItemGroupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch(`/api/stock/settings/item-group?name=${encodeURIComponent(name)}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to delete");
      }
      return response.json() as Promise<{ message: string }>;
    },
    onSuccess: (_, name) => {
      toast.success("Item Group deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["item-groups"] });
      queryClient.invalidateQueries({ queryKey: ["item-group-tree"] });
      queryClient.invalidateQueries({ queryKey: ["item-group-options"] });
      queryClient.removeQueries({ queryKey: ["item-group", name] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });
}