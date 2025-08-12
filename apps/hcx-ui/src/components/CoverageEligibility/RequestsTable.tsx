import React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/utils/formatDate';

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
    diagnoses?: Array<any>;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface RequestsTableProps {
  requests: CoverageEligibilityRequest[];
  onViewRequest: (request: CoverageEligibilityRequest) => void;
}

const RequestsTable: React.FC<RequestsTableProps> = ({ requests, onViewRequest }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Request ID</TableHead>
          <TableHead>Patient</TableHead>
          <TableHead>Insurer</TableHead>
          <TableHead>Policy No.</TableHead>
          <TableHead>Request Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {requests.map((req) => (
          <TableRow key={req.fhirRefId}>
            <TableCell>{req.fhirRefId}</TableCell>
            <TableCell>{req.patient.name}</TableCell>
            <TableCell>{req.organization.name}</TableCell>
            <TableCell>{req.insurance?.[0]?.coverage?.policyNumber || 'N/A'}</TableCell>
            <TableCell>{formatDate(req.createdAt)}</TableCell>
            <TableCell>
              <Badge variant={req.status === 'active' ? 'default' : 'secondary'}>
                {req.status}
              </Badge>
            </TableCell>
            <TableCell>
              <Button variant="outline" size="sm" onClick={() => onViewRequest(req)}>
                View
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default RequestsTable;
