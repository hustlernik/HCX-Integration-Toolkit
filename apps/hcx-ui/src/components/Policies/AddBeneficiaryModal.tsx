import React, { useState } from 'react';
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
import axios from 'axios';
import { API_CONFIG } from '@/config/api';

interface AddBeneficiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddBeneficiaryModal: React.FC<AddBeneficiaryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    abhaId: '',
    name: {
      first: '',
      last: '',
      middle: '',
    },
    gender: 'unknown' as 'male' | 'female' | 'other' | 'unknown',
    dateOfBirth: '',
    phone: '',
    email: '',
    address: {
      line: '',
      city: '',
      district: '',
      state: '',
      pincode: '',
    },
    abhaAddress: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const newErrors: Record<string, string> = {};
      if (!formData.abhaId) newErrors.abhaId = 'ABHA ID is required';
      if (!formData.name.first) newErrors.firstName = 'First name is required';
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
      if (!formData.abhaAddress) newErrors.abhaAddress = 'ABHA Address is required';
      if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) {
        newErrors.phone = 'Phone number must be 10 digits';
      }
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setLoading(false);
        return;
      }

      await axios.post(API_CONFIG.PAYER.ENDPOINTS.BENEFICIARY, {
        ...formData,
        dateOfBirth: new Date(formData.dateOfBirth),
      });

      onSuccess();
      onClose();
      setFormData({
        abhaId: '',
        name: { first: '', last: '', middle: '' },
        gender: 'unknown',
        dateOfBirth: '',
        phone: '',
        email: '',
        address: { line: '', city: '', district: '', state: '', pincode: '' },
        abhaAddress: '',
      });
    } catch (error: unknown) {
      console.error('Failed to create beneficiary:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to create beneficiary',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Add Beneficiary</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">ABHA ID *</label>
              <Input
                value={formData.abhaId}
                onChange={(e) => setFormData({ ...formData, abhaId: e.target.value })}
                placeholder="Enter ABHA ID"
                className={errors.abhaId ? 'border-red-500' : ''}
              />
              {errors.abhaId && <p className="text-red-500 text-sm mt-1">{errors.abhaId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Gender</label>
              <Select
                value={formData.gender}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    gender: value as 'male' | 'female' | 'other' | 'unknown',
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">First Name *</label>
              <Input
                value={formData.name.first}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: { ...formData.name, first: e.target.value },
                  })
                }
                placeholder="First name"
                className={errors.firstName ? 'border-red-500' : ''}
              />
              {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Middle Name</label>
              <Input
                value={formData.name.middle}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: { ...formData.name, middle: e.target.value },
                  })
                }
                placeholder="Middle name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Last Name</label>
              <Input
                value={formData.name.last}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: { ...formData.name, last: e.target.value },
                  })
                }
                placeholder="Last name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date of Birth *</label>
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className={errors.dateOfBirth ? 'border-red-500' : ''}
                max={new Date().toISOString().split('T')[0]}
                min={new Date(new Date().getFullYear() - 150, 0, 1).toISOString().split('T')[0]}
              />
              {errors.dateOfBirth && (
                <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Phone number"
                pattern="[0-9]{10}"
                title="Please enter a 10-digit phone number"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Email address"
              required={false}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">ABHA Address *</label>
            <Input
              value={formData.abhaAddress}
              onChange={(e) => setFormData({ ...formData, abhaAddress: e.target.value })}
              placeholder="ABHA Address"
              className={errors.abhaAddress ? 'border-red-500' : ''}
            />
            {errors.abhaAddress && (
              <p className="text-red-500 text-sm mt-1">{errors.abhaAddress}</p>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Address (Optional)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Address Line</label>
                <Input
                  value={formData.address.line}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, line: e.target.value },
                    })
                  }
                  placeholder="Address line"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <Input
                  value={formData.address.city}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, city: e.target.value },
                    })
                  }
                  placeholder="City"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">District</label>
                <Input
                  value={formData.address.district}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, district: e.target.value },
                    })
                  }
                  placeholder="District"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">State</label>
                <Input
                  value={formData.address.state}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, state: e.target.value },
                    })
                  }
                  placeholder="State"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Pincode</label>
                <Input
                  value={formData.address.pincode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, pincode: e.target.value },
                    })
                  }
                  placeholder="Pincode"
                />
              </div>
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
              {loading ? 'Creating...' : 'Create Beneficiary'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBeneficiaryModal;
