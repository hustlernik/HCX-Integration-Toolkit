import React from 'react';
import { X, FileText, Shield, Building, Phone, DollarSign } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { InsurancePlanForm } from '@/interfaces/insurancePlan';

interface PlanDetailsDrawerProps {
  plan: InsurancePlanForm | null;
  onClose: () => void;
}

export const InsurancePlanDetailsDrawer: React.FC<PlanDetailsDrawerProps> = ({ plan, onClose }) => {
  if (!plan) return null;

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return amount.toLocaleString('en-IN', { style: 'currency', currency });
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-4xl h-full bg-white shadow-xl p-8 overflow-y-auto">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold mb-6">Insurance Plan Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Plan Information
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Name:</span> {plan.name}
              </div>
              <div>
                <span className="font-medium">Type:</span> {plan.insurancePlanType}
              </div>
              <div>
                <span className="font-medium">Aliases:</span> {plan.aliases?.join(', ') || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Plan Type:</span> {plan.planType || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Benefit Types:</span>{' '}
                {plan.benefitTypes?.join(', ') || 'N/A'}
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Period & Coverage
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Start Date:</span>{' '}
                {plan.periodStart ? new Date(plan.periodStart).toLocaleDateString() : 'N/A'}
              </div>
              <div>
                <span className="font-medium">End Date:</span>{' '}
                {plan.periodEnd ? new Date(plan.periodEnd).toLocaleDateString() : 'N/A'}
              </div>
              <div>
                <span className="font-medium">Coverage Areas:</span>{' '}
                {plan.coverageAreaIds?.join(', ') || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Network Orgs:</span>{' '}
                {plan.networkOrgIds?.join(', ') || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Claim Conditions:</span>{' '}
                {plan.claimConditions?.join(', ') || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Supporting Documents:</span>{' '}
                {plan.supportingDocuments?.join(', ') || 'N/A'}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-3 flex items-center">
            <Building className="w-4 h-4 mr-2" />
            Organizations
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Owned By:</span> {plan.ownedByDisplay || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Administered By:</span>{' '}
              {plan.administeredByDisplay || 'N/A'}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-3 flex items-center">
            <Phone className="w-4 h-4 mr-2" />
            Contact Information
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Phones:</span> {plan.contactPhones?.join(', ') || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Emails:</span> {plan.contactEmails?.join(', ') || 'N/A'}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-3 flex items-center">
            <DollarSign className="w-4 h-4 mr-2" />
            General Costs
          </h3>
          {plan.generalCosts && plan.generalCosts.length > 0 ? (
            <div className="bg-white border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Comment</TableHead>
                    <TableHead>Group Size</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plan.generalCosts.map((cost, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <div className="font-medium">{cost.comment || 'N/A'}</div>
                      </TableCell>
                      <TableCell>{cost.groupSize}</TableCell>
                      <TableCell>{formatCurrency(cost.costAmount, cost.currency)}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(cost.costAmount * cost.groupSize, cost.currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="p-4 bg-gray-50 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Amount:</span>
                  <span className="font-bold text-lg">
                    {formatCurrency(
                      plan.generalCosts.reduce(
                        (sum, c) => sum + (c.costAmount || 0) * (c.groupSize || 1),
                        0,
                      ),
                      plan.generalCosts[0]?.currency,
                    )}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">No general costs defined</div>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-3 flex items-center">
            <DollarSign className="w-4 h-4 mr-2" />
            Specific Costs
          </h3>
          {plan.specificCosts && plan.specificCosts.length > 0 ? (
            <div className="bg-white border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Benefit Category</TableHead>
                    <TableHead>Benefit Type</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plan.specificCosts.map((cost, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <div className="font-medium">{cost.benefitCategory || 'N/A'}</div>
                      </TableCell>
                      <TableCell>{cost.benefitType || 'N/A'}</TableCell>
                      <TableCell>{formatCurrency(cost.costAmount, cost.currency)}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(cost.costAmount, cost.currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="p-4 bg-gray-50 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Amount:</span>
                  <span className="font-bold text-lg">
                    {formatCurrency(
                      plan.specificCosts.reduce((sum, c) => sum + (c.costAmount || 0), 0),
                      plan.specificCosts[0]?.currency,
                    )}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">No specific costs defined</div>
          )}
        </div>
      </div>
    </div>
  );
};
