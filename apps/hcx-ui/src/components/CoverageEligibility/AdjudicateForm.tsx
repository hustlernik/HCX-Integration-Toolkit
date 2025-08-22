import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';

interface BenefitType {
  type: string;
  allowedMoney: { value: number; currency: string };
  allowedUnsignedInt?: number;
  allowedString?: string;
  usedUnsignedInt?: number;
  usedString?: string;
  usedMoney?: { value: number; currency: string };
}

interface ItemType {
  category: { code: string; display: string };
  productOrService: { code: string; display: string };
  benefits: BenefitType[];
  excluded?: boolean;
  name?: string;
  description?: string;
  network?: string;
  unit?: string;
  term?: string;
  authorizationRequired?: boolean;
  authorizationSupporting?: Array<{ code: string; display: string }>;
  authorizationUrl?: string;
}

interface InsuranceType {
  policyNumber: string;
  inforce: boolean;
  benefitPeriod: { start: string; end: string };
  items: ItemType[];
}

export interface ResponseFormType {
  purpose: string[];
  disposition: string;
  servicedDate: string;
  servicedPeriod: { start: string; end: string };
  insurance: InsuranceType[];
}

interface AdjudicateFormProps {
  responseForm: ResponseFormType;
  setResponseForm: React.Dispatch<React.SetStateAction<ResponseFormType>>;
  responseSubmitting: boolean;
  /* eslint-disable */
  handleResponseSubmit: (e: React.FormEvent) => void;
  setResponseAction: (action: 'approve' | 'reject' | 'query' | 'adjudicate' | null) => void;
  CATEGORY_OPTIONS: { code: string; display: string }[];
  PRODUCT_OR_SERVICE_OPTIONS: { code: string; display: string }[];
}

const AdjudicateForm: React.FC<AdjudicateFormProps> = ({
  responseForm,
  setResponseForm,
  responseSubmitting,
  handleResponseSubmit,
  setResponseAction,
  CATEGORY_OPTIONS,
  PRODUCT_OR_SERVICE_OPTIONS,
}) => {
  return (
    <form onSubmit={handleResponseSubmit} className="space-y-8">
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Purpose</h3>
        <div className="grid grid-cols-2 gap-4">
          {['auth-requirements', 'benefits', 'discovery', 'validation'].map((purposeOption) => (
            <label key={purposeOption} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={responseForm.purpose.includes(purposeOption)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setResponseForm({
                      ...responseForm,
                      purpose: [...responseForm.purpose, purposeOption],
                    });
                  } else {
                    setResponseForm({
                      ...responseForm,
                      purpose: responseForm.purpose.filter((p) => p !== purposeOption),
                    });
                  }
                }}
              />
              <span className="text-sm font-medium capitalize">
                {purposeOption.replace('-', ' ')}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Disposition</h3>
        <Input
          value={responseForm.disposition}
          onChange={(e) => setResponseForm({ ...responseForm, disposition: e.target.value })}
          placeholder="e.g., Processed by payer system"
          className="max-w-md"
        />
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Service Period</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Service Date</label>
            <Input
              type="date"
              value={responseForm.servicedDate}
              onChange={(e) => setResponseForm({ ...responseForm, servicedDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <Input
              type="date"
              value={responseForm.servicedPeriod.start}
              onChange={(e) =>
                setResponseForm({
                  ...responseForm,
                  servicedPeriod: { ...responseForm.servicedPeriod, start: e.target.value },
                })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <Input
              type="date"
              value={responseForm.servicedPeriod.end}
              onChange={(e) =>
                setResponseForm({
                  ...responseForm,
                  servicedPeriod: { ...responseForm.servicedPeriod, end: e.target.value },
                })
              }
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Insurance Plans</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setResponseForm((f) => ({
                ...f,
                insurance: [
                  ...f.insurance,
                  {
                    policyNumber: '',
                    inforce: false,
                    benefitPeriod: { start: '', end: '' },
                    items: [],
                  },
                ],
              }))
            }
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Insurance
          </Button>
        </div>

        {responseForm.insurance.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No insurance plans added yet.</p>
            <p className="text-sm">Click "Add Insurance" to get started.</p>
          </div>
        )}

        {responseForm.insurance.map((ins, i) => (
          <Card key={i} className="mb-6 border-2">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-semibold text-gray-700">Plan {i + 1}</h4>
                <button
                  type="button"
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  onClick={() =>
                    setResponseForm((f) => ({
                      ...f,
                      insurance: f.insurance.filter((_, idx) => idx !== i),
                    }))
                  }
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Policy Number</label>
                  <Input
                    value={ins.policyNumber}
                    onChange={(e) => {
                      const arr = [...responseForm.insurance];
                      arr[i].policyNumber = e.target.value;
                      setResponseForm((f) => ({ ...f, insurance: arr }));
                    }}
                    placeholder="Enter policy number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">In Force</label>
                  <Select
                    value={ins.inforce ? 'true' : 'false'}
                    onValueChange={(value) => {
                      const arr = [...responseForm.insurance];
                      arr[i].inforce = value === 'true';
                      setResponseForm((f) => ({ ...f, insurance: arr }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Date</label>
                  <Input
                    type="date"
                    value={ins.benefitPeriod.start}
                    onChange={(e) => {
                      const arr = [...responseForm.insurance];
                      arr[i].benefitPeriod.start = e.target.value;
                      setResponseForm((f) => ({ ...f, insurance: arr }));
                    }}
                    placeholder="mm/dd/yyyy"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Date</label>
                  <Input
                    type="date"
                    value={ins.benefitPeriod.end}
                    onChange={(e) => {
                      const arr = [...responseForm.insurance];
                      arr[i].benefitPeriod.end = e.target.value;
                      setResponseForm((f) => ({ ...f, insurance: arr }));
                    }}
                    placeholder="mm/dd/yyyy"
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h5 className="text-md font-semibold">Coverage Items</h5>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const arr = [...responseForm.insurance];
                      arr[i].items = [
                        ...arr[i].items,
                        {
                          category: { code: '', display: '' },
                          productOrService: { code: '', display: '' },
                          benefits: [],
                        },
                      ];
                      setResponseForm((f) => ({ ...f, insurance: arr }));
                    }}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </Button>
                </div>

                {ins.items.length === 0 && (
                  <div className="text-center py-6 text-gray-500 border-2 border-dashed rounded-lg">
                    <p>No coverage items added yet.</p>
                    <p className="text-sm">Click "Add Item" to get started.</p>
                  </div>
                )}

                {ins.items.map((item, j) => (
                  <Card key={j} className="mb-4 border bg-gray-50">
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h6 className="text-sm font-semibold text-gray-600">Item {j + 1}</h6>
                        <button
                          type="button"
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          onClick={() => {
                            const arr = [...responseForm.insurance];
                            arr[i].items = arr[i].items.filter((_, idx) => idx !== j);
                            setResponseForm((f) => ({ ...f, insurance: arr }));
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Category</label>
                          <Select
                            value={item.category.display}
                            onValueChange={(value) => {
                              const arr = [...responseForm.insurance];
                              const selected = CATEGORY_OPTIONS.find(
                                (opt) => opt.display === value,
                              );
                              arr[i].items[j].category.display = value;
                              arr[i].items[j].category.code = selected ? selected.code : '';
                              setResponseForm((f) => ({ ...f, insurance: arr }));
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {CATEGORY_OPTIONS.map((opt) => (
                                <SelectItem key={opt.display} value={opt.display}>
                                  {opt.display}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Product/Service</label>
                          <Select
                            value={item.productOrService.display}
                            onValueChange={(value) => {
                              const arr = [...responseForm.insurance];
                              const selected = PRODUCT_OR_SERVICE_OPTIONS.find(
                                (opt) => opt.display === value,
                              );
                              arr[i].items[j].productOrService.display = value;
                              arr[i].items[j].productOrService.code = selected ? selected.code : '';
                              setResponseForm((f) => ({ ...f, insurance: arr }));
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select service" />
                            </SelectTrigger>
                            <SelectContent>
                              {PRODUCT_OR_SERVICE_OPTIONS.map((opt) => (
                                <SelectItem key={opt.display} value={opt.display}>
                                  {opt.display}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={item.excluded || false}
                            onChange={(e) => {
                              const arr = [...responseForm.insurance];
                              arr[i].items[j].excluded = e.target.checked;
                              setResponseForm((f) => ({ ...f, insurance: arr }));
                            }}
                          />
                          <label className="text-sm font-medium">Excluded</label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={item.authorizationRequired || false}
                            onChange={(e) => {
                              const arr = [...responseForm.insurance];
                              arr[i].items[j].authorizationRequired = e.target.checked;
                              setResponseForm((f) => ({ ...f, insurance: arr }));
                            }}
                          />
                          <label className="text-sm font-medium">Authorization Required</label>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Name</label>
                          <Input
                            value={item.name || ''}
                            onChange={(e) => {
                              const arr = [...responseForm.insurance];
                              arr[i].items[j].name = e.target.value;
                              setResponseForm((f) => ({ ...f, insurance: arr }));
                            }}
                            placeholder="Item name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Description</label>
                          <Input
                            value={item.description || ''}
                            onChange={(e) => {
                              const arr = [...responseForm.insurance];
                              arr[i].items[j].description = e.target.value;
                              setResponseForm((f) => ({ ...f, insurance: arr }));
                            }}
                            placeholder="Item description"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Network</label>
                          <Select
                            value={item.network || ''}
                            onValueChange={(value) => {
                              const arr = [...responseForm.insurance];
                              arr[i].items[j].network = value;
                              setResponseForm((f) => ({ ...f, insurance: arr }));
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select network" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="in-network">In Network</SelectItem>
                              <SelectItem value="out-of-network">Out of Network</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Unit</label>
                          <Select
                            value={item.unit || ''}
                            onValueChange={(value) => {
                              const arr = [...responseForm.insurance];
                              arr[i].items[j].unit = value;
                              setResponseForm((f) => ({ ...f, insurance: arr }));
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="individual">Individual</SelectItem>
                              <SelectItem value="family">Family</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t">
                        <div className="flex justify-between items-center mb-4">
                          <h6 className="text-sm font-semibold">Benefits</h6>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const arr = [...responseForm.insurance];
                              arr[i].items[j].benefits = [
                                ...arr[i].items[j].benefits,
                                {
                                  type: '',
                                  allowedUnsignedInt: 0,
                                  allowedString: '',
                                  allowedMoney: { value: 0, currency: 'INR' },
                                  usedUnsignedInt: 0,
                                  usedString: '',
                                  usedMoney: { value: 0, currency: 'INR' },
                                },
                              ];
                              setResponseForm((f) => ({ ...f, insurance: arr }));
                            }}
                            className="flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Add Benefit
                          </Button>
                        </div>

                        {item.benefits.length === 0 && (
                          <div className="text-center py-4 text-gray-500 border-2 border-dashed rounded-lg">
                            <p className="text-sm">No benefits added yet.</p>
                          </div>
                        )}

                        {item.benefits.map((ben, k) => (
                          <Card key={k} className="mb-3 border bg-white">
                            <div className="p-4">
                              <div className="flex justify-between items-center mb-3">
                                <span className="text-sm font-medium text-gray-600">
                                  Benefit {k + 1}
                                </span>
                                <button
                                  type="button"
                                  className="text-gray-400 hover:text-red-500 transition-colors"
                                  onClick={() => {
                                    const arr = [...responseForm.insurance];
                                    arr[i].items[j].benefits = arr[i].items[j].benefits.filter(
                                      (_, idx) => idx !== k,
                                    );
                                    setResponseForm((f) => ({ ...f, insurance: arr }));
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <label className="block text-sm font-medium mb-2">Type</label>
                                  <Select
                                    value={ben.type}
                                    onValueChange={(value) => {
                                      const arr = [...responseForm.insurance];
                                      arr[i].items[j].benefits[k].type = value;
                                      setResponseForm((f) => ({ ...f, insurance: arr }));
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="benefit">Benefit</SelectItem>
                                      <SelectItem value="deductible">Deductible</SelectItem>
                                      <SelectItem value="visit">Visit</SelectItem>
                                      <SelectItem value="room">Room</SelectItem>
                                      <SelectItem value="copay">Copay</SelectItem>
                                      <SelectItem value="copay-percent">Copay Percent</SelectItem>
                                      <SelectItem value="copay-maximum">Copay Maximum</SelectItem>
                                      <SelectItem value="vision-exam">Vision Exam</SelectItem>
                                      <SelectItem value="vision-glasses">Vision Glasses</SelectItem>
                                      <SelectItem value="vision-contacts">
                                        Vision Contacts
                                      </SelectItem>
                                      <SelectItem value="medical-primarycare">
                                        Medical Primary Care
                                      </SelectItem>
                                      <SelectItem value="pharmacy-dispense">
                                        Pharmacy Dispense
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2">
                                    Allowed Amount
                                  </label>
                                  <Input
                                    type="number"
                                    value={ben.allowedMoney.value}
                                    onChange={(e) => {
                                      const arr = [...responseForm.insurance];
                                      const value = Math.max(0, Number(e.target.value) || 0);
                                      arr[i].items[j].benefits[k].allowedMoney.value = value;
                                      setResponseForm((f) => ({ ...f, insurance: arr }));
                                    }}
                                    placeholder="0"
                                    min="0"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2">
                                    Used Amount
                                  </label>
                                  <Input
                                    type="number"
                                    value={ben.usedMoney?.value || 0}
                                    onChange={(e) => {
                                      const arr = [...responseForm.insurance];
                                      if (!arr[i].items[j].benefits[k].usedMoney) {
                                        arr[i].items[j].benefits[k].usedMoney = {
                                          value: 0,
                                          currency: 'INR',
                                        };
                                      }
                                      arr[i].items[j].benefits[k].usedMoney!.value = Number(
                                        e.target.value,
                                      );
                                      setResponseForm((f) => ({ ...f, insurance: arr }));
                                    }}
                                    placeholder="0"
                                  />
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t bg-white rounded-lg p-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => setResponseAction(null)}
          disabled={responseSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={responseSubmitting}>
          {responseSubmitting ? 'Submitting...' : 'Submit Response'}
        </Button>
      </div>
    </form>
  );
};

export default AdjudicateForm;
