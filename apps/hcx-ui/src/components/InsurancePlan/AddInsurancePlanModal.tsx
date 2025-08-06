import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MultiSelect } from '../ui/multiselect';

export const AddInsurancePlanModal = ({ onSubmit, onClose }) => {
  const [newPlan, setNewPlan] = useState({
    insurancePlanType: '',
    name: '',
    aliases: [],
    periodStart: '',
    periodEnd: '',
    ownedByOrgId: '',
    ownedByDisplay: '',
    administeredByOrgId: '',
    administeredByDisplay: '',
    coverageAreaIds: [],
    contactPhones: [],
    contactEmails: [],
    networkOrgIds: [],
    claimConditions: [],
    supportingDocuments: [],
    benefitTypes: [],
    planType: '',
    generalCosts: [{ comment: '', groupSize: 1, costAmount: 0, currency: 'INR' }],
    specificCosts: [{ benefitCategory: '', benefitType: '', costAmount: 0, currency: 'INR' }],
  });

  const handleSubmit = async () => {
    try {
      const submitData = {
        ...newPlan,
        periodStart: newPlan.periodStart ? new Date(newPlan.periodStart).toISOString() : undefined,
        periodEnd: newPlan.periodEnd ? new Date(newPlan.periodEnd).toISOString() : undefined,
        aliases: newPlan.aliases?.length > 0 ? newPlan.aliases : undefined,
        coverageAreaIds: newPlan.coverageAreaIds?.length > 0 ? newPlan.coverageAreaIds : undefined,
        contactPhones: newPlan.contactPhones?.length > 0 ? newPlan.contactPhones : undefined,
        contactEmails: newPlan.contactEmails?.length > 0 ? newPlan.contactEmails : undefined,
        networkOrgIds: newPlan.networkOrgIds?.length > 0 ? newPlan.networkOrgIds : undefined,
        claimConditions: newPlan.claimConditions?.length > 0 ? newPlan.claimConditions : undefined,
        supportingDocuments:
          newPlan.supportingDocuments?.length > 0 ? newPlan.supportingDocuments : undefined,
        benefitTypes: newPlan.benefitTypes?.length > 0 ? newPlan.benefitTypes : undefined,
        generalCosts:
          newPlan.generalCosts?.filter((cost) => cost.comment || cost.costAmount > 0) || undefined,
        specificCosts:
          newPlan.specificCosts?.filter(
            (cost) => cost.benefitCategory || cost.benefitType || cost.costAmount > 0,
          ) || undefined,
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error creating plan:', error);
      alert(
        `Failed to create insurance plan: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-0 rounded shadow-lg w-full max-w-3xl space-y-0 max-h-[90vh] overflow-y-auto">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Add Insurance Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-b pb-4 mb-4">
              <h3 className="font-semibold mb-2">Plan Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">
                    Insurance Plan Type <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={newPlan.insurancePlanType}
                    onValueChange={(v) => setNewPlan({ ...newPlan, insurancePlanType: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hospitalisation Indemnity Policy">
                        Hospitalisation Indemnity Policy
                      </SelectItem>
                      <SelectItem value="Hospital Cash Plan">Hospital Cash Plan</SelectItem>
                      <SelectItem value="Critical Illness Cover -Indemnity">
                        Critical Illness Cover -Indemnity
                      </SelectItem>
                      <SelectItem value="Critical Illness Cover - Benefits">
                        Critical Illness Cover - Benefits
                      </SelectItem>
                      <SelectItem value="Out Patient Policy">Out Patient Policy</SelectItem>
                      <SelectItem value="Universal Health Policy">
                        Universal Health Policy
                      </SelectItem>
                      <SelectItem value="Micro insurance Policy">Micro insurance Policy</SelectItem>
                      <SelectItem value="Package Policy (covering more than one type of health above)">
                        Package Policy (covering more than one type of health above)
                      </SelectItem>
                      <SelectItem value="Hybrid Policy (covering other than health also)">
                        Hybrid Policy (covering other than health also)
                      </SelectItem>
                      <SelectItem value="Mass policy">Mass policy</SelectItem>
                      <SelectItem value="Any Other Product Type">Any Other Product Type</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block mb-1">
                    Plan Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={newPlan.name}
                    onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-1">Aliases</label>
                  <Input
                    value={newPlan.aliases?.join(', ')}
                    onChange={(e) =>
                      setNewPlan({
                        ...newPlan,
                        aliases: e.target.value
                          .split(',')
                          .map((a) => a.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="Comma separated"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Press comma to add multiple aliases
                  </div>
                </div>
                <div>
                  <label className="block mb-1">
                    Period Start <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={newPlan.periodStart ? newPlan.periodStart.slice(0, 10) : ''}
                    onChange={(e) => setNewPlan({ ...newPlan, periodStart: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">Period End</label>
                  <Input
                    type="date"
                    value={newPlan.periodEnd ? newPlan.periodEnd.slice(0, 10) : ''}
                    onChange={(e) => setNewPlan({ ...newPlan, periodEnd: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="border-b pb-4 mb-4">
              <h3 className="font-semibold mb-2">Organizations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">
                    Owned By Org <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={newPlan.ownedByOrgId}
                    onValueChange={(v) => {
                      const display =
                        v === 'abc-insurance-ltd'
                          ? 'ABC Insurance Ltd.'
                          : v === 'star-health'
                            ? 'Star Health'
                            : v === 'niva-bupa'
                              ? 'Niva Bupa'
                              : '';
                      setNewPlan({ ...newPlan, ownedByOrgId: v, ownedByDisplay: display });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select org" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="abc-insurance-ltd">ABC Insurance Ltd.</SelectItem>
                      <SelectItem value="star-health">Star Health</SelectItem>
                      <SelectItem value="niva-bupa">Niva Bupa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block mb-1">Administered By Org</label>
                  <Select
                    value={newPlan.administeredByOrgId}
                    onValueChange={(v) => {
                      const display =
                        v === 'xyz-health-tpa'
                          ? 'XYZ Health TPA'
                          : v === 'mediassist-tpa'
                            ? 'Mediassist TPA'
                            : v === 'health-india-tpa'
                              ? 'Health India TPA'
                              : '';
                      setNewPlan({
                        ...newPlan,
                        administeredByOrgId: v,
                        administeredByDisplay: display,
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select org" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="xyz-health-tpa">XYZ Health TPA</SelectItem>
                      <SelectItem value="mediassist-tpa">Mediassist TPA</SelectItem>
                      <SelectItem value="health-india-tpa">Health India TPA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="border-b pb-4 mb-4">
              <h3 className="font-semibold mb-2">Coverage</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MultiSelect
                  label="Coverage Area(s)"
                  options={[
                    { value: 'delhi-ncr', label: 'Delhi NCR' },
                    { value: 'mumbai', label: 'Mumbai' },
                    { value: 'bangalore', label: 'Bangalore' },
                  ]}
                  value={newPlan.coverageAreaIds}
                  onChange={(vals) => setNewPlan({ ...newPlan, coverageAreaIds: vals })}
                  placeholder="Select coverage areas"
                />
                <MultiSelect
                  label="Network Org(s)"
                  options={[
                    { value: 'max-hospital', label: 'Max Hospital' },
                    { value: 'apollo-hospital', label: 'Apollo Hospital' },
                    { value: 'fortis-hospital', label: 'Fortis Hospital' },
                  ]}
                  value={newPlan.networkOrgIds}
                  onChange={(vals) => setNewPlan({ ...newPlan, networkOrgIds: vals })}
                  placeholder="Select network orgs"
                />
                <MultiSelect
                  label="Claim Condition(s)"
                  options={[
                    {
                      value: 'Minimum 24 hours hospitalisation required',
                      label: 'Minimum 24 hours hospitalisation required',
                    },
                    {
                      value: 'Prior authorization required',
                      label: 'Prior authorization required',
                    },
                    {
                      value: 'Cashless only at network hospitals',
                      label: 'Cashless only at network hospitals',
                    },
                    {
                      value: 'Claim applicable for pre-existing only after waiting period',
                      label: 'Claim applicable for pre-existing only after waiting period',
                    },
                    { value: 'Others', label: 'Others' },
                  ]}
                  value={newPlan.claimConditions}
                  onChange={(vals) => setNewPlan({ ...newPlan, claimConditions: vals })}
                  placeholder="Select claim conditions"
                />
                <MultiSelect
                  label="Supporting Document(s)"
                  options={[
                    { value: 'Proof of identity', label: 'Proof of identity' },
                    { value: 'Proof of address', label: 'Proof of address' },
                    { value: 'Aadhaar card', label: 'Aadhaar card' },
                    { value: 'PAN card', label: 'PAN card' },
                    { value: 'Voter ID', label: 'Voter ID' },
                    { value: 'Passport', label: 'Passport' },
                    { value: 'Driving License', label: 'Driving License' },
                    { value: 'Discharge Summary', label: 'Discharge Summary' },
                    { value: 'Medical Prescription', label: 'Medical Prescription' },
                    { value: 'Investigation Reports', label: 'Investigation Reports' },
                    { value: 'Hospital Bill', label: 'Hospital Bill' },
                    { value: 'Claim Form', label: 'Claim Form' },
                    { value: 'Bank Details', label: 'Bank Details' },
                    { value: 'Cancelled Cheque', label: 'Cancelled Cheque' },
                    { value: 'Authorization Letter', label: 'Authorization Letter' },
                    { value: 'Others', label: 'Others' },
                  ]}
                  value={newPlan.supportingDocuments}
                  onChange={(vals) => setNewPlan({ ...newPlan, supportingDocuments: vals })}
                  placeholder="Select supporting documents"
                />
                <MultiSelect
                  label="Benefit Type(s)"
                  options={[
                    { value: 'Consultation', label: 'Consultation' },
                    { value: 'Hospitalization', label: 'Hospitalization' },
                    { value: 'Day Care Treatment', label: 'Day Care Treatment' },
                    { value: 'Maternity', label: 'Maternity' },
                    { value: 'New Born', label: 'New Born' },
                    { value: 'Emergency', label: 'Emergency' },
                    { value: 'ICU', label: 'ICU' },
                    { value: 'Ambulance', label: 'Ambulance' },
                    { value: 'Medicine', label: 'Medicine' },
                    { value: 'Diagnostics', label: 'Diagnostics' },
                    { value: 'Dental', label: 'Dental' },
                    { value: 'Vision', label: 'Vision' },
                    { value: 'Mental Health', label: 'Mental Health' },
                    { value: 'Other', label: 'Other' },
                  ]}
                  value={newPlan.benefitTypes}
                  onChange={(vals) => setNewPlan({ ...newPlan, benefitTypes: vals })}
                  placeholder="Select benefit types"
                />
                <div>
                  <label className="block mb-1">
                    Plan Type <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={newPlan.planType}
                    onValueChange={(v) => setNewPlan({ ...newPlan, planType: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select plan type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Individual">Individual</SelectItem>
                      <SelectItem value="Individual Floater">Individual Floater</SelectItem>
                      <SelectItem value="Group">Group</SelectItem>
                      <SelectItem value="Group Floater">Group Floater</SelectItem>
                      <SelectItem value="Declaration">Declaration</SelectItem>
                      <SelectItem value="Declaration Floater">Declaration Floater</SelectItem>
                      <SelectItem value="Declaration with Group Organiser">
                        Declaration with Group Organiser
                      </SelectItem>
                      <SelectItem value="Declaration Floater with Group Organiser">
                        Declaration Floater with Group Organiser
                      </SelectItem>
                      <SelectItem value="Any Other Cover Type">Any Other Cover Type</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="border-b pb-4 mb-4">
              <h3 className="font-semibold mb-2">Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Contact Phone(s)</label>
                  <Input
                    value={newPlan.contactPhones?.join(', ')}
                    onChange={(e) =>
                      setNewPlan({
                        ...newPlan,
                        contactPhones: e.target.value
                          .split(',')
                          .map((a) => a.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="Comma separated"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Press comma to add multiple phone numbers
                  </div>
                </div>
                <div>
                  <label className="block mb-1">Contact Email(s)</label>
                  <Input
                    value={newPlan.contactEmails?.join(', ')}
                    onChange={(e) =>
                      setNewPlan({
                        ...newPlan,
                        contactEmails: e.target.value
                          .split(',')
                          .map((a) => a.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="Comma separated"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Press comma to add multiple emails
                  </div>
                </div>
              </div>
            </div>

            <div className="border-b pb-4 mb-4">
              <h3 className="font-semibold mb-2">General Costs</h3>
              <div className="space-y-3">
                {newPlan.generalCosts?.map((cost, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm flex flex-wrap md:flex-nowrap items-center gap-4 px-4 py-3 mb-2"
                  >
                    <div className="flex-1 min-w-0 flex flex-col">
                      <label className="text-xs font-medium text-gray-500 mb-1">Comment</label>
                      <Input
                        placeholder="Enter comment"
                        value={cost.comment}
                        onChange={(e) => {
                          const arr = [...newPlan.generalCosts];
                          arr[idx].comment = e.target.value;
                          setNewPlan({ ...newPlan, generalCosts: arr });
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <label className="text-xs font-medium text-gray-500 mb-1">Group Size</label>
                      <Input
                        type="number"
                        placeholder="Enter group size"
                        value={cost.groupSize}
                        onChange={(e) => {
                          const arr = [...newPlan.generalCosts];
                          arr[idx].groupSize = Number(e.target.value);
                          setNewPlan({ ...newPlan, generalCosts: arr });
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <label className="text-xs font-medium text-gray-500 mb-1">Cost Amount</label>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={cost.costAmount}
                        onChange={(e) => {
                          const arr = [...newPlan.generalCosts];
                          arr[idx].costAmount = Number(e.target.value);
                          setNewPlan({ ...newPlan, generalCosts: arr });
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <label className="text-xs font-medium text-gray-500 mb-1">Currency</label>
                      <Input
                        placeholder="Currency"
                        value={cost.currency}
                        onChange={(e) => {
                          const arr = [...newPlan.generalCosts];
                          arr[idx].currency = e.target.value;
                          setNewPlan({ ...newPlan, generalCosts: arr });
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="ml-2 mt-6"
                      title="Remove cost"
                      onClick={() => {
                        const arr = [...newPlan.generalCosts];
                        arr.splice(idx, 1);
                        setNewPlan({ ...newPlan, generalCosts: arr });
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() =>
                  setNewPlan({
                    ...newPlan,
                    generalCosts: [
                      ...(newPlan.generalCosts || []),
                      { comment: '', groupSize: 1, costAmount: 0, currency: 'INR' },
                    ],
                  })
                }
              >
                + Add General Cost
              </Button>
            </div>

            {/* Specific Costs */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Specific Costs</h3>
              <div className="space-y-3">
                {newPlan.specificCosts?.map((cost, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm flex flex-wrap md:flex-nowrap items-center gap-4 px-4 py-3 mb-2"
                  >
                    <div className="flex-1 min-w-0 flex flex-col">
                      <label className="text-xs font-medium text-gray-500 mb-1">
                        Benefit Category
                      </label>
                      <Select
                        value={cost.benefitCategory}
                        onValueChange={(v) => {
                          const arr = [...newPlan.specificCosts];
                          arr[idx].benefitCategory = v;
                          setNewPlan({ ...newPlan, specificCosts: arr });
                        }}
                      >
                        <SelectTrigger className="flex-1 min-w-0">
                          <SelectValue placeholder="Benefit Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Biomedical device">Biomedical device</SelectItem>
                          <SelectItem value="Site of care">Site of care</SelectItem>
                          <SelectItem value="Pharmaceutical / biologic product">
                            Pharmaceutical / biologic product
                          </SelectItem>
                          <SelectItem value="Administrative procedure">
                            Administrative procedure
                          </SelectItem>
                          <SelectItem value="Donor for medical or surgical procedure">
                            Donor for medical or surgical procedure
                          </SelectItem>
                          <SelectItem value="Healthcare services">Healthcare services</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <label className="text-xs font-medium text-gray-500 mb-1">Benefit Type</label>
                      <Select
                        value={cost.benefitType}
                        onValueChange={(v) => {
                          const arr = [...newPlan.specificCosts];
                          arr[idx].benefitType = v;
                          setNewPlan({ ...newPlan, specificCosts: arr });
                        }}
                      >
                        <SelectTrigger className="flex-1 min-w-0">
                          <SelectValue placeholder="Benefit Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Consultation">Consultation</SelectItem>
                          <SelectItem value="Hospitalization">Hospitalization</SelectItem>
                          <SelectItem value="Day Care Treatment">Day Care Treatment</SelectItem>
                          <SelectItem value="Maternity">Maternity</SelectItem>
                          <SelectItem value="New Born">New Born</SelectItem>
                          <SelectItem value="Emergency">Emergency</SelectItem>
                          <SelectItem value="ICU">ICU</SelectItem>
                          <SelectItem value="Ambulance">Ambulance</SelectItem>
                          <SelectItem value="Medicine">Medicine</SelectItem>
                          <SelectItem value="Diagnostics">Diagnostics</SelectItem>
                          <SelectItem value="Dental">Dental</SelectItem>
                          <SelectItem value="Vision">Vision</SelectItem>
                          <SelectItem value="Mental Health">Mental Health</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <label className="text-xs font-medium text-gray-500 mb-1">Cost Amount</label>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={cost.costAmount}
                        onChange={(e) => {
                          const arr = [...newPlan.specificCosts];
                          arr[idx].costAmount = Number(e.target.value);
                          setNewPlan({ ...newPlan, specificCosts: arr });
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <label className="text-xs font-medium text-gray-500 mb-1">Currency</label>
                      <Input
                        placeholder="Currency"
                        value={cost.currency}
                        onChange={(e) => {
                          const arr = [...newPlan.specificCosts];
                          arr[idx].currency = e.target.value;
                          setNewPlan({ ...newPlan, specificCosts: arr });
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="ml-2 mt-6"
                      title="Remove cost"
                      onClick={() => {
                        const arr = [...newPlan.specificCosts];
                        arr.splice(idx, 1);
                        setNewPlan({ ...newPlan, specificCosts: arr });
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() =>
                  setNewPlan({
                    ...newPlan,
                    specificCosts: [
                      ...(newPlan.specificCosts || []),
                      { benefitCategory: '', benefitType: '', costAmount: 0, currency: 'INR' },
                    ],
                  })
                }
              >
                + Add Specific Cost
              </Button>
            </div>
          </CardContent>
          <div className="sticky bottom-0 bg-white p-4 flex justify-end gap-2 border-t z-10">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" variant="default" onClick={handleSubmit}>
              Save
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
