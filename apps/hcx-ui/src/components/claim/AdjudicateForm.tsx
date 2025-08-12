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
import {
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  FileText,
  CreditCard,
  User,
  Building2,
  AlertCircle,
} from 'lucide-react';
import {
  CLAIM_RESPONSE_STATUS,
  CLAIM_TYPES,
  USE_TYPES,
  OUTCOME_CODES,
  ADJUDICATION_CATEGORIES,
  PAYMENT_TYPES,
  PAYEE_TYPES,
  TOTAL_CATEGORIES,
  NOTE_TYPES,
  ERROR_CODES,
} from '@/constants/claim';
import type {
  ClaimAdjudicateFormProps,
  ItemAdjudicationType,
  TotalType,
  ProcessNoteType,
  PaymentType,
  AddItemType,
  AdjudicationType,
  InsuranceType,
  ErrorType,
} from '@/interfaces/claim';

const ClaimAdjudicateForm: React.FC<ClaimAdjudicateFormProps> = ({
  responseForm,
  setResponseForm,
  responseSubmitting,
  handleResponseSubmit,
  setResponseAction,
  claimItems,
}) => {
  return (
    <form onSubmit={handleResponseSubmit} className="space-y-10 max-w-6xl mx-auto">
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Core Response Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Status *</label>
            <Select
              value={responseForm.status}
              onValueChange={(value) =>
                setResponseForm({
                  ...responseForm,
                  status: value as 'active' | 'cancelled' | 'draft' | 'entered-in-error',
                })
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {CLAIM_RESPONSE_STATUS.map((status) => (
                  <SelectItem key={status.code} value={status.code}>
                    {status.display}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Type *</label>
            <Select
              value={responseForm.type}
              onValueChange={(value) => {
                const selectedType = CLAIM_TYPES.find((t) => t.code === value);
                if (selectedType) {
                  setResponseForm({
                    ...responseForm,
                    type: selectedType.code,
                  });
                }
              }}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select claim type" />
              </SelectTrigger>
              <SelectContent>
                {CLAIM_TYPES.map((type) => (
                  <SelectItem key={type.code} value={type.code}>
                    {type.display}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Use *</label>
            <Select
              value={responseForm.use}
              onValueChange={(value) =>
                setResponseForm({
                  ...responseForm,
                  use: value as 'claim' | 'preauthorization' | 'predetermination',
                })
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select use" />
              </SelectTrigger>
              <SelectContent>
                {USE_TYPES.map((use) => (
                  <SelectItem key={use.code} value={use.code}>
                    {use.display}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Outcome *</label>
            <Select
              value={responseForm.outcome}
              onValueChange={(value) =>
                setResponseForm({
                  ...responseForm,
                  outcome: value as 'queued' | 'complete' | 'error' | 'partial',
                })
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select outcome" />
              </SelectTrigger>
              <SelectContent>
                {OUTCOME_CODES.map((outcome) => (
                  <SelectItem key={outcome.code} value={outcome.code}>
                    {outcome.display}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Created Date *</label>
            <Input
              type="datetime-local"
              value={responseForm.created}
              onChange={(e) => setResponseForm({ ...responseForm, created: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Disposition</label>
            <Input
              value={responseForm.disposition || ''}
              onChange={(e) => setResponseForm({ ...responseForm, disposition: e.target.value })}
              placeholder="e.g., Claim processed successfully"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <User className="w-5 h-5 mr-2" />
          Party References
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Patient Reference *</label>
            <Input
              value={responseForm.patient.reference}
              onChange={(e) =>
                setResponseForm({
                  ...responseForm,
                  patient: { ...responseForm.patient, reference: e.target.value },
                })
              }
              placeholder="Patient/patient-001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Patient Display Name</label>
            <Input
              value={responseForm.patient.display || ''}
              onChange={(e) =>
                setResponseForm({
                  ...responseForm,
                  patient: { ...responseForm.patient, display: e.target.value },
                })
              }
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Insurer Reference *</label>
            <Input
              value={responseForm.insurer.reference}
              onChange={(e) =>
                setResponseForm({
                  ...responseForm,
                  insurer: { ...responseForm.insurer, reference: e.target.value },
                })
              }
              placeholder="Organization/insurer-001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Insurer Display Name</label>
            <Input
              value={responseForm.insurer.display || ''}
              onChange={(e) =>
                setResponseForm({
                  ...responseForm,
                  insurer: { ...responseForm.insurer, display: e.target.value },
                })
              }
              placeholder="ABC Insurance Company"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Request Reference</label>
            <Input
              value={responseForm.request?.reference || ''}
              onChange={(e) =>
                setResponseForm({
                  ...responseForm,
                  request: { reference: e.target.value },
                })
              }
              placeholder="Claim/claim-001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Requestor Reference</label>
            <Input
              value={responseForm.requestor?.reference || ''}
              onChange={(e) =>
                setResponseForm({
                  ...responseForm,
                  requestor: { reference: e.target.value },
                })
              }
              placeholder="Practitioner/practitioner-001"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Pre-Authorization
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Pre-Auth Reference</label>
            <Input
              value={responseForm.preAuthRef || ''}
              onChange={(e) => setResponseForm({ ...responseForm, preAuthRef: e.target.value })}
              placeholder="Pre-authorization reference"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <Input
              type="date"
              value={responseForm.preAuthPeriod?.start || ''}
              onChange={(e) =>
                setResponseForm({
                  ...responseForm,
                  preAuthPeriod: {
                    ...responseForm.preAuthPeriod,
                    start: e.target.value,
                    end: responseForm.preAuthPeriod?.end || '',
                  },
                })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <Input
              type="date"
              value={responseForm.preAuthPeriod?.end || ''}
              onChange={(e) =>
                setResponseForm({
                  ...responseForm,
                  preAuthPeriod: {
                    ...responseForm.preAuthPeriod,
                    start: responseForm.preAuthPeriod?.start || '',
                    end: e.target.value,
                  },
                })
              }
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Payment Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Payee Type</label>
            <Select
              value={responseForm.payeeType || ''}
              onValueChange={(value) => {
                const selectedPayeeType = PAYEE_TYPES.find((p) => p.code === value);
                if (selectedPayeeType) {
                  setResponseForm({
                    ...responseForm,
                    payeeType: selectedPayeeType.code,
                  });
                }
              }}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select payee type" />
              </SelectTrigger>
              <SelectContent>
                {PAYEE_TYPES.map((type) => (
                  <SelectItem key={type.code} value={type.code}>
                    {type.display}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Funds Reserve</label>
            <Select
              value={responseForm.fundsReserve || ''}
              onValueChange={(value) => {
                setResponseForm({ ...responseForm, fundsReserve: value });
              }}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select funds reserve" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="patient">Patient</SelectItem>
                <SelectItem value="provider">Provider</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {responseForm.payment ? (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Payment Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Payment Type</label>
                <Select
                  value={responseForm.payment.type}
                  onValueChange={(value) => {
                    const selectedType = PAYMENT_TYPES.find((t) => t.code === value);
                    if (selectedType && responseForm.payment) {
                      setResponseForm({
                        ...responseForm,
                        payment: {
                          ...responseForm.payment,
                          type: selectedType.code,
                        },
                      });
                    }
                  }}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_TYPES.map((type) => (
                      <SelectItem key={type.code} value={type.code}>
                        {type.display}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Payment Date</label>
                <Input
                  type="date"
                  value={responseForm.payment.date || ''}
                  onChange={(e) => {
                    if (responseForm.payment) {
                      setResponseForm({
                        ...responseForm,
                        payment: { ...responseForm.payment, date: e.target.value },
                      });
                    }
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Payment Amount (INR)</label>
                <Input
                  type="number"
                  value={responseForm.payment.amount.value}
                  onChange={(e) => {
                    if (responseForm.payment) {
                      setResponseForm({
                        ...responseForm,
                        payment: {
                          ...responseForm.payment,
                          amount: { ...responseForm.payment.amount, value: Number(e.target.value) },
                        },
                      });
                    }
                  }}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Adjustment Amount (INR)</label>
                <Input
                  type="number"
                  value={responseForm.payment.adjustment?.value || 0}
                  onChange={(e) => {
                    if (responseForm.payment) {
                      setResponseForm({
                        ...responseForm,
                        payment: {
                          ...responseForm.payment,
                          adjustment: { value: Number(e.target.value), currency: 'INR' },
                        },
                      });
                    }
                  }}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Payment Identifier</label>
                <Input
                  value={responseForm.payment.identifier?.value || ''}
                  onChange={(e) => {
                    if (responseForm.payment) {
                      setResponseForm({
                        ...responseForm,
                        payment: {
                          ...responseForm.payment,
                          identifier: { value: e.target.value },
                        },
                      });
                    }
                  }}
                  placeholder="Payment identifier"
                />
              </div>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setResponseForm({
                ...responseForm,
                payment: {
                  type: 'complete',
                  amount: { value: 0, currency: 'INR' },
                },
              });
            }}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Payment Details
          </Button>
        )}
      </div>

      <div className="bg-white rounded-lg border p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Header-level Adjudication
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const newAdj: AdjudicationType = {
                category: 'submitted',
                amount: { value: 0, currency: 'INR' },
                value: 0,
              };
              setResponseForm({
                ...responseForm,
                adjudication: [...(responseForm.adjudication || []), newAdj],
              });
            }}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Adjudication
          </Button>
        </div>

        {responseForm.adjudication && responseForm.adjudication.length === 0 && (
          <div className="text-center py-4 text-gray-500 border-2 border-dashed rounded-lg">
            <p className="text-sm">No adjudications added yet.</p>
            <p className="text-xs">Click "Add Adjudication" to get started.</p>
          </div>
        )}

        {responseForm.adjudication?.map((adj, i) => (
          <Card key={i} className="mb-4 border bg-white">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-semibold text-gray-700">Adjudication {i + 1}</h4>
                <button
                  type="button"
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  onClick={() => {
                    const updatedAdj =
                      responseForm.adjudication?.filter((_, idx) => idx !== i) || [];
                    setResponseForm({ ...responseForm, adjudication: updatedAdj });
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <Select
                    value={adj.category}
                    onValueChange={(value) => {
                      const selectedCat = ADJUDICATION_CATEGORIES.find((cat) => cat.code === value);
                      if (selectedCat && responseForm.adjudication) {
                        const updatedAdj = [...responseForm.adjudication];
                        updatedAdj[i].category = selectedCat.code;
                        setResponseForm({ ...responseForm, adjudication: updatedAdj });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {ADJUDICATION_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.code} value={cat.code}>
                          {cat.display}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Reason</label>
                  <Input
                    value={adj.reason || ''}
                    onChange={(e) => {
                      if (responseForm.adjudication) {
                        const updatedAdj = [...responseForm.adjudication];
                        updatedAdj[i].reason = e.target.value;
                        setResponseForm({ ...responseForm, adjudication: updatedAdj });
                      }
                    }}
                    placeholder="Adjudication reason"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Amount (INR)</label>
                  <Input
                    type="number"
                    value={adj.amount?.value || 0}
                    onChange={(e) => {
                      if (responseForm.adjudication) {
                        const updatedAdj = [...responseForm.adjudication];
                        updatedAdj[i].amount = { value: Number(e.target.value), currency: 'INR' };
                        setResponseForm({ ...responseForm, adjudication: updatedAdj });
                      }
                    }}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Value (for percentages)</label>
                  <Input
                    type="number"
                    value={adj.value || 0}
                    onChange={(e) => {
                      if (responseForm.adjudication) {
                        const updatedAdj = [...responseForm.adjudication];
                        updatedAdj[i].value = Number(e.target.value);
                        setResponseForm({ ...responseForm, adjudication: updatedAdj });
                      }
                    }}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="bg-white rounded-lg border-2 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Adjudication Totals
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const newTotal: TotalType = {
                category: 'submitted',
                amount: { value: 0, currency: 'INR' },
              };
              setResponseForm({
                ...responseForm,
                total: [...(responseForm.total || []), newTotal],
              });
            }}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Total
          </Button>
        </div>

        {responseForm.total && responseForm.total.length === 0 && (
          <div className="text-center py-4 text-gray-500 border-2 border-dashed rounded-lg">
            <p className="text-sm">No totals added yet.</p>
          </div>
        )}

        {responseForm.total?.map((total, i) => (
          <Card key={i} className="mb-4 border-2 bg-white">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-semibold text-gray-700">Total {i + 1}</h4>
                <button
                  type="button"
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  onClick={() => {
                    const updatedTotals = responseForm.total?.filter((_, idx) => idx !== i) || [];
                    setResponseForm({ ...responseForm, total: updatedTotals });
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <Select
                    value={total.category}
                    onValueChange={(value) => {
                      const selectedCat = TOTAL_CATEGORIES.find((cat) => cat.code === value);
                      if (selectedCat && responseForm.total) {
                        const updatedTotals = [...responseForm.total];
                        updatedTotals[i].category = selectedCat.code;
                        setResponseForm({ ...responseForm, total: updatedTotals });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {TOTAL_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.code} value={cat.code}>
                          {cat.display}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Amount (INR)</label>
                  <Input
                    type="number"
                    value={total.amount.value}
                    onChange={(e) => {
                      if (responseForm.total) {
                        const updatedTotals = [...responseForm.total];
                        updatedTotals[i].amount.value = Number(e.target.value);
                        setResponseForm({ ...responseForm, total: updatedTotals });
                      }
                    }}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="bg-white rounded-lg border-2 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Process Notes
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const newNote: ProcessNoteType = {
                number: (responseForm.processNote?.length || 0) + 1,
                type: 'display',
                text: '',
              };
              setResponseForm({
                ...responseForm,
                processNote: [...(responseForm.processNote || []), newNote],
              });
            }}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Note
          </Button>
        </div>

        {responseForm.processNote && responseForm.processNote.length === 0 && (
          <div className="text-center py-4 text-gray-500 border-2 border-dashed rounded-lg">
            <p className="text-sm">No process notes added yet.</p>
          </div>
        )}

        {responseForm.processNote?.map((note, i) => (
          <Card key={i} className="mb-4 border-2">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-semibold text-gray-700">Note {i + 1}</h4>
                <button
                  type="button"
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  onClick={() => {
                    const updatedNotes =
                      responseForm.processNote?.filter((_, idx) => idx !== i) || [];
                    setResponseForm({ ...responseForm, processNote: updatedNotes });
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <Select
                    value={note.type || 'display'}
                    onValueChange={(value) => {
                      if (responseForm.processNote) {
                        const updatedNotes = [...responseForm.processNote];
                        updatedNotes[i].type = value as 'display' | 'print' | 'printoper';
                        setResponseForm({ ...responseForm, processNote: updatedNotes });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {NOTE_TYPES.map((type) => (
                        <SelectItem key={type.code} value={type.code}>
                          {type.display}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Text *</label>
                  <Input
                    value={note.text}
                    onChange={(e) => {
                      if (responseForm.processNote) {
                        const updatedNotes = [...responseForm.processNote];
                        updatedNotes[i].text = e.target.value;
                        setResponseForm({ ...responseForm, processNote: updatedNotes });
                      }
                    }}
                    placeholder="Process note text"
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="bg-white rounded-lg border-2 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Item-level Adjudication
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const newItem: ItemAdjudicationType = {
                itemSequence: (responseForm.item?.length || 0) + 1,
                adjudication: [
                  {
                    category: 'submitted',
                    amount: { value: 0, currency: 'INR' },
                  },
                ],
              };
              setResponseForm({
                ...responseForm,
                item: [...(responseForm.item || []), newItem],
              });
            }}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </Button>
        </div>

        {(!responseForm.item || responseForm.item.length === 0) && (
          <div className="text-center py-6 text-gray-500 border-2 border-dashed rounded-lg">
            <p>No items to adjudicate yet.</p>
          </div>
        )}

        {responseForm.item?.map((item, i) => (
          <Card key={i} className="mb-4 border-2 bg-gray-50">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-semibold text-gray-700">Item {i + 1}</h4>
                <button
                  type="button"
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  onClick={() => {
                    const updatedItems = responseForm.item?.filter((_, idx) => idx !== i) || [];
                    setResponseForm({ ...responseForm, item: updatedItems });
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {claimItems?.[i] && (
                <div className="mb-4 p-4 bg-white rounded border text-sm text-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium">Product/Service:</span>
                      <span className="ml-1">{claimItems[i].productOrService || '—'}</span>
                    </div>
                    {claimItems[i].programCode && (
                      <div>
                        <span className="font-medium">Program Code:</span>
                        <span className="ml-1">{claimItems[i].programCode}</span>
                      </div>
                    )}
                    {claimItems[i].category && (
                      <div>
                        <span className="font-medium">Category:</span>
                        <span className="ml-1">{claimItems[i].category}</span>
                      </div>
                    )}
                    {claimItems[i].quantity && (
                      <div>
                        <span className="font-medium">Quantity:</span>
                        <span className="ml-1">
                          {claimItems[i].quantity.value} {claimItems[i].quantity.unit || ''}
                        </span>
                      </div>
                    )}
                    {claimItems[i].unitPrice && (
                      <div>
                        <span className="font-medium">Unit Price:</span>
                        <span className="ml-1">
                          {claimItems[i].unitPrice.value} {claimItems[i].unitPrice.currency}
                        </span>
                      </div>
                    )}
                    {claimItems[i].net && (
                      <div>
                        <span className="font-medium">Net:</span>
                        <span className="ml-1">
                          {claimItems[i].net.value} {claimItems[i].net.currency}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h5 className="font-medium">Item Adjudication</h5>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (responseForm.item) {
                        const updatedItems = [...responseForm.item];
                        updatedItems[i].adjudication.push({
                          category: 'submitted',
                          amount: { value: 0, currency: 'INR' },
                        });
                        setResponseForm({ ...responseForm, item: updatedItems });
                      }
                    }}
                    className="flex items-center gap-1 h-8 text-xs"
                  >
                    <Plus className="w-3 h-3" />
                    Add Adjudication
                  </Button>
                </div>

                {item.adjudication.map((adj, adjIndex) => (
                  <div
                    key={adjIndex}
                    className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] items-center gap-4 mb-4 p-4 bg-white rounded border"
                  >
                    <div>
                      <label className="block text-xs font-medium mb-1">Category</label>
                      <Select
                        value={adj.category}
                        onValueChange={(value) => {
                          const selectedCat = ADJUDICATION_CATEGORIES.find(
                            (cat) => cat.code === value,
                          );
                          if (selectedCat && responseForm.item) {
                            const updatedItems = [...responseForm.item];
                            updatedItems[i].adjudication[adjIndex].category = selectedCat.code;
                            setResponseForm({ ...responseForm, item: updatedItems });
                          }
                        }}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ADJUDICATION_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.code} value={cat.code}>
                              {cat.display}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Amount (INR)</label>
                      <Input
                        type="number"
                        value={adj.amount?.value || 0}
                        onChange={(e) => {
                          if (responseForm.item) {
                            const updatedItems = [...responseForm.item];
                            updatedItems[i].adjudication[adjIndex].amount = {
                              value: Number(e.target.value),
                              currency: 'INR',
                            };
                            setResponseForm({ ...responseForm, item: updatedItems });
                          }
                        }}
                        className="h-8"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="flex items-center justify-end h-full">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (responseForm.item) {
                            const updatedItems = [...responseForm.item];
                            updatedItems[i].adjudication = updatedItems[i].adjudication.filter(
                              (_, idx) => idx !== adjIndex,
                            );
                            setResponseForm({ ...responseForm, item: updatedItems });
                          }
                        }}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="bg-white rounded-lg border-2 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Insurer Added Items
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const newAddItem: AddItemType = {
                productOrService: '',
                quantity: {
                  value: 1,
                  unit: 'each',
                  system: 'http://unitsofmeasure.org',
                  code: '1',
                },
                unitPrice: { value: 0, currency: 'INR' },
                factor: 1,
                net: { value: 0, currency: 'INR' },
                adjudication: [
                  {
                    category: 'submitted',
                    amount: { value: 0, currency: 'INR' },
                  },
                ],
              };
              setResponseForm({
                ...responseForm,
                addItem: [...(responseForm.addItem || []), newAddItem],
              });
            }}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </Button>
        </div>

        {(!responseForm.addItem || responseForm.addItem.length === 0) && (
          <div className="text-center py-6 text-gray-500 border-2 border-dashed rounded-lg">
            <p>No insurer-added items yet.</p>
          </div>
        )}

        {responseForm.addItem?.map((addItem, i) => (
          <Card key={i} className="mb-4 border-2 bg-gray-50">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-semibold text-gray-700">Added Item {i + 1}</h4>
                <button
                  type="button"
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  onClick={() => {
                    const updatedAddItems =
                      responseForm.addItem?.filter((_, idx) => idx !== i) || [];
                    setResponseForm({ ...responseForm, addItem: updatedAddItems });
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Product/Service Code</label>
                  <Input
                    value={addItem.productOrService}
                    onChange={(e) => {
                      if (responseForm.addItem) {
                        const updatedAddItems = [...responseForm.addItem];
                        updatedAddItems[i].productOrService = e.target.value;
                        setResponseForm({ ...responseForm, addItem: updatedAddItems });
                      }
                    }}
                    placeholder="SNOMED-CT code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Quantity</label>
                  <Input
                    type="number"
                    value={addItem.quantity?.value || 1}
                    onChange={(e) => {
                      if (responseForm.addItem && addItem.quantity) {
                        const updatedAddItems = [...responseForm.addItem];
                        updatedAddItems[i].quantity!.value = Number(e.target.value);
                        setResponseForm({ ...responseForm, addItem: updatedAddItems });
                      }
                    }}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Unit Price (INR)</label>
                  <Input
                    type="number"
                    value={addItem.unitPrice?.value || 0}
                    onChange={(e) => {
                      if (responseForm.addItem) {
                        const updatedAddItems = [...responseForm.addItem];
                        updatedAddItems[i].unitPrice = {
                          value: Number(e.target.value),
                          currency: 'INR',
                        };
                        setResponseForm({ ...responseForm, addItem: updatedAddItems });
                      }
                    }}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Factor</label>
                  <Input
                    type="number"
                    value={addItem.factor || 1}
                    onChange={(e) => {
                      if (responseForm.addItem) {
                        const updatedAddItems = [...responseForm.addItem];
                        updatedAddItems[i].factor = Number(e.target.value);
                        setResponseForm({ ...responseForm, addItem: updatedAddItems });
                      }
                    }}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Net Amount (INR)</label>
                  <Input
                    type="number"
                    value={addItem.net?.value || 0}
                    onChange={(e) => {
                      if (responseForm.addItem) {
                        const updatedAddItems = [...responseForm.addItem];
                        updatedAddItems[i].net = { value: Number(e.target.value), currency: 'INR' };
                        setResponseForm({ ...responseForm, addItem: updatedAddItems });
                      }
                    }}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h5 className="font-medium">Item Adjudication</h5>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (responseForm.addItem) {
                        const updatedAddItems = [...responseForm.addItem];
                        updatedAddItems[i].adjudication.push({
                          category: 'submitted',
                          amount: { value: 0, currency: 'INR' },
                        });
                        setResponseForm({ ...responseForm, addItem: updatedAddItems });
                      }
                    }}
                    className="flex items-center gap-1 h-8 text-xs"
                  >
                    <Plus className="w-3 h-3" />
                    Add Adjudication
                  </Button>
                </div>

                {addItem.adjudication.map((adj, adjIndex) => (
                  <div
                    key={adjIndex}
                    className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] items-center gap-4 mb-4 p-4 bg-white rounded border"
                  >
                    <div>
                      <label className="block text-xs font-medium mb-1">Category</label>
                      <Select
                        value={adj.category}
                        onValueChange={(value) => {
                          const selectedCat = ADJUDICATION_CATEGORIES.find(
                            (cat) => cat.code === value,
                          );
                          if (selectedCat && responseForm.addItem) {
                            const updatedAddItems = [...responseForm.addItem];
                            updatedAddItems[i].adjudication[adjIndex].category = selectedCat.code;
                            setResponseForm({ ...responseForm, addItem: updatedAddItems });
                          }
                        }}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ADJUDICATION_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.code} value={cat.code}>
                              {cat.display}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Amount (INR)</label>
                      <Input
                        type="number"
                        value={adj.amount?.value || 0}
                        onChange={(e) => {
                          if (responseForm.addItem) {
                            const updatedAddItems = [...responseForm.addItem];
                            updatedAddItems[i].adjudication[adjIndex].amount = {
                              value: Number(e.target.value),
                              currency: 'INR',
                            };
                            setResponseForm({ ...responseForm, addItem: updatedAddItems });
                          }
                        }}
                        className="h-8"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="flex items-center justify-end h-full">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (responseForm.addItem) {
                            const updatedAddItems = [...responseForm.addItem];
                            updatedAddItems[i].adjudication = updatedAddItems[
                              i
                            ].adjudication.filter((_, idx) => idx !== adjIndex);
                            setResponseForm({ ...responseForm, addItem: updatedAddItems });
                          }
                        }}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="bg-white rounded-lg border-2 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold flex items-center">
            <Building2 className="w-5 h-5 mr-2" />
            Insurance Information
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const newInsurance: InsuranceType = {
                sequence: (responseForm.insurance?.length || 0) + 1,
                focal: responseForm.insurance?.length === 0,
                coverage: { reference: '' },
              };
              setResponseForm({
                ...responseForm,
                insurance: [...(responseForm.insurance || []), newInsurance],
              });
            }}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Insurance
          </Button>
        </div>

        {responseForm.insurance?.map((insurance, i) => (
          <Card key={i} className="mb-4 border-2">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-semibold text-gray-700">Insurance {i + 1}</h4>
                <button
                  type="button"
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  onClick={() => {
                    const updatedInsurance =
                      responseForm.insurance?.filter((_, idx) => idx !== i) || [];
                    setResponseForm({ ...responseForm, insurance: updatedInsurance });
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Focal *</label>
                  <Select
                    value={insurance.focal.toString()}
                    onValueChange={(value) => {
                      if (responseForm.insurance) {
                        const updatedInsurance = [...responseForm.insurance];
                        updatedInsurance[i].focal = value === 'true';
                        setResponseForm({ ...responseForm, insurance: updatedInsurance });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes (Primary)</SelectItem>
                      <SelectItem value="false">No (Secondary)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Coverage Reference *</label>
                  <Input
                    value={insurance.coverage.reference}
                    onChange={(e) => {
                      if (responseForm.insurance) {
                        const updatedInsurance = [...responseForm.insurance];
                        updatedInsurance[i].coverage.reference = e.target.value;
                        setResponseForm({ ...responseForm, insurance: updatedInsurance });
                      }
                    }}
                    placeholder="Coverage/coverage-001"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Business Arrangement</label>
                  <Input
                    value={insurance.businessArrangement || ''}
                    onChange={(e) => {
                      if (responseForm.insurance) {
                        const updatedInsurance = [...responseForm.insurance];
                        updatedInsurance[i].businessArrangement = e.target.value;
                        setResponseForm({ ...responseForm, insurance: updatedInsurance });
                      }
                    }}
                    placeholder="Provider contract number"
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="bg-white rounded-lg border-2 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Processing Errors
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const newError: ErrorType = {
                code: 'a001',
              };
              setResponseForm({
                ...responseForm,
                error: [...(responseForm.error || []), newError],
              });
            }}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Error
          </Button>
        </div>

        {(!responseForm.error || responseForm.error.length === 0) && (
          <div className="text-center py-4 text-gray-500 border-2 border-dashed rounded-lg">
            <p className="text-sm">No processing errors added.</p>
          </div>
        )}

        {responseForm.error?.map((error, i) => (
          <Card key={i} className="mb-4 border-2 bg-white">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-semibold text-gray-700">Error {i + 1}</h4>
                <button
                  type="button"
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  onClick={() => {
                    const updatedErrors = responseForm.error?.filter((_, idx) => idx !== i) || [];
                    setResponseForm({ ...responseForm, error: updatedErrors });
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Error Code *</label>
                  <Select
                    value={error.code}
                    onValueChange={(value) => {
                      if (responseForm.error) {
                        const updatedErrors = [...responseForm.error];
                        updatedErrors[i].code = value;
                        setResponseForm({ ...responseForm, error: updatedErrors });
                      }
                    }}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select error code" />
                    </SelectTrigger>
                    <SelectContent>
                      {ERROR_CODES.map((opt) => (
                        <SelectItem key={opt.code} value={opt.code}>
                          {opt.display}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Additional Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Form Code</label>
            <Input
              value={responseForm.formCode || ''}
              onChange={(e) => {
                setResponseForm({
                  ...responseForm,
                  formCode: e.target.value,
                });
              }}
              placeholder="Form identifier"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Communication Request References
            </label>
            <Input
              value={responseForm.communicationRequest?.map((cr) => cr.reference).join(', ') || ''}
              onChange={(e) => {
                const refs = e.target.value
                  .split(',')
                  .map((ref) => ({ reference: ref.trim() }))
                  .filter((ref) => ref.reference);
                setResponseForm({ ...responseForm, communicationRequest: refs });
              }}
              placeholder="CommunicationRequest/req-001, CommunicationRequest/req-002"
            />
          </div>
        </div>
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
          {responseSubmitting ? 'Submitting Response...' : 'Submit Response'}
        </Button>
      </div>
    </form>
  );
};

export default ClaimAdjudicateForm;
