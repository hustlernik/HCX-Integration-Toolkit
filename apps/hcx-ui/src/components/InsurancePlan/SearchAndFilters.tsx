import React from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '../ui/input';
import { INSURANCE_PLAN_TYPES } from '../../constants/insurancePlanOptions';

interface SearchAndFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
  onAddPlan: () => void;
}

export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  typeFilter,
  setTypeFilter,
  onAddPlan,
}) => {
  return (
    <div className="flex w-full items-center gap-4 mb-4">
      <div className="flex flex-1 gap-4">
        <Input
          type="text"
          placeholder="Search plans by name or alias..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search insurance plans"
          className="w-full"
        />

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-44 flex items-center gap-2 bg-white">
            <Filter className="w-4 h-4 text-gray-400 mr-1" />
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {INSURANCE_PLAN_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button variant="default" className="ml-auto" onClick={onAddPlan}>
        Add Insurance Plan
      </Button>
    </div>
  );
};
