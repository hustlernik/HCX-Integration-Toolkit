import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';
import { Beneficiary, InsurancePlan } from '../../interfaces/policy';
import axios from 'axios';
import { API_CONFIG, API_ENDPOINTS } from '@/config/api';

interface AddPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddPolicyModal: React.FC<AddPolicyModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    beneficiary: '',
    insurancePlan: '',
    coverageStart: '',
    coverageEnd: '',
    status: 'active' as 'active' | 'cancelled' | 'expired' | 'draft' | 'entered-in-error',
  });
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingErrors, setLoadingErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      loadBeneficiaries();
      loadInsurancePlans();
    }
  }, [isOpen]);

  const loadBeneficiaries = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.PAYER.BENEFICIARY);
      setBeneficiaries(response.data);
      setLoadingErrors((prev) => ({ ...prev, beneficiaries: '' }));
    } catch (error) {
      console.error('Failed to load beneficiaries:', error);
      setLoadingErrors((prev) => ({ ...prev, beneficiaries: 'Failed to load beneficiaries' }));
    }
  };

  const loadInsurancePlans = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.PAYER.INSURANCE_PLAN);
      setInsurancePlans(response.data);
    } catch (error) {
      console.error('Failed to load insurance plans:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const newErrors: Record<string, string> = {};
      if (!formData.beneficiary) newErrors.beneficiary = 'Beneficiary is required';
      if (!formData.insurancePlan) newErrors.insurancePlan = 'Insurance plan is required';
      if (!formData.coverageStart) newErrors.coverageStart = 'Coverage start date is required';

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setLoading(false);
        return;
      }

      const isValidDate = (dateString: string) => {
        const date = new Date(dateString);
        return !isNaN(date.getTime());
      };

      await axios.post(API_ENDPOINTS.PAYER.POLICIES, {
        beneficiary: formData.beneficiary,
        insurancePlan: formData.insurancePlan,
        coverageStart: isValidDate(formData.coverageStart)
          ? new Date(formData.coverageStart)
          : undefined,
        coverageEnd:
          formData.coverageEnd && isValidDate(formData.coverageEnd)
            ? new Date(formData.coverageEnd)
            : undefined,
        status: formData.status,
      });

      onSuccess();
      onClose();
      setFormData({
        beneficiary: '',
        insurancePlan: '',
        coverageStart: '',
        coverageEnd: '',
        status: 'active',
      });
    } catch (error: unknown) {
      console.error('Failed to create policy:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to create policy' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Add Policy</h2>
            <p className="text-sm text-gray-600 mt-1">Policy number will be auto-generated</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  status: value as
                    | 'active'
                    | 'cancelled'
                    | 'expired'
                    | 'draft'
                    | 'entered-in-error',
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="entered-in-error">Entered in Error</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Beneficiary</label>
            <Select
              value={formData.beneficiary}
              onValueChange={(value) => setFormData({ ...formData, beneficiary: value })}
            >
              <SelectTrigger className={errors.beneficiary ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select beneficiary" />
              </SelectTrigger>
              <SelectContent>
                {beneficiaries.map((beneficiary) => (
                  <SelectItem key={beneficiary._id} value={beneficiary._id}>
                    {beneficiary.name.first} {beneficiary.name.last} ({beneficiary.abhaId})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.beneficiary && (
              <p className="text-red-500 text-sm mt-1">{errors.beneficiary}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Insurance Plan</label>
            <Select
              value={formData.insurancePlan}
              onValueChange={(value) => setFormData({ ...formData, insurancePlan: value })}
            >
              <SelectTrigger className={errors.insurancePlan ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select insurance plan" />
              </SelectTrigger>
              <SelectContent>
                {insurancePlans.map((plan) => (
                  <SelectItem key={plan._id} value={plan._id}>
                    {plan.name} ({plan.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.insurancePlan && (
              <p className="text-red-500 text-sm mt-1">{errors.insurancePlan}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Coverage Start Date</label>
              <Input
                type="date"
                value={formData.coverageStart}
                onChange={(e) => setFormData({ ...formData, coverageStart: e.target.value })}
                className={errors.coverageStart ? 'border-red-500' : ''}
              />
              {errors.coverageStart && (
                <p className="text-red-500 text-sm mt-1">{errors.coverageStart}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Coverage End Date (Optional)</label>
              <Input
                type="date"
                value={formData.coverageEnd}
                onChange={(e) => setFormData({ ...formData, coverageEnd: e.target.value })}
              />
            </div>
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Policy'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPolicyModal;
