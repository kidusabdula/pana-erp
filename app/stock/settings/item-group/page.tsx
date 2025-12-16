"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { useExport } from "@/hooks/useExport";
import { useItemGroupsQuery, useItemGroupTreeQuery, useDeleteItemGroupMutation } from "@/hooks/data/useItemGroupQuery";
import { Plus, Folder, FolderOpen, MoreHorizontal, Eye, Edit, Trash2, ChevronRight, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ItemGroup, ItemGroupTreeNode } from "@/types/item-group";

export default function ItemGroupListPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "tree">("tree");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(["All Item Groups"]));
  
  const { data: listData, isLoading: listLoading } = useItemGroupsQuery();
  const { data: treeData, isLoading: treeLoading } = useItemGroupTreeQuery();
  const deleteMutation = useDeleteItemGroupMutation();
  const { exportData, isExporting } = useExport();

  const listItems = listData?.data?.item_groups || [];
  const treeItems = treeData?.data?.tree || [];

  // Build tree structure from flat list
  const buildTree = (items: ItemGroup[], parentId: string = "All Item Groups"): ItemGroupTreeNode[] => {
    return items
      .filter(item => item.parent_item_group === parentId)
      .sort((a, b) => a.item_group_name.localeCompare(b.item_group_name))
      .map(item => ({
        ...item,
        children: buildTree(items, item.name),
        expanded: expandedNodes.has(item.name)
      }));
  };

  const tree = useMemo(() => buildTree(treeItems), [treeItems, expandedNodes]);

  // Toggle node expansion
  const toggleNode = (nodeName: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeName)) {
        newSet.delete(nodeName);
      } else {
        newSet.add(nodeName);
      }
      return newSet;
    });
  };

  // Render tree node recursively
  const renderTreeNode = (node: ItemGroupTreeNode, level: number = 0) => {
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedNodes.has(node.name);
    
    return (
      <div key={node.name} className="w-full">
        <div
          className={cn(
            "flex items-center justify-between p-3 bg-card rounded-xl shadow-sm hover:shadow-md transition-all animate-in fade-in slide-in-from-left-4",
            level > 0 && "ml-6"
          )}
          style={{ marginLeft: `${level * 24}px` }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleNode(node.name)}
              className="p-1 rounded hover:bg-secondary/50 transition-colors"
            >
              {hasChildren ? (
                isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
              ) : (
                <div className="w-4 h-4" />
              )}
            </button>
            
            <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
              {node.is_group ? (
                isExpanded ? <FolderOpen className="h-4 w-4 text-primary" /> : <Folder className="h-4 w-4 text-primary" />
              ) : (
                <Folder className="h-4 w-4 text-primary" />
              )}
            </div>
            
            <div>
              <p className="font-medium">{node.item_group_name}</p>
              <p className="text-xs text-muted-foreground">{node.name}</p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl">
              <DropdownMenuItem onClick={() => router.push(`/stock/settings/item-group/${encodeURIComponent(node.name)}`)}>
                <Eye className="h-4 w-4 mr-2" /> View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/stock/settings/item-group/${encodeURIComponent(node.name)}/edit`)}>
                <Edit className="h-4 w-4 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => deleteMutation.mutate(node.name)}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const filteredListItems = useMemo(() => {
    if (!searchQuery) return listItems;
    const query = searchQuery.toLowerCase();
    return listItems.filter(item => 
      item.item_group_name.toLowerCase().includes(query) ||
      item.name.toLowerCase().includes(query)
    );
  }, [listItems, searchQuery]);

  const handleExport = async (format: "csv" | "pdf") => {
    const dataToExport = viewMode === "tree" ? treeItems : filteredListItems;
    await exportData(dataToExport, "item-groups-export", "Item Groups Report", format);
  };

  const isLoading = viewMode === "tree" ? treeLoading : listLoading;

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-500">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Item Groups</h1>
          <p className="text-muted-foreground mt-1">
            Manage your item groups ({viewMode === "tree" ? treeItems.length : filteredListItems.length} total)
          </p>
        </div>
        <Button
          onClick={() => router.push("/stock/settings/item-group/new")}
          className="rounded-full px-6 shadow-lg shadow-primary/25"
        >
          <Plus className="h-4 w-4 mr-2" /> New Item Group
        </Button>
      </div>

      {/* Toolbar */}
      <ListToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search item groups..."
        onExport={handleExport}
        isExporting={isExporting}
        filters={[
          {
            key: "view",
            label: "View",
            value: viewMode,
            onChange: (value) => setViewMode(value as "list" | "tree"),
            options: [
              { label: "Tree View", value: "tree" },
              { label: "List View", value: "list" },
            ],
          },
        ]}
      />

      {/* List or Tree View */}
      {viewMode === "tree" ? (
        <div className="space-y-2">
          {tree.map(node => renderTreeNode(node))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredListItems.map((item, idx) => (
            <div
              key={item.name}
              className="flex items-center justify-between p-4 bg-card rounded-2xl shadow-sm hover:shadow-md transition-all animate-in fade-in slide-in-from-left-4"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  {item.is_group ? (
                    <Folder className="h-5 w-5 text-primary" />
                  ) : (
                    <Folder className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-semibold">{item.item_group_name}</p>
                  <p className="text-sm text-muted-foreground">{item.name}</p>
                  {item.parent_item_group && (
                    <p className="text-xs text-muted-foreground">Parent: {item.parent_item_group}</p>
                  )}
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-2xl">
                  <DropdownMenuItem onClick={() => router.push(`/stock/settings/item-group/${encodeURIComponent(item.name)}`)}>
                    <Eye className="h-4 w-4 mr-2" /> View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(`/stock/settings/item-group/${encodeURIComponent(item.name)}/edit`)}>
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => deleteMutation.mutate(item.name)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-12 bg-muted/50 rounded-2xl w-1/3" />
      <div className="h-12 bg-muted/50 rounded-full" />
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="h-20 bg-muted/40 rounded-2xl" />
      ))}
    </div>
  );
}