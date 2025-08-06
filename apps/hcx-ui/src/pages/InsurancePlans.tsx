import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from '@/components/layout/Header';
import axios from 'axios';
import Sidebar from '@/components/dashboard/Sidebar';
import { payerSidebarSections } from '@/constants/sidebarSections';
import Pagination from '@/components/ui/pagination';
import { API_CONFIG } from '@/config/api';
import { SearchAndFilters } from '../components/InsurancePlan/SearchAndFilters';
import { InsurancePlansTable } from '../components/InsurancePlan/InsurancePlansTable';
import { InsurancePlanDetailsDrawer } from '../components/InsurancePlan/insurancePlanDetailsDrawer';
import { AddInsurancePlanModal } from '../components/InsurancePlan/AddInsurancePlanModal';
import { InsurancePlanForm } from '@/interfaces/insurancePlan';

export interface BundleEntry {
  resource: InsurancePlanForm;
}

const InsurancePlans: React.FC = () => {
  const [plans, setPlans] = useState<InsurancePlanForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedPlan, setSelectedPlan] = useState<InsurancePlanForm | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [page, setPage] = useState(1);
  const [newPlan, setNewPlan] = useState<InsurancePlanForm>({
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

  const filteredPlans = useMemo(() => {
    let filtered = plans;

    if (searchTerm) {
      filtered = filtered.filter(
        (plan) =>
          plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          plan.aliases?.some((alias) => alias.toLowerCase().includes(searchTerm.toLowerCase())),
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter((plan) => plan.insurancePlanType === typeFilter);
    }

    return filtered;
  }, [plans, searchTerm, typeFilter]);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(API_CONFIG.PAYER.ENDPOINTS.INSURANCE_PLAN);
      const data = response.data;

      if (data.entry) {
        setPlans(data.entry.map((entry: BundleEntry) => entry.resource));
      } else if (Array.isArray(data)) {
        setPlans(data);
      } else {
        console.error('Unexpected data format:', data);
        setPlans([]);
      }
    } catch (error) {
      console.error('Error fetching insurance plans:', error);
      setError('Failed to fetch insurance plans');
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPlan = useCallback(
    async (planData: InsurancePlanForm) => {
      const submitData = {
        ...planData,
        periodStart: planData.periodStart
          ? new Date(planData.periodStart).toISOString()
          : undefined,
        periodEnd: planData.periodEnd ? new Date(planData.periodEnd).toISOString() : undefined,
        aliases: planData.aliases?.length > 0 ? planData.aliases : undefined,
        coverageAreaIds:
          planData.coverageAreaIds?.length > 0 ? planData.coverageAreaIds : undefined,
        contactPhones: planData.contactPhones?.length > 0 ? planData.contactPhones : undefined,
        contactEmails: planData.contactEmails?.length > 0 ? planData.contactEmails : undefined,
        networkOrgIds: planData.networkOrgIds?.length > 0 ? planData.networkOrgIds : undefined,
        claimConditions:
          planData.claimConditions?.length > 0 ? planData.claimConditions : undefined,
        supportingDocuments:
          planData.supportingDocuments?.length > 0 ? planData.supportingDocuments : undefined,
        benefitTypes: planData.benefitTypes?.length > 0 ? planData.benefitTypes : undefined,
        generalCosts:
          planData.generalCosts?.filter((cost) => cost.comment || cost.costAmount > 0) || undefined,
        specificCosts:
          planData.specificCosts?.filter(
            (cost) => cost.benefitCategory || cost.benefitType || cost.costAmount > 0,
          ) || undefined,
      };

      try {
        await axios.post(API_CONFIG.PAYER.ENDPOINTS.INSURANCE_PLAN, submitData);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
          console.error('Server error:', err.response.data);
          throw new Error(
            `Failed to create insurance plan: ${err.response.data.message || err.response.data.error}`,
          );
        } else {
          console.error('Unexpected error:', err);
          throw new Error('An unexpected error occurred');
        }
      }

      await fetchPlans();
      setShowAddForm(false);
      setNewPlan({
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
    },
    [fetchPlans],
  );

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const pageSize = 10;
  const paginatedPlans = filteredPlans.slice((page - 1) * pageSize, page * pageSize);

  const handleCreatePlan = async (planData: InsurancePlanForm) => {
    try {
      await createPlan(planData);
      setShowAddForm(false);
    } catch (error) {
      console.error('Error creating plan:', error);
      alert(
        `Failed to create insurance plan: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <Sidebar sections={payerSidebarSections} />
        <main className="ml-64 p-8 min-h-[calc(100vh-4rem)] bg-gray-50">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading insurance plans...</div>
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <Sidebar sections={payerSidebarSections} />
        <main className="ml-64 p-8 min-h-[calc(100vh-4rem)] bg-gray-50">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-red-600">{error}</div>
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
        <h1 className="text-2xl font-bold mb-6">Insurance Plans</h1>

        <SearchAndFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          onAddPlan={() => setShowAddForm(true)}
        />

        <div className="bg-white rounded-lg shadow p-6">
          <InsurancePlansTable plans={paginatedPlans} onViewPlan={setSelectedPlan} />

          <Pagination
            currentPage={page}
            pageSize={pageSize}
            totalItems={filteredPlans.length}
            onPageChange={setPage}
            label="plans"
          />
        </div>

        <InsurancePlanDetailsDrawer plan={selectedPlan} onClose={() => setSelectedPlan(null)} />

        {showAddForm && (
          <AddInsurancePlanModal
            onSubmit={handleCreatePlan}
            onClose={() => setShowAddForm(false)}
          />
        )}
      </main>
    </>
  );
};

export default InsurancePlans;
