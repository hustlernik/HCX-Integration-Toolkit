import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/dashboard/Sidebar';
import { payerSidebarSections } from '@/constants/sidebarSections';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Filter,
  ChevronDown,
  X,
  FileText,
  User,
  CreditCard,
  Stethoscope,
  Link,
  Clock,
  Shield,
  ChevronUp,
  Gavel,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Pagination from '@/components/ui/pagination';
import ClaimAdjudicateForm from '../components/claim/AdjudicateForm';
import { ClaimResponseFormType, Claim } from '@/interfaces/claim';
import CommunicationRequestForm from '../components/communication/CommunicationRequestForm';
import { CommunicationRequestData } from '@/interfaces/communication';
import axios from 'axios';
import { API_ENDPOINTS } from '@/config/api';

const Claims: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [filteredClaims, setFilteredClaims] = useState<Claim[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const priorityDropdownRef = useRef<HTMLDivElement>(null);
  const pageSize = 10;
  const [showRaw, setShowRaw] = useState(false);
  const [responseAction, setResponseAction] = useState<
    'adjudicate' | 'request-info' | 'approve' | 'reject' | 'query' | null
  >(null);
  const [responseForm, setResponseForm] = useState<ClaimResponseFormType>({
    status: 'draft',
    type: '',
    use: 'claim',
    patient: { reference: '' },
    created: '',
    insurer: { reference: '' },
    outcome: 'queued',
    disposition: '',
    preAuthRef: '',
    preAuthPeriod: { start: '', end: '' },
    adjudication: [],
    item: [],
    addItem: [],
    processNote: [],
    insurance: [],
    total: [],
    error: [],
    communicationRequest: [],
  });
  const [responseSubmitting, setResponseSubmitting] = useState(false);

  useEffect(() => {
    if (responseAction === 'adjudicate' && selectedClaim) {
      const mappedFundsReserve = selectedClaim.fundsReserve
        ? selectedClaim.fundsReserve.toLowerCase()
        : undefined;
      const mappedPayeeType =
        Array.isArray(selectedClaim.payee) && selectedClaim.payee.length > 0
          ? ['subscriber', 'provider', 'other'].includes(
              selectedClaim.payee[0].type?.toLowerCase() || '',
            )
            ? (selectedClaim.payee[0].type?.toLowerCase() as 'subscriber' | 'provider' | 'other')
            : undefined
          : undefined;

      setResponseForm({
        status: 'active',
        type: selectedClaim.type,
        subType: selectedClaim.subType,
        use: selectedClaim.use,
        patient: {
          reference: `Patient/${selectedClaim.patient?.id || selectedClaim.patient?.identifier || 'unknown'}`,
          display: selectedClaim.patient?.name,
        },
        created: new Date().toISOString(),
        insurer: {
          reference: `Organization/${selectedClaim.insurer?.id || 'insurer'}`,
          display: selectedClaim.insurer?.name,
        },
        request: { reference: `Claim/${selectedClaim.claimId}` },
        outcome: 'queued',
        disposition: '',
        preAuthRef: '',
        preAuthPeriod: { start: '', end: '' },
        adjudication: [],
        item: (selectedClaim.item || []).map((it, idx) => ({
          itemSequence: idx + 1,
          adjudication: [
            {
              category: 'submitted',
              amount: { value: Number(it?.net?.value || 0), currency: it?.net?.currency || 'INR' },
            },
          ],
        })),
        addItem: [],
        processNote: [],
        insurance: [],
        total: selectedClaim.total
          ? [
              {
                category: 'submitted',
                amount: {
                  value: Number(selectedClaim.total.value || 0),
                  currency: selectedClaim.total.currency || 'INR',
                },
              },
            ]
          : [],
        error: [],
        communicationRequest: [],
        fundsReserve: mappedFundsReserve,
        payeeType: mappedPayeeType,
      });
    }
  }, [responseAction, selectedClaim]);

  useEffect(() => {
    fetchClaims();
  }, []);

  const filterClaims = useCallback(() => {
    let filtered = claims.filter((claim) => claim.use === 'claim');

    if (searchTerm) {
      filtered = filtered.filter(
        (claim) =>
          claim.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          claim.provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          claim.claimId.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((claim) => claim.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter((claim) => claim.priority === priorityFilter);
    }

    setFilteredClaims(filtered);
  }, [claims, searchTerm, statusFilter, priorityFilter]);

  useEffect(() => {
    filterClaims();
  }, [filterClaims]);

  const fetchClaims = async () => {
    try {
      const resp = await axios.get(API_ENDPOINTS.PAYER.CLAIMS, { validateStatus: () => true });
      const data = Array.isArray(resp.data?.data) ? resp.data.data : resp.data;
      setClaims(Array.isArray(data) ? data : []);
      console.log('Fetched claims:', data);
    } catch (error) {
      console.error('Error fetching claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      cancelled: 'destructive',
      draft: 'outline',
      'entered-in-error': 'secondary',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      Immediate: 'destructive',
      Normal: 'secondary',
      Deferred: 'outline',
    };

    return <Badge variant={variants[priority] || 'outline'}>{priority}</Badge>;
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-IN');
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setShowStatusDropdown(false);
      }
      if (
        priorityDropdownRef.current &&
        !priorityDropdownRef.current.contains(event.target as Node)
      ) {
        setShowPriorityDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const paginated = filteredClaims.slice((page - 1) * pageSize, page * pageSize);

  const handleCommunicationRequest = async (data: CommunicationRequestData) => {
    if (!selectedClaim) return;

    setResponseSubmitting(true);

    try {
      console.log('Communication request data received in Claims.tsx:', data);

      setResponseAction(null);
    } catch (error) {
      console.error('Error handling communication request:', error);
    } finally {
      setResponseSubmitting(false);
    }
  };

  const handleResponseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResponseSubmitting(true);

    const mapAdjEntry = (adj: any) => ({
      category: adj?.category || '',
      reason: adj?.reason || '',
      amount: adj?.amount
        ? { value: Number(adj.amount.value || 0), currency: adj.amount.currency || 'INR' }
        : undefined,
      value: typeof adj?.value === 'number' ? adj.value : undefined,
    });

    const mapAdjWrapperArray = (entries?: any[]) =>
      (entries || []).map((adj) => ({ adjudication: [mapAdjEntry(adj)] }));

    const mappedHeaderAdjudication = mapAdjWrapperArray((responseForm as any).adjudication);

    const mappedItems = responseForm.item
      ? responseForm.item.map((it: any) => ({
          itemSequence: it.itemSequence,
          adjudication: it.adjudication || [],
          detail: undefined,
        }))
      : [];

    const mappedAddItems = (responseForm as any).addItem
      ? (responseForm as any).addItem.map((ai: any) => ({
          productOrService: ai.productOrService || '',
          programCode:
            Array.isArray(ai.programCode) && ai.programCode.length > 0 ? ai.programCode[0] : '',
          quantity: ai.quantity
            ? {
                value: Number(ai.quantity.value || 0),
                unit: ai.quantity.unit || '',
                code: ai.quantity.code || '',
              }
            : undefined,
          unitPrice: ai.unitPrice
            ? { value: Number(ai.unitPrice.value || 0), currency: ai.unitPrice.currency || 'INR' }
            : undefined,
          factor: typeof ai.factor === 'number' ? ai.factor : undefined,
          net: ai.net
            ? { value: Number(ai.net.value || 0), currency: ai.net.currency || 'INR' }
            : undefined,
          bodySite: ai.bodySite || undefined,
          subSite: Array.isArray(ai.subSite) && ai.subSite.length > 0 ? ai.subSite[0] : undefined,
          adjudication: mapAdjWrapperArray(ai.adjudication),
        }))
      : [];

    const mappedTotals = (responseForm as any).total
      ? (responseForm as any).total.map((t: any) => ({
          category: t.category || '',
          amount: { value: Number(t?.amount?.value || 0), currency: t?.amount?.currency || 'INR' },
        }))
      : [];

    const mappedProcessNotes = (responseForm as any).processNote
      ? (responseForm as any).processNote.map((pn: any) => ({
          type: pn?.type || undefined,
          text: pn?.text || '',
        }))
      : [];

    const mappedInsurance = (responseForm as any).insurance
      ? (responseForm as any).insurance.map((ins: any) => ({
          focal: !!ins?.focal,
          coverage: ins?.coverage?.reference ? { id: ins.coverage.reference } : undefined,
        }))
      : [];

    const payload: any = {
      claimId: selectedClaim?.claimId,
      correlationId: selectedClaim?.correlationId,
      fhirRefId: selectedClaim?.fhirRefId,
      status: 'active',
      type: selectedClaim?.type,
      subType: selectedClaim?.subType,
      use: selectedClaim?.use,
      patient: selectedClaim?.patient,
      created: new Date(),
      insurer: selectedClaim?.insurer,
      outcome: (responseForm as any).outcome || 'queued',
      disposition: (responseForm as any).disposition || '',
      preAuthRef: (responseForm as any).preAuthRef || '',
      preAuthPeriod: (responseForm as any).preAuthPeriod
        ? {
            start: (responseForm as any).preAuthPeriod.start || undefined,
            end: (responseForm as any).preAuthPeriod.end || undefined,
          }
        : undefined,
      payeeType: (responseForm as any).payeeType || undefined,
      fundsReserve: (responseForm as any).fundsReserve || undefined,
      adjudication: mappedHeaderAdjudication,
      item: mappedItems,
      addItem: mappedAddItems,
      processNote: mappedProcessNotes,
      formCode: (responseForm as any).formCode || undefined,
      payment: (responseForm as any).payment
        ? {
            type: (responseForm as any).payment.type || '',
            adjustment: (responseForm as any).payment.adjustment
              ? {
                  value: Number((responseForm as any).payment.adjustment.value || 0),
                  currency: (responseForm as any).payment.adjustment.currency || 'INR',
                }
              : undefined,
            adjustmentReason: (responseForm as any).payment.adjustmentReason || undefined,
            amount: (responseForm as any).payment.amount
              ? {
                  value: Number((responseForm as any).payment.amount.value || 0),
                  currency: (responseForm as any).payment.amount.currency || 'INR',
                }
              : { value: 0, currency: 'INR' },
          }
        : undefined,
      communicationRequestId:
        Array.isArray((responseForm as any).communicationRequest) &&
        (responseForm as any).communicationRequest.length > 0
          ? (responseForm as any).communicationRequest[0].reference
          : undefined,
      insurance: mappedInsurance,
      total: mappedTotals,
      error:
        Array.isArray((responseForm as any).error) && (responseForm as any).error.length > 0
          ? (responseForm as any).error[0]?.code
          : typeof (responseForm as any).error === 'string'
            ? (responseForm as any).error
            : undefined,
    };

    try {
      const resp = await axios.post(API_ENDPOINTS.PAYER.CLAIM_ADJUDICATE, payload, {
        headers: { 'Content-Type': 'application/json' },
        validateStatus: () => true,
      });

      if (resp.status >= 200 && resp.status < 300) {
        console.log('Claim response submitted successfully');
        setResponseAction(null);

        setResponseForm({
          status: 'draft',
          type: '',
          use: 'claim',
          patient: { reference: '' },
          created: '',
          insurer: { reference: '' },
          outcome: 'queued',
          disposition: '',
          preAuthRef: '',
          preAuthPeriod: { start: '', end: '' },
          adjudication: [],
          item: [],
          addItem: [],
          processNote: [],
          insurance: [],
          total: [],
          error: [],
          communicationRequest: [],
        });
      } else {
        console.error('Failed to submit claim response:', resp.status, resp.data);
      }
    } catch (error) {
      console.error('Error submitting claim response:', error);
    } finally {
      setResponseSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <Sidebar sections={payerSidebarSections} />
        <main className="ml-64 p-8 min-h-[calc(100vh-4rem)] bg-gray-50">
          <h1 className="text-2xl font-bold mb-6">Claims</h1>
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span>Loading claims data...</span>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <Sidebar sections={payerSidebarSections} />
      <main className="ml-64 p-8 min-h-[calc(100vh-4rem)] bg-gray-50">
        <h1 className="text-2xl font-bold mb-6">Claims</h1>

        <div className="flex flex-col sm:flex-row gap-4 mb-4 items-center">
          <div className="relative flex-1 w-full max-w-xl">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search claims by patient, provider, or claim ID..."
              className="pl-10 pr-3 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative" ref={statusDropdownRef}>
            <button
              type="button"
              className="flex items-center gap-2 pl-3 pr-4 py-2 border rounded-md bg-white text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => setShowStatusDropdown((v) => !v)}
            >
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              <span>{statusFilter === 'all' ? 'All Status' : statusFilter}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {showStatusDropdown && (
              <div className="absolute left-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-10">
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => {
                    setStatusFilter('all');
                    setShowStatusDropdown(false);
                  }}
                >
                  All Status
                </button>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => {
                    setStatusFilter('active');
                    setShowStatusDropdown(false);
                  }}
                >
                  Active
                </button>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => {
                    setStatusFilter('draft');
                    setShowStatusDropdown(false);
                  }}
                >
                  Draft
                </button>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => {
                    setStatusFilter('cancelled');
                    setShowStatusDropdown(false);
                  }}
                >
                  Cancelled
                </button>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => {
                    setStatusFilter('entered-in-error');
                    setShowStatusDropdown(false);
                  }}
                >
                  Entered in Error
                </button>
              </div>
            )}
          </div>

          <div className="relative" ref={priorityDropdownRef}>
            <button
              type="button"
              className="flex items-center gap-2 pl-3 pr-4 py-2 border rounded-md bg-white text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => setShowPriorityDropdown((v) => !v)}
            >
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              <span>{priorityFilter === 'all' ? 'All Priority' : priorityFilter}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {showPriorityDropdown && (
              <div className="absolute left-0 mt-2 w-40 bg-white border rounded-md shadow-lg z-10">
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => {
                    setPriorityFilter('all');
                    setShowPriorityDropdown(false);
                  }}
                >
                  All Priority
                </button>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => {
                    setPriorityFilter('Immediate');
                    setShowPriorityDropdown(false);
                  }}
                >
                  Immediate
                </button>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => {
                    setPriorityFilter('Normal');
                    setShowPriorityDropdown(false);
                  }}
                >
                  Normal
                </button>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => {
                    setPriorityFilter('Deferred');
                    setShowPriorityDropdown(false);
                  }}
                >
                  Deferred
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Claim ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Use</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((claim) => (
                <TableRow key={claim.claimId}>
                  <TableCell className="font-mono text-sm">{claim.claimId}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{claim.patient?.name}</div>
                      <div className="text-sm text-gray-500">
                        {formatDate(claim.billablePeriod?.start)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{claim.provider?.name}</TableCell>
                  <TableCell>
                    <div className="">
                      <Badge variant="default">{claim.use}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {formatCurrency(claim.total?.value, claim.total?.currency)}
                    </div>
                  </TableCell>
                  <TableCell>{getPriorityBadge(claim.priority)}</TableCell>
                  <TableCell>{getStatusBadge(claim.status)}</TableCell>
                  <TableCell>
                    <button
                      className="text-primary font-medium hover:underline"
                      onClick={() => setSelectedClaim(claim)}
                    >
                      View
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination
            currentPage={page}
            pageSize={pageSize}
            totalItems={filteredClaims.length}
            onPageChange={setPage}
            label="claims"
          />
        </div>

        {selectedClaim && (
          <div className="fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black/30" onClick={() => setSelectedClaim(null)} />
            <div className="relative ml-auto w-full max-w-4xl h-full bg-white shadow-xl p-8 overflow-y-auto">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                onClick={() => setSelectedClaim(null)}
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-xl font-bold mb-6">Claim Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Patient Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Name:</span> {selectedClaim.patient.name}
                    </div>
                    <div>
                      <span className="font-medium">Patient ID:</span> {selectedClaim.patient.id}
                    </div>
                    <div>
                      <span className="font-medium">DOB:</span>{' '}
                      {formatDate(selectedClaim.patient.dob)}
                    </div>
                    <div>
                      <span className="font-medium">Gender:</span> {selectedClaim.patient.gender}
                    </div>
                    <div>
                      <span className="font-medium">Identifier:</span>{' '}
                      {selectedClaim.patient.identifier}
                    </div>
                    <div>
                      <span className="font-medium">Service Period:</span>{' '}
                      {formatDate(selectedClaim.billablePeriod.start)} -{' '}
                      {formatDate(selectedClaim.billablePeriod.end)}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>{' '}
                      {getStatusBadge(selectedClaim.status)}
                    </div>
                    <div>
                      <span className="font-medium">Priority:</span>{' '}
                      {getPriorityBadge(selectedClaim.priority)}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    Policy & Coverage
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Insurer:</span> {selectedClaim?.insurer?.name}
                    </div>
                    <div>
                      <span className="font-medium">Provider:</span> {selectedClaim?.provider?.name}
                    </div>
                    <div>
                      <span className="font-medium">Type:</span> {selectedClaim?.type}
                    </div>
                    {selectedClaim.subType && (
                      <div>
                        <span className="font-medium">Sub Type:</span> {selectedClaim?.subType}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Use:</span> {selectedClaim?.use}
                    </div>
                    <div>
                      <span className="font-medium">Funds Reserve:</span>{' '}
                      {selectedClaim?.fundsReserve}
                    </div>
                    {selectedClaim.insurance.map((ins, index) => (
                      <div key={index} className="border-t pt-2">
                        <div>
                          <span className="font-medium">Policy Number:</span>{' '}
                          {ins.coverage.policyNumber}
                        </div>
                        <div>
                          <span className="font-medium">Plan:</span> {ins.coverage.plan}
                        </div>
                        <div>
                          <span className="font-medium">Payor:</span> {ins.coverage.payor}
                        </div>
                        <div>
                          <span className="font-medium">Focal:</span> {ins.focal ? 'Yes' : 'No'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {selectedClaim.related && selectedClaim.related.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <Link className="w-4 h-4 mr-2" />
                    Related Claims
                  </h3>
                  <div className="space-y-2 text-sm">
                    {selectedClaim.related.map((rel, index) => (
                      <div key={index}>
                        <div>
                          <span className="font-medium">Related Claim ID:</span>{' '}
                          {rel.relatedClaimId}
                        </div>
                        <div>
                          <span className="font-medium">Relationship:</span> {rel.relationship}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedClaim.enterer && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Entered By
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Name:</span> {selectedClaim.enterer.name}
                    </div>
                    <div>
                      <span className="font-medium">Qualification:</span>{' '}
                      {selectedClaim.enterer.qualification}
                    </div>
                    <div>
                      <span className="font-medium">Identifier:</span>{' '}
                      {selectedClaim.enterer.identifier}
                    </div>
                  </div>
                </div>
              )}

              {selectedClaim.careTeam && selectedClaim.careTeam.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <Stethoscope className="w-4 h-4 mr-2" />
                    Care Team
                  </h3>
                  <div className="space-y-2">
                    {selectedClaim.careTeam.map((member, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-white rounded"
                      >
                        <div>
                          <div className="font-medium">{member.role}</div>
                          <div className="text-sm text-gray-600">{member.qualification}</div>
                        </div>
                        <Badge variant={member.isResponsible ? 'default' : 'outline'}>
                          {member.isResponsible ? 'Responsible' : 'Supporting'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedClaim.diagnosis && selectedClaim.diagnosis.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Diagnosis
                  </h3>
                  <div className="space-y-2">
                    {selectedClaim.diagnosis.map((diag, index) => (
                      <div key={index} className="p-3 bg-white rounded border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Diagnosis {index + 1}</span>
                          <Badge variant="outline">{diag.type}</Badge>
                        </div>
                        <div className="text-sm">
                          <div>
                            <span className="font-medium">Diagnosis:</span> {diag.diagnosis}
                          </div>
                          {diag.onAdmission && (
                            <div>
                              <span className="font-medium">On Admission:</span> {diag.onAdmission}
                            </div>
                          )}
                          {diag.packageCode && (
                            <div>
                              <span className="font-medium">Package Code:</span> {diag.packageCode}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedClaim.procedure && selectedClaim.procedure.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <Stethoscope className="w-4 h-4 mr-2" />
                    Procedures
                  </h3>
                  <div className="space-y-2">
                    {selectedClaim.procedure.map((proc, index) => (
                      <div key={index} className="p-3 bg-white rounded border">
                        <div className="text-sm">
                          <div>
                            <span className="font-medium">Type:</span> {proc.type}
                          </div>
                          <div>
                            <span className="font-medium">Procedure:</span> {proc.procedure}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-semibold mb-3 flex items-center">
                  <Stethoscope className="w-4 h-4 mr-2" />
                  Services Rendered
                </h3>
                <div className="bg-white border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Factor</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedClaim.item.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.productOrService}</div>
                              <div className="text-sm text-gray-500">{item.programCode}</div>
                            </div>
                          </TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>{item.revenue}</TableCell>
                          <TableCell>
                            {item.quantity.value} {item.quantity.unit}
                            {item.quantity.code && (
                              <div className="text-sm text-gray-500">{item.quantity.code}</div>
                            )}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(item.unitPrice.value, item.unitPrice.currency)}
                          </TableCell>
                          <TableCell>{item.factor}</TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(item.net.value, item.net.currency)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="p-4 bg-gray-50 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total Amount:</span>
                      <span className="font-bold text-lg">
                        {formatCurrency(selectedClaim.total.value, selectedClaim.total.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedClaim.supportingInfo && selectedClaim.supportingInfo.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Supporting Information
                  </h3>
                  <div className="space-y-2">
                    {selectedClaim.supportingInfo.map((info, index) => (
                      <div key={index} className="p-3 bg-white rounded border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Info {index + 1}</span>
                          <Badge variant="outline">{info.category}</Badge>
                        </div>
                        <div className="text-sm">
                          <div>
                            <span className="font-medium">Code:</span> {info.code}
                          </div>
                          <div>
                            <span className="font-medium">Reason:</span> {info.reason}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedClaim.prescription && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Prescription
                  </h3>
                  <div className="space-y-4">
                    {selectedClaim.prescription.medicationRequest && (
                      <div className="p-3 bg-white rounded border">
                        <h4 className="font-medium mb-2">Medication Request</h4>
                        <div className="text-sm space-y-1">
                          <div>
                            <span className="font-medium">Intent:</span>{' '}
                            {selectedClaim.prescription.medicationRequest.intent}
                          </div>
                          {selectedClaim.prescription.medicationRequest.medication.length > 0 && (
                            <div>
                              <span className="font-medium">Medications:</span>{' '}
                              {selectedClaim.prescription.medicationRequest.medication.join(', ')}
                            </div>
                          )}
                          {selectedClaim.prescription.medicationRequest.reason.length > 0 && (
                            <div>
                              <span className="font-medium">Reasons:</span>{' '}
                              {selectedClaim.prescription.medicationRequest.reason.join(', ')}
                            </div>
                          )}
                          {selectedClaim.prescription.medicationRequest.dosageInstruction.map(
                            (dosage, idx) => (
                              <div key={idx} className="border-t pt-1 mt-2">
                                <div>
                                  <span className="font-medium">Dosage {idx + 1}:</span>{' '}
                                  {dosage.text}
                                </div>
                                {dosage.additionalInstruction && (
                                  <div>
                                    <span className="font-medium">Additional:</span>{' '}
                                    {dosage.additionalInstruction}
                                  </div>
                                )}
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                    {selectedClaim.prescription.deviceRequest && (
                      <div className="p-3 bg-white rounded border">
                        <h4 className="font-medium mb-2">Device Request</h4>
                        <div className="text-sm space-y-1">
                          <div>
                            <span className="font-medium">Intent:</span>{' '}
                            {selectedClaim.prescription.deviceRequest.intent}
                          </div>
                          <div>
                            <span className="font-medium">Priority:</span>{' '}
                            {selectedClaim.prescription.deviceRequest.priority}
                          </div>
                          <div>
                            <span className="font-medium">Device:</span>{' '}
                            {selectedClaim.prescription.deviceRequest.deviceRequested}
                          </div>
                          {selectedClaim.prescription.deviceRequest.note && (
                            <div>
                              <span className="font-medium">Note:</span>{' '}
                              {selectedClaim.prescription.deviceRequest.note}
                            </div>
                          )}
                          {selectedClaim.prescription.deviceRequest.reason.length > 0 && (
                            <div>
                              <span className="font-medium">Reasons:</span>{' '}
                              {selectedClaim.prescription.deviceRequest.reason.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedClaim.prescription.visionPrescription && (
                      <div className="p-3 bg-white rounded border">
                        <h4 className="font-medium mb-2">Vision Prescription</h4>
                        <div className="space-y-2">
                          {selectedClaim.prescription.visionPrescription.lensSpecification.map(
                            (lens, idx) => (
                              <div key={idx} className="text-sm border rounded p-2">
                                <div className="font-medium mb-1">
                                  Lens {idx + 1} ({lens.eye})
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <span className="font-medium">Product:</span> {lens.product}
                                  </div>
                                  <div>
                                    <span className="font-medium">Sphere:</span> {lens.sphere}
                                  </div>
                                  <div>
                                    <span className="font-medium">Cylinder:</span> {lens.cylinder}
                                  </div>
                                  <div>
                                    <span className="font-medium">Axis:</span> {lens.axis}
                                  </div>
                                  <div>
                                    <span className="font-medium">Add:</span> {lens.add}
                                  </div>
                                  <div>
                                    <span className="font-medium">Power:</span> {lens.power}
                                  </div>
                                  {lens.backCurve && (
                                    <div>
                                      <span className="font-medium">Back Curve:</span>{' '}
                                      {lens.backCurve}
                                    </div>
                                  )}
                                  {lens.diameter && (
                                    <div>
                                      <span className="font-medium">Diameter:</span> {lens.diameter}
                                    </div>
                                  )}
                                </div>
                                {lens.note && (
                                  <div className="mt-1">
                                    <span className="font-medium">Note:</span> {lens.note}
                                  </div>
                                )}
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedClaim.payee && selectedClaim.payee.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Payee Information
                  </h3>
                  <div className="space-y-2">
                    {selectedClaim.payee.map((payee, index) => (
                      <div key={index} className="p-3 bg-white rounded border">
                        <div className="text-sm">
                          <div>
                            <span className="font-medium">Type:</span> {payee.type}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold mb-3 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Raw Claim Data
                </h3>
                <div className="space-y-2">
                  <button
                    className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                    onClick={() => setShowRaw((v) => !v)}
                  >
                    {showRaw ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                    {showRaw ? 'Hide' : 'Show'} Raw Claim Data
                  </button>
                  {showRaw && (
                    <pre className="mt-2 p-2 bg-white rounded border text-xs overflow-x-auto max-h-60">
                      {JSON.stringify(selectedClaim, null, 2)}
                    </pre>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold mb-3 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Metadata
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div>
                      <span className="font-medium">Correlation ID:</span>{' '}
                      {selectedClaim.correlationId}
                    </div>
                    <div>
                      <span className="font-medium">FHIR Reference ID:</span>{' '}
                      {selectedClaim.fhirRefId}
                    </div>
                    <div>
                      <span className="font-medium">Created:</span>{' '}
                      {formatDate(selectedClaim.created)}
                    </div>
                  </div>
                  <div>
                    <div>
                      <span className="font-medium">Created At:</span>{' '}
                      {formatDate(selectedClaim.createdAt)}
                    </div>
                    <div>
                      <span className="font-medium">Updated At:</span>{' '}
                      {formatDate(selectedClaim.updatedAt)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t">
                <Button
                  className="flex items-center bg-primary text-white hover:bg-primary/90"
                  onClick={() => setResponseAction('adjudicate')}
                >
                  <Gavel className="w-4 h-4 mr-2" />
                  Adjudicate
                </Button>
                <Button
                  className="flex items-center bg-primary text-white hover:bg-primary/90"
                  onClick={() => setResponseAction('request-info')}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Request Information
                </Button>
              </div>

              {responseAction === 'adjudicate' && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
                  <div
                    className="fixed inset-0 bg-black/40"
                    onClick={() => setResponseAction(null)}
                  />
                  <div className="relative z-70 bg-gray-50 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                      <h3 className="text-xl font-bold">Adjudicate Claim Response</h3>
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-600"
                        onClick={() => setResponseAction(null)}
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    <div className="p-6">
                      <ClaimAdjudicateForm
                        responseForm={responseForm}
                        setResponseForm={setResponseForm}
                        responseSubmitting={responseSubmitting}
                        handleResponseSubmit={handleResponseSubmit}
                        setResponseAction={setResponseAction}
                        claimItems={selectedClaim.item?.map((it) => ({
                          name: it.productOrService,
                          category: it.category,
                          productOrService: it.productOrService,
                          programCode: it.programCode,
                          quantity: { value: it.quantity?.value, unit: it.quantity?.unit },
                          unitPrice: {
                            value: it.unitPrice?.value,
                            currency: it.unitPrice?.currency,
                          },
                          net: { value: it.net?.value, currency: it.net?.currency },
                        }))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {responseAction === 'request-info' && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
                  <div
                    className="fixed inset-0 bg-black/40"
                    onClick={() => setResponseAction(null)}
                  />
                  <div className="relative z-70 bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                    <CommunicationRequestForm
                      claimId={selectedClaim.claimId}
                      correlationId={selectedClaim.correlationId}
                      patientName={selectedClaim.patient.name}
                      providerName={selectedClaim.provider.name}
                      onSubmit={handleCommunicationRequest}
                      onCancel={() => setResponseAction(null)}
                      isSubmitting={responseSubmitting}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default Claims;
