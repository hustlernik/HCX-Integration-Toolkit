import React, { useState, useEffect } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { Policy } from '../interfaces/policy';
import AddPolicyModal from '../components/Policies/AddPolicyModel';
import AddBeneficiaryModal from '../components/Policies/AddBeneficiaryModel';
import PolicyDetailsDrawer from '../components/Policies/PolicyDetailsDrawer';
import Pagination from '@/components/ui/pagination';
import axios from 'axios';
import { API_CONFIG } from '@/config/api';

const Policies: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddPolicyModal, setShowAddPolicyModal] = useState(false);
  const [showAddBeneficiaryModal, setShowAddBeneficiaryModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_CONFIG.PAYER.ENDPOINTS.POLICIES);
      setPolicies(response.data);
    } catch (error) {
      console.error('Failed to load policies:', error);
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPolicies = policies.filter((p) => {
    const matchesSearch =
      p.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.insurancePlan &&
        p.insurancePlan.name &&
        p.insurancePlan.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.beneficiary &&
        p.beneficiary.name &&
        p.beneficiary.name.first &&
        p.beneficiary.name.first.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.beneficiary &&
        p.beneficiary.abhaId &&
        p.beneficiary.abhaId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedPolicies = filteredPolicies.slice((page - 1) * pageSize, page * pageSize);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <Header />
      <Sidebar sections={payerSidebarSections} />
      <main className="ml-64 p-8 min-h-[calc(100vh-4rem)] bg-gray-50">
        <h1 className="text-2xl font-bold mb-6">Policies</h1>
        <div className="flex w-full items-center gap-4 mb-4">
          <div className="flex flex-1 gap-4">
            <Input
              type="text"
              placeholder="Search by policy number, beneficiary, or plan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="entered-in-error">Entered in Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={() => setShowAddBeneficiaryModal(true)}>
            Add Beneficiary
          </Button>
          <Button variant="default" onClick={() => setShowAddPolicyModal(true)}>
            Add Policy
          </Button>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Policy Number</TableHead>
                <TableHead>Insurance Plan</TableHead>
                <TableHead>Beneficiary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Coverage Period</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-16 text-center text-gray-500 text-base font-medium"
                  >
                    Loading policies...
                  </TableCell>
                </TableRow>
              ) : filteredPolicies.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-16 text-center text-gray-500 text-base font-medium"
                  >
                    {policies.length === 0
                      ? 'No policies found. Create your first policy to get started.'
                      : 'No policies match your search criteria.'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPolicies.map((policy, idx) => (
                  <TableRow
                    key={policy._id}
                    className={`${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors duration-150`}
                  >
                    <TableCell className="font-mono text-sm py-4 align-middle">
                      {policy.policyNumber}
                    </TableCell>
                    <TableCell className="py-4 align-middle">
                      <div>
                        <div className="font-medium">{policy.insurancePlan?.name || '-'}</div>
                        {policy.insurancePlan?.type && (
                          <span className="border border-primary text-primary px-2 py-0.5 rounded-full font-medium text-xs whitespace-nowrap bg-transparent inline-block mt-1">
                            {policy.insurancePlan.type}
                          </span>
                        )}
                        <div className="text-xs text-gray-500">
                          {policy.insurancePlan?.id || '-'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 align-middle">
                      <div>
                        <div className="font-medium">
                          {policy.beneficiary?.name?.first || '-'}{' '}
                          {policy.beneficiary?.name?.last || ''}
                        </div>
                        <div className="text-xs text-gray-500">
                          {policy.beneficiary?.abhaId || '-'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 align-middle">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium text-xs">
                        {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 align-middle">
                      <div className="text-sm">
                        {formatDate(policy.coverageStart)}
                        {policy.coverageEnd && <span> – {formatDate(policy.coverageEnd)}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 align-middle">
                      <button
                        type="button"
                        onClick={() => setSelectedPolicy(policy)}
                        className="text-primary font-medium hover:underline focus:outline-none bg-transparent border-none p-0 m-0"
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          margin: 0,
                          cursor: 'pointer',
                        }}
                      >
                        View
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <Pagination
            currentPage={page}
            pageSize={pageSize}
            totalItems={filteredPolicies.length}
            onPageChange={setPage}
            label="policies"
          />
        </div>

        <AddPolicyModal
          isOpen={showAddPolicyModal}
          onClose={() => setShowAddPolicyModal(false)}
          onSuccess={loadPolicies}
        />

        <AddBeneficiaryModal
          isOpen={showAddBeneficiaryModal}
          onClose={() => setShowAddBeneficiaryModal(false)}
          onSuccess={loadPolicies}
        />

        <PolicyDetailsDrawer
          policy={selectedPolicy}
          onClose={() => setSelectedPolicy(null)}
          onRefresh={loadPolicies}
        />
      </main>
    </>
  );
};

export default Policies;
