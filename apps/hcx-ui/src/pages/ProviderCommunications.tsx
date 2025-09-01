import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/dashboard/Sidebar';
import { apiTestingSidebarSections } from '@/constants/sidebarSections';
import CommunicationResponseForm from '@/components/communication/CommunicationResponseForm';
import type {
  CommunicationResponseData,
  ProviderInboxCommunication as CommunicationRequest,
} from '@/interfaces/communication';
import axios from 'axios';
import { API_ENDPOINTS } from '@/config/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import Pagination from '@/components/ui/pagination';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Search, Reply } from 'lucide-react';

const ProviderCommunications: React.FC = () => {
  const [communications, setCommunications] = useState<CommunicationRequest[]>([]);
  const [selectedComm, setSelectedComm] = useState<CommunicationRequest | null>(null);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommunications = async () => {
      setLoading(true);
      setError(null);
      const inboxUrl = API_ENDPOINTS.PROVIDER.COMMUNICATION_INBOX;
      try {
        const res = await axios.get(inboxUrl);
        const data = res.data;
        setCommunications(data.data || data || []);
      } catch (err) {
        console.error('Error fetching communications:', err);
        const errorMessage =
          axios.isAxiosError(err) && err.response?.data?.message
            ? err.response.data.message
            : 'Failed to load communications. Please try again.';
        setError(errorMessage);
        setCommunications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunications();
  }, []);

  const handleCommunicationResponse = useCallback(
    async (data: CommunicationResponseData) => {
      if (!selectedComm) return;
      if (isSubmitting) return; // Prevent duplicate submissions

      setIsSubmitting(true);
      try {
        const formData = new FormData();
        formData.append('correlationId', selectedComm.correlationId); // Keep same correlation ID as the request
        formData.append('claimId', selectedComm.claimId);
        formData.append('message', data.message);
        formData.append('status', data.status);
        formData.append('fhirStatus', data.fhirStatus);
        if (data.sentAt) formData.append('sentAt', data.sentAt);

        data.attachments.forEach((att, index) => {
          if (att.mode === 'data' && att.file) {
            formData.append(`attachment_${index}`, att.file, att.file.name);
            formData.append(`attachment_${index}_name`, att.file.name);
            formData.append(`attachment_${index}_size`, String(att.file.size));
            if (att.file.type) formData.append(`attachment_${index}_type`, att.file.type);
          }
          if (att.mode === 'url' && att.url) {
            formData.append(`attachment_${index}_url`, att.url);
          }
          if (att.title) formData.append(`attachment_${index}_title`, att.title);
          if (att.contentType) formData.append(`attachment_${index}_contentType`, att.contentType);
          if (att.language) formData.append(`attachment_${index}_language`, att.language);
          if (att.creation) formData.append(`attachment_${index}_creation`, att.creation);
        });

        const response = await axios.post(API_ENDPOINTS.PROVIDER.COMMUNICATION_RESPOND, formData, {
          headers: {
            'x-hcx-api_call_id': `comm-resp-${Date.now()}`,
            'x-hcx-correlation_id': selectedComm.correlationId, // Use SAME correlation ID as request
            'x-hcx-workflow_id': 'communication',
            'x-hcx-timestamp': new Date().toISOString(),
            'x-hcx-sender_code': 'provider-001',
            'x-hcx-recipient_code': 'payer-001',
          },
        });

        if (response.status >= 200 && response.status < 300) {
          const result = response.data;
          setCommunications((prev) =>
            prev.map((comm) =>
              comm.id === selectedComm.id
                ? { ...comm, status: 'responded', workflowStatus: 'responded' }
                : comm,
            ),
          );
          setShowResponseForm(false);
          setSelectedComm(null);
        } else {
          console.error('Failed to send communication response:', response.data);
        }
      } catch (error) {
        console.error('Error sending communication response:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [selectedComm],
  );

  const acknowledgeRequest = useCallback(
    async (commId: string) => {
      try {
        const comm = communications.find((c) => c.id === commId);
        if (!comm) return;

        const response = await axios.post(
          API_ENDPOINTS.PAYER.COMMUNICATION_REQUEST,
          {
            correlationId: comm.correlationId,
            claimId: comm.claimId,
            message: 'Communication request acknowledged and under review.',
            status: 'acknowledged',
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-hcx-api_call_id': `comm-ack-${Date.now()}`,
              'x-hcx-correlation_id': comm.correlationId,
              'x-hcx-workflow_id': 'communication',
              'x-hcx-timestamp': new Date().toISOString(),
              'x-hcx-sender_code': 'provider-001',
              'x-hcx-recipient_code': 'payer-001',
            },
          },
        );

        if (response.status >= 200 && response.status < 300) {
          setCommunications((prev) =>
            prev.map((c) =>
              c.id === commId
                ? { ...c, status: 'acknowledged', workflowStatus: 'acknowledged' }
                : c,
            ),
          );
        } else {
          console.error('Failed to acknowledge communication:', response.data);
        }
      } catch (error) {
        console.error('Error acknowledging communication:', error);
      }
    },
    [communications],
  );

  const getPriorityVariant = (
    priority: string,
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    const key = (priority || '').toLowerCase();
    const map: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      routine: 'secondary',
      urgent: 'destructive',
      asap: 'destructive',
      stat: 'destructive',
    };
    return map[key] || 'outline';
  };

  const formatDateOnly = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  const formatTimeOnly = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString();
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const getDaysUntilDue = (dueDate?: string) => {
    if (!dueDate) return null;
    const days = Math.ceil(
      (new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
    );
    return days;
  };

  const filteredCommunications = useMemo(() => {
    return communications.filter((comm) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        q === '' ||
        comm.claimId.toLowerCase().includes(q) ||
        comm.patientName.toLowerCase().includes(q) ||
        comm.payerName.toLowerCase().includes(q) ||
        comm.reasonDisplay.toLowerCase().includes(q);
      const matchesStatus = filterStatus === 'all' || comm.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || comm.priority === filterPriority;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [communications, searchTerm, filterStatus, filterPriority]);

  const paginatedCommunications = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    return filteredCommunications.slice(startIdx, endIdx);
  }, [filteredCommunications, currentPage, pageSize]);

  return (
    <>
      <Header />
      <Sidebar sections={apiTestingSidebarSections} />
      <main className="ml-48 p-8 min-h-[calc(100vh-4rem)] bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Communications</h1>

          {loading && (
            <div className="mb-6 p-4 rounded-md bg-white border text-sm text-gray-700">
              Loading communications...
            </div>
          )}
          {!loading && error && (
            <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mb-4 items-center">
            <div className="relative flex-1 w-full max-w-xl">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                <Search className="w-4 h-4" />
              </span>
              <Input
                placeholder="Search by claim ID, patient, payer, or reason..."
                className="pl-10 pr-3 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-56">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="in-review">In Review</SelectItem>
                  <SelectItem value="responded">Responded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-56">
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="All Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="stat">STAT</SelectItem>
                  <SelectItem value="asap">ASAP</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="routine">Routine</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="px-6 py-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Claim ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Received</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedCommunications.map((comm) => {
                      const daysUntilDue = getDaysUntilDue(comm.dueDate);
                      const overdue = isOverdue(comm.dueDate);

                      return (
                        <TableRow key={comm.id}>
                          <TableCell className="font-medium">{comm.claimId}</TableCell>
                          <TableCell>{comm.patientName}</TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <div className="font-medium text-sm">{comm.reasonDisplay}</div>
                              <div className="text-xs text-gray-500 truncate">{comm.message}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getPriorityVariant(comm.priority)}>
                              {comm.priority.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="default">
                              {comm.status.replace('-', ' ').toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {comm.dueDate ? (
                              <div className="text-sm">
                                <div className="text-gray-900">{formatDateOnly(comm.dueDate)}</div>
                                {daysUntilDue !== null && (
                                  <div className="text-xs text-gray-600">
                                    {overdue
                                      ? `${Math.abs(daysUntilDue)} days overdue`
                                      : `${daysUntilDue} days left`}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="text-gray-900">{formatDateOnly(comm.receivedAt)}</div>
                              <div className="text-xs text-gray-600">
                                {formatTimeOnly(comm.receivedAt)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-4 items-center">
                              {comm.status === 'received' && (
                                <Button
                                  size="sm"
                                  variant="link"
                                  className="px-0 no-underline text-primary hover:text-primary/90"
                                  onClick={() => acknowledgeRequest(comm.id)}
                                >
                                  Acknowledge
                                </Button>
                              )}
                              <Button
                                size="sm"
                                disabled={comm.status === 'responded' || isSubmitting}
                                className="h-8 px-3 flex items-center bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => {
                                  if (comm.status === 'responded' || isSubmitting) return;
                                  setSelectedComm(comm);
                                  setShowResponseForm(true);
                                }}
                              >
                                <Reply className="w-3 h-3 mr-1" />
                                Respond
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="px-6 pb-8 bg-white">
                <Pagination
                  currentPage={currentPage}
                  pageSize={pageSize}
                  totalItems={filteredCommunications.length}
                  onPageChange={setCurrentPage}
                  label="communications"
                />
              </div>
            </CardContent>
          </Card>

          {showResponseForm && selectedComm && (
            <CommunicationResponseForm
              communicationId={selectedComm.id}
              originalRequest={{
                correlationId: selectedComm.correlationId,
                claimId: selectedComm.claimId,
                patientName: selectedComm.patientName,
                payerName: selectedComm.payerName,
                reasonCode: selectedComm.reasonDisplay,
                message: selectedComm.message,
                requestedDocs: (selectedComm.requestedDocuments || [])
                  .map((d) => d.type)
                  .filter(Boolean),
                providerName: undefined,
              }}
              onSubmit={handleCommunicationResponse}
              onCancel={() => {
                setShowResponseForm(false);
                setSelectedComm(null);
              }}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </main>
    </>
  );
};

export default ProviderCommunications;
