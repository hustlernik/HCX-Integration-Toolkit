import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, User, Shield, FileText } from 'lucide-react';
import { Policy, InsurancePlan } from '../../interfaces/policy';
import axios from 'axios';
import { API_CONFIG, API_ENDPOINTS } from '@/config/api';
import { formatDate } from '@/utils/formatDate';

interface PolicyDetailsDrawerProps {
  policy: Policy | null;
  onClose: () => void;
}

const PolicyDetailsDrawer: React.FC<PolicyDetailsDrawerProps> = ({ policy, onClose }) => {
  const [plan, setPlan] = useState<InsurancePlan | null>(null);
  const [planLoading, setPlanLoading] = useState(false);

  useEffect(() => {
    if (policy) {
      setPlan(null);
      setPlanLoading(true);
      axios
        .get(`${API_ENDPOINTS.PAYER.INSURANCE_PLAN}/${policy.insurancePlan.id}`)
        .then((response) => setPlan(response.data))
        .catch(() => {
          setPlan(policy.insurancePlan);
        })
        .finally(() => setPlanLoading(false));
    }
  }, [policy]);

  if (!policy) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-orange-100 text-orange-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'entered-in-error':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-3xl h-full bg-white shadow-xl overflow-y-auto flex flex-col">
        {/* Sticky Header */}
        <div className="sticky top-0 bg-white border-b p-8 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold">Policy Details</h2>
            <p className="text-sm text-gray-600 mt-1">Policy #{policy.policyNumber}</p>
          </div>
          <button className="text-gray-400 hover:text-gray-600" onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-8 space-y-8 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-50 rounded-lg p-0">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                  <FileText className="w-5 h-5" /> Policy Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-6 text-base">
                <div className="mb-2">
                  <span className="font-semibold">Policy Number:</span>{' '}
                  <span className="font-mono">{policy.policyNumber}</span>
                </div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="font-semibold">Status:</span>{' '}
                  <Badge className={getStatusColor(policy.status)}>
                    {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
                  </Badge>
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Coverage:</span>{' '}
                  {formatDate(policy.coverageStart)}
                  {policy.coverageEnd && <> – {formatDate(policy.coverageEnd)}</>}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-50 rounded-lg p-0">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                  <Shield className="w-5 h-5" /> Insurance Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-6 text-base">
                {planLoading ? (
                  <div className="text-gray-500">Loading plan details...</div>
                ) : plan ? (
                  <>
                    <div className="mb-2">
                      <span className="font-semibold">Name:</span> {plan.name}
                    </div>
                    {plan.id && (
                      <div className="mb-2 flex items-baseline gap-2">
                        <span className="font-semibold text-md">Plan ID:</span>
                        <span className="font-mono text-lg">{plan.id}</span>
                      </div>
                    )}
                    {plan.type && (
                      <div className="mb-2">
                        <span className="font-semibold">Type:</span> {plan.type}
                      </div>
                    )}
                    {plan.planType && (
                      <div className="mb-2">
                        <span className="font-semibold">Plan Type:</span> {plan.planType}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-red-500">Plan details not found.</div>
                )}
              </CardContent>
            </Card>
          </div>
          <Card className="bg-gray-50 rounded-lg p-0">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <User className="w-5 h-5" /> Beneficiary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-6 text-base">
              <div className="mb-2">
                <span className="font-semibold">Name:</span> {policy.beneficiary.name.first}{' '}
                {policy.beneficiary.name.last}
              </div>
              <div className="mb-2 flex items-baseline gap-2">
                <span className="font-semibold text-md">ABHA ID:</span>
                <span className="font-mono text-lg">{policy.beneficiary.abhaId}</span>
              </div>
              <div className="mb-2">
                <span className="font-semibold">Gender:</span>{' '}
                <span className="capitalize">{policy.beneficiary.gender}</span>
              </div>
              <div className="mb-2">
                <span className="font-semibold">Date of Birth:</span>{' '}
                {formatDate(policy.beneficiary.dateOfBirth)}
              </div>
              {policy.beneficiary.phone && (
                <div className="mb-2">
                  <span className="font-semibold">Phone:</span> {policy.beneficiary.phone}
                </div>
              )}
              {policy.beneficiary.email && (
                <div className="mb-2">
                  <span className="font-semibold">Email:</span> {policy.beneficiary.email}
                </div>
              )}
              {policy.beneficiary.address && (
                <div className="mb-2">
                  <span className="font-semibold">Address:</span> {policy.beneficiary.address.line}{' '}
                  {[
                    policy.beneficiary.address.city,
                    policy.beneficiary.address.district,
                    policy.beneficiary.address.state,
                    policy.beneficiary.address.pincode,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PolicyDetailsDrawer;
