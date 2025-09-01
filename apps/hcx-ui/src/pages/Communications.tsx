import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/dashboard/Sidebar';
import { payerSidebarSections } from '@/constants/sidebarSections';
import CommunicationRequestForm from '@/components/communication/CommunicationRequestForm';
import CommunicationThread from '@/components/communication/CommunicationThread';
import CommunicationResponseForm from '@/components/communication/CommunicationResponseForm';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { API_CONFIG, API_ENDPOINTS } from '@/config/api';
import type {
  Communication,
  ClaimSummary,
  CommunicationRequestData,
  CommunicationResponseData,
  AttachmentItem,
} from '@/interfaces/communication';
import Pagination from '@/components/ui/pagination';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Search, Clock, MessageCircle } from 'lucide-react';

const Communications: React.FC = () => {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [claims, setClaims] = useState<ClaimSummary[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<ClaimSummary | null>(null);
  const [selectedCommunications, setSelectedCommunications] = useState<Communication[]>([]);
  const [showThread, setShowThread] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  // Response form removed - payers only send requests, providers send responses
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const response = await axios.get(`${API_ENDPOINTS.PAYER.CLAIMS}`, {
          params: { include_communications: true },
          validateStatus: () => true,
        });
        if (response.status >= 200 && response.status < 300) {
          const data = response.data;
          setClaims(data.claims || data || []);
        } else {
          console.error('Failed to fetch claims:', response.status, response.data);
          setClaims([]);
        }
      } catch (error) {
        console.error('Error fetching claims:', error);
        setClaims([]);
      }
    };

    fetchClaims();
  }, []);

  useEffect(() => {
    const fetchCommunications = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.PAYER.COMMUNICATIONS, {
          validateStatus: () => true,
        });
        if (response.status >= 200 && response.status < 300) {
          const data = response.data;
          setCommunications(data.communications || data || []);
        } else {
          console.error('Failed to fetch communications:', response.status, response.data);
          setCommunications([]);
        }
      } catch (error) {
        console.error('Error fetching communications:', error);
        setCommunications([]);
      }
    };

    fetchCommunications();
  }, []);

  const dedupeByCommId = (items: Communication[]) => {
    const map = new Map<string, Communication>();
    for (const c of items) {
      const key = c.communicationId || `${c.correlationId}:${c.sentAt || c.createdAt}`;
      if (!map.has(key)) map.set(key, c);
    }
    return Array.from(map.values());
  };

  const handleCommunicationRequest = async (data: CommunicationRequestData) => {
    if (isSubmitting) return; // Prevent duplicate submissions
    setIsSubmitting(true);
    try {
      const headers = {
        'Content-Type': 'application/json',
      } as const;

      const payload = {
        claimCorrelationId: selectedClaim?.correlationId, // Use claim's correlation ID
        claimId: selectedClaim?.claimId,
        responseForm: {
          reasonCode: data.reasonCode,
          reasonDisplay: data.reasonDisplay,
          message: data.message,
          priority: data.priority,
          dueDate: data.dueDate,
          category: data.category,
          medium: data.medium,
          attachments: data.attachments?.map((a) => ({
            title: a.title,
            contentType: a.contentType,
            language: a.language,
            creation: a.creation,
            data: a.mode === 'data' ? a.data : undefined,
            url: a.mode === 'url' ? a.url : undefined,
          })),
        },
      };

      const response = await axios.post(API_ENDPOINTS.PAYER.COMMUNICATION_REQUEST, payload, {
        headers,
        validateStatus: () => true,
      });

      if (response.status >= 200 && response.status < 300) {
        setShowRequestForm(false);
        setSelectedClaim(null);
      } else {
        console.error('Failed to send communication request:', response.data);
      }
    } catch (error) {
      console.error('Error sending communication request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Response handler removed - payers only send requests, providers send responses

  const viewCommunications = async (claim: ClaimSummary) => {
    try {
      const url = `${API_CONFIG.PAYER.BASE_URL}/hcx/v1/communication/claim/${encodeURIComponent(claim.claimId)}`;
      const resp = await axios.get(url, { validateStatus: () => true });
      const ct = resp.headers?.['content-type'] || '';
      if (resp.status >= 200 && resp.status < 300 && ct.includes('application/json')) {
        const data = resp.data;
        const list: Communication[] = data.data || data || [];
        setSelectedCommunications(dedupeByCommId(list));
        setSelectedClaim(claim);
        setShowRequestForm(false);
        setShowThread(true);
      } else {
        console.error('Failed to fetch communication thread:', resp.status, resp.data);
      }
    } catch (error) {
      console.error('Error fetching communications:', error);
    }
  };

  const getStatusBadge = (_status: string) => {
    return 'bg-primary text-primary-foreground';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getClaimCommCount = (claimId: string) => {
    const items = communications.filter((c) => c.about.some((a) => a.reference.includes(claimId)));
    return dedupeByCommId(items).length;
  };

  const filteredClaims = claims.filter((claim) => {
    const matchesSearch =
      searchTerm === '' ||
      claim.claimId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.providerName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === 'all' || claim.communicationStatus === filterStatus;

    return matchesSearch && matchesFilter;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const paginatedClaims = filteredClaims.slice(startIdx, endIdx);

  return (
    <>
      <Header />
      <Sidebar sections={payerSidebarSections} />
      <main className="ml-48 p-8 min-h-[calc(100vh-4rem)] bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Communications</h1>

          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-4 items-center">
              <div className="relative flex-1 w-full max-w-xl">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                  <Search className="w-4 h-4" />
                </span>
                <Input
                  type="text"
                  placeholder="Search claims by patient, provider, or claim ID..."
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
                    <SelectItem value="none">No Communications</SelectItem>
                    <SelectItem value="requested">Requested</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="responded">Responded</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="px-6 py-6">
                  <Table>
                    <TableHeader className="border-b">
                      <TableRow>
                        <TableHead className="py-2.5">Claim ID</TableHead>
                        <TableHead className="py-2.5">Patient</TableHead>
                        <TableHead className="py-2.5">Provider</TableHead>
                        <TableHead className="py-2.5">Communication Status</TableHead>
                        <TableHead className="py-2.5">Count</TableHead>
                        <TableHead className="py-2.5">Last Activity</TableHead>
                        <TableHead className="py-2.5">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedClaims.map((claim) => (
                        <TableRow key={claim.claimId} className="align-middle">
                          <TableCell className="font-medium py-2.5">{claim.claimId}</TableCell>
                          <TableCell className="py-2.5">
                            <div>
                              <div className="font-semibold">{claim.patientName}</div>
                            </div>
                          </TableCell>
                          <TableCell className="py-2.5">{claim.providerName}</TableCell>
                          <TableCell className="py-2.5">
                            <Badge
                              className={`${getStatusBadge(claim.communicationStatus)} rounded-full px-2.5 py-1 text-xs font-medium`}
                            >
                              {claim.communicationStatus.replace('-', ' ').toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-2.5">
                            {getClaimCommCount(claim.claimId)}
                          </TableCell>
                          <TableCell className="py-2.5">
                            {claim.lastCommunicationAt ? (
                              <div className="flex items-center text-sm text-gray-600">
                                <Clock className="w-4 h-4 mr-1" />
                                {formatDate(claim.lastCommunicationAt)}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell className="py-2.5">
                            <div className="flex items-center gap-4">
                              <Button
                                size="sm"
                                variant="link"
                                className="px-0 no-underline text-primary hover:text-primary/90"
                                onClick={() => viewCommunications(claim)}
                              >
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="default"
                                className="h-8 px-3 flex items-center bg-primary text-white hover:bg-primary/90"
                                onClick={() => {
                                  setSelectedClaim(claim);
                                  setShowThread(false);
                                  setShowRequestForm(true);
                                }}
                              >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Request Information
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="px-6 pb-8 bg-white">
                  <Pagination
                    currentPage={currentPage}
                    pageSize={pageSize}
                    totalItems={filteredClaims.length}
                    onPageChange={setCurrentPage}
                    label="communications"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Dialog
            open={showThread}
            onOpenChange={(open) => {
              if (!open) {
                setShowThread(false);
                setSelectedClaim(null);
                setSelectedCommunications([]);
              }
            }}
          >
            <DialogContent className="w-full max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Communications - {selectedClaim?.claimId}</DialogTitle>
              </DialogHeader>
              {selectedClaim && selectedCommunications && (
                <CommunicationThread
                  claimId={selectedClaim.claimId}
                  communications={selectedCommunications}
                  onReply={(commId) => {
                    const originalComm = selectedCommunications.find(
                      (c) => c.communicationId === commId,
                    );
                    // if (originalComm) {
                    //   setResponseToRequest({
                    //     communicationId: commId,
                    //     correlationId: originalComm.correlationId,
                    //     claimId: selectedClaim.claimId,
                    //     patientName: selectedClaim.patientName,
                    //     payerName: selectedClaim.payerName,
                    //     reasonCode:
                    //       originalComm.reasonCode[0]?.coding[0]?.display || 'Information Request',
                    //     message:
                    //       originalComm.payload.find((p) => p.contentString)?.contentString || '',
                    //     requestedDocs: originalComm.payload
                    //       .filter((p) => p.contentCodeableConcept)
                    //       .map((p) => p.contentCodeableConcept?.coding?.[0]?.code || '')
                    //       .filter(Boolean) as string[],
                    //     dueDate: originalComm.dueDate,
                    //   });
                    //   // setShowResponseForm(true);
                    // }
                  }}
                  onDownloadAttachment={(attachment) => {
                    console.log('Download attachment:', attachment);
                  }}
                />
              )}
            </DialogContent>
          </Dialog>

          <Dialog
            open={showRequestForm && Boolean(selectedClaim)}
            onOpenChange={(open) => {
              if (!open) {
                setShowRequestForm(false);
                setSelectedClaim(null);
              }
            }}
          >
            <DialogContent className="w-full max-w-3xl max-h-[90vh] overflow-y-auto p-0 bg-white">
              {selectedClaim && (
                <CommunicationRequestForm
                  claimId={selectedClaim.claimId}
                  correlationId={selectedClaim.correlationId}
                  patientName={selectedClaim.patientName}
                  providerName={selectedClaim.providerName}
                  // onSubmit={handleCommunicationRequest}
                  onCancel={() => {
                    setShowRequestForm(false);
                    setSelectedClaim(null);
                  }}
                  isSubmitting={isSubmitting}
                />
              )}
            </DialogContent>
          </Dialog>

          {/* Response form removed - payers only send requests, providers send responses */}
        </div>
      </main>
    </>
  );
};

export default Communications;
