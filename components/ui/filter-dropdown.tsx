import { Filter, Check, X } from "lucide-react";
import { useState } from "react";
import { Button } from "./button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator } from "./dropdown-menu";
import { Label } from "./label";
import { Input } from "./input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./select";

interface Filters {
  name: string;
  group: string;
  status: string;
  id: string;
}

interface FilterDropdownProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  itemGroups: string[];
  onApply: () => void;
  onClear: () => void;
}

export function FilterDropdown({
  filters,
  onFiltersChange,
  itemGroups,
  onApply,
  onClear,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<Filters>(filters);

  const handleFilterChange = (field: keyof Filters, value: string) => {
    setLocalFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    onApply();
    setIsOpen(false);
  };

  const handleClear = () => {
    const clearedFilters = {
      name: "",
      group: "all",
      status: "all",
      id: "",
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    onClear();
    setIsOpen(false);
  };

  const hasActiveFilters = filters.name || filters.group !== "all" || filters.status !== "all" || filters.id;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <div className="h-2 w-2 rounded-full bg-primary" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="start">
        <DropdownMenuLabel className="flex items-center justify-between">
          Filter Items
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 text-xs"
            onClick={handleClear}
          >
            Clear all
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="p-2 space-y-4">
          <div>
            <Label htmlFor="filter-name">Item Name</Label>
            <Input
              id="filter-name"
              placeholder="Filter by name"
              value={localFilters.name}
              onChange={(e) => handleFilterChange("name", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="filter-group">Item Group</Label>
            <Select
              value={localFilters.group}
              onValueChange={(value) => handleFilterChange("group", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Groups" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Groups</SelectItem>
                {itemGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="filter-status">Status</Label>
            <Select
              value={localFilters.status}
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Enabled">Enabled</SelectItem>
                <SelectItem value="Disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="filter-id">ID</Label>
            <Input
              id="filter-id"
              placeholder="Filter by ID"
              value={localFilters.id}
              onChange={(e) => handleFilterChange("id", e.target.value)}
            />
          </div>
        </div>

        <DropdownMenuSeparator />
        
        <div className="p-2 flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={handleClear}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
          <Button size="sm" className="flex-1" onClick={handleApply}>
            <Check className="h-4 w-4 mr-1" />
            Apply
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}