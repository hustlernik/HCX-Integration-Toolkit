import React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { InsurancePlanForm } from '@/interfaces/insurancePlan';

interface PlansTableProps {
  plans: InsurancePlanForm[];
  onViewPlan: (plan: InsurancePlanForm) => void;
}

export const InsurancePlansTable: React.FC<PlansTableProps> = ({ plans, onViewPlan }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Plan ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead>Coverage Area</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {plans.map((plan) => (
          <TableRow key={`${plan.name}-${plan.insurancePlanType}`}>
            <TableCell className="font-mono text-sm">{plan.id || 'N/A'}</TableCell>
            <TableCell>
              <div>
                <div className="font-medium">{plan.name}</div>
                {plan.aliases?.length > 0 && (
                  <div className="text-sm text-gray-500">{plan.aliases.join(', ')}</div>
                )}
              </div>
            </TableCell>
            <TableCell>
              <span className="border border-primary text-primary px-2 py-0.5 rounded-full font-medium text-xs whitespace-nowrap bg-transparent">
                {plan.insurancePlanType}
              </span>
            </TableCell>
            <TableCell>{plan.ownedByDisplay}</TableCell>
            <TableCell>{plan.coverageAreaIds?.join(', ')}</TableCell>
            <TableCell>
              <button
                className="text-primary font-medium hover:underline"
                onClick={() => onViewPlan(plan)}
              >
                View
              </button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
