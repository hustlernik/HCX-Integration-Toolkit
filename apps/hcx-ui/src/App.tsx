import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import ApiTesting from './pages/ApiTesting';
import InsurancePlans from './pages/InsurancePlans';
import TransactionLog from './pages/TransactionLog';
import CoverageEligibilityRequest from './pages/CoverageEligibilityRequest';
import Policies from './pages/Policies';
import Claims from './pages/Claims';
import Communications from './pages/Communications';
import ProviderCommunications from './pages/ProviderCommunications';

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/api-testing" element={<ApiTesting />} />
            <Route path="/transactions" element={<TransactionLog />} />
            <Route path="/insurance-plans" element={<InsurancePlans />} />
            <Route path="/policies" element={<Policies />} />
            <Route path="/eligibility-requests" element={<CoverageEligibilityRequest />} />
            <Route path="/claims" element={<Claims />} />
            <Route path="/communications" element={<Communications />} />
            <Route path="/provider/communications" element={<ProviderCommunications />} />
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
