import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/dashboard/Sidebar';
import { payerSidebarSections } from '@/constants/sidebarSections';
import { Search, Filter } from 'lucide-react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { API_CONFIG, API_ENDPOINTS } from '@/config/api';
import RequestsTable from '../components/CoverageEligibility/RequestsTable';
import RequestsDetailDrawer from '../components/CoverageEligibility/RequestsDetailsDrawer';
import Pagination from '@/components/ui/pagination';

interface CoverageEligibilityRequest {
  correlationId: string;
  fhirRefId: string;
  status: string;
  purpose: string[];
  patient: {
    id: string;
    name: string;
    dob: string;
    gender: string;
    identifier: string;
  };
  insurance: Array<{
    focal: boolean;
    coverage: {
      id: string;
      policyNumber: string;
      status: string;
      plan: string;
      payor: string;
    };
  }>;
  practitioner: {
    id: string;
    name: string;
    qualification: string;
    identifier: string;
  };
  organization: {
    id: string;
    name: string;
    type: string;
    contact: { phone: string; email: string };
  };
  serviced?: { date?: string; period?: { start: string; end: string } };
  items: Array<{
    category: { code: string; display: string };
    productOrService: { code: string; display: string };
    quantity?: { value: number; unit?: string };
    unitPrice?: { value?: number; currency?: string };
    diagnoses?: Array<{ code: string; display: string; system?: string }>;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface ResponseFormType {
  purpose: string[];
  disposition: string;
  servicedDate: string;
  servicedPeriod: { start: string; end: string };
  insurance: Array<{
    policyNumber: string;
    inforce: boolean;
    benefitPeriod: { start: string; end: string };
    items: Array<{
      category: { code: string; display: string };
      productOrService: { code: string; display: string };
      benefits: Array<{
        type: string;
        allowedMoney: { value: number; currency: string };
        allowedUnsignedInt?: number;
        allowedString?: string;
        usedUnsignedInt?: number;
        usedString?: string;
        usedMoney?: { value: number; currency: string };
      }>;
      excluded?: boolean;
      name?: string;
      description?: string;
      network?: string;
      unit?: string;
      term?: string;
      authorizationRequired?: boolean;
      authorizationSupporting?: Array<{ code: string; display: string }>;
      authorizationUrl?: string;
    }>;
  }>;
}

function mapRequestToResponseForm(req: CoverageEligibilityRequest): ResponseFormType {
  return {
    purpose: req.purpose || [],
    disposition: '',
    servicedDate:
      req.serviced && 'date' in req.serviced && typeof req.serviced.date === 'string'
        ? req.serviced.date
        : '',
    servicedPeriod:
      req.serviced && req.serviced.period
        ? {
            start: req.serviced.period.start || '',
            end: req.serviced.period.end || '',
          }
        : { start: '', end: '' },
    insurance: (req.insurance || []).map((ins) => ({
      policyNumber: ins.coverage?.policyNumber || '',
      inforce: ins.coverage?.status === 'active',
      benefitPeriod: { start: '', end: '' },
      items: (req.items || []).map((item) => ({
        category: { ...item.category },
        productOrService: { ...item.productOrService },
        benefits: [],
        excluded: undefined,
        name: '',
        description: '',
        network: '',
        unit: '',
        term: '',
        authorizationRequired: false,
        authorizationSupporting: [],
        authorizationUrl: '',
      })),
    })),
  };
}

const CoverageEligibilityRequest: React.FC = () => {
  const [status, setStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const [selectedRequest, setSelectedRequest] = useState<CoverageEligibilityRequest | null>(null);
  const [requests, setRequests] = useState<CoverageEligibilityRequest[]>([]);

  useEffect(() => {
    axios
      .get(API_ENDPOINTS.PAYER.COVERAGE_ELIGIBILITY_REQUEST)
      .then((response) => setRequests(response.data))
      .catch((err) => {
        console.error('Failed to fetch coverage eligibility requests:', err);
      });
  }, []);

  useEffect(() => {
    const socket = io(API_CONFIG.PAYER.BASE_URL);

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    socket.on('coverage-eligibility-request:new', (data) => {
      console.log('EligibilityRequests: Socket event received:', data);
      setRequests((prev) => [data.fhir, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setShowStatusDropdown(false);
      }
    }
    if (showStatusDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStatusDropdown]);

  const filtered = requests.filter(
    (req) =>
      (status === 'All' || req.status === status) &&
      (req.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
        req.organization?.name?.toLowerCase().includes(search.toLowerCase()) ||
        req.fhirRefId?.toLowerCase().includes(search.toLowerCase())),
  );

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleViewRequest = (request: CoverageEligibilityRequest) => {
    setSelectedRequest(request);
  };

  const handleCloseDrawer = () => {
    setSelectedRequest(null);
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    setShowStatusDropdown(false);
    setPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <>
      <Header />
      <Sidebar sections={payerSidebarSections} />
      <main className="ml-64 p-8 min-h-[calc(100vh-4rem)] bg-gray-50">
        <h1 className="text-2xl font-bold mb-6">Coverage Eligibility Requests</h1>

        <div className="flex flex-col sm:flex-row gap-4 mb-4 items-center">
          <div className="relative flex-1 w-full max-w-xl">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search by patient, insurer, or policy no."
              className="pl-10 pr-3 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={search}
              onChange={handleSearchChange}
            />
          </div>

          <div className="relative" ref={statusDropdownRef}>
            <button
              type="button"
              className="flex items-center gap-2 pl-3 pr-4 py-2 border rounded-md bg-white text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => setShowStatusDropdown((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={showStatusDropdown}
            >
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              <span>{status === 'All' ? 'All Status' : status}</span>
              <svg
                className="ml-2 w-3 h-3 text-gray-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showStatusDropdown && (
              <div className="absolute left-0 mt-2 w-40 bg-white border rounded-md shadow-lg z-10">
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => handleStatusChange('All')}
                >
                  All Status
                </button>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => handleStatusChange('active')}
                >
                  Active
                </button>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => handleStatusChange('inactive')}
                >
                  Inactive
                </button>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => handleStatusChange('cancelled')}
                >
                  Cancelled
                </button>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => handleStatusChange('queried')}
                >
                  Queried
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <RequestsTable requests={paginated} onViewRequest={handleViewRequest} />

          <Pagination
            currentPage={page}
            pageSize={pageSize}
            totalItems={filtered.length}
            onPageChange={setPage}
            label="requests"
          />
        </div>

        {filtered.length === 0 && requests.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            No requests found matching your search criteria.
          </div>
        )}

        {requests.length === 0 && (
          <div className="text-center py-8 text-gray-500">Loading requests...</div>
        )}

        <RequestsDetailDrawer
          selectedRequest={selectedRequest}
          onClose={handleCloseDrawer}
          mapRequestToResponseForm={mapRequestToResponseForm}
        />
      </main>
    </>
  );
};

export default CoverageEligibilityRequest;
