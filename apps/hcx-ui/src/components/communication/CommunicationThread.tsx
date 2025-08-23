import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MessageSquare,
  Clock,
  Building,
  FileText,
  Download,
  Reply,
  AlertCircle,
  Calendar,
  ArrowRight,
  Paperclip,
} from 'lucide-react';
import type {
  Communication,
  CommunicationThreadProps,
  RequestedDocument,
} from '@/interfaces/communication';

const CommunicationThread: React.FC<CommunicationThreadProps> = ({
  claimId,
  communications,
  onReply,
  onDownloadAttachment,
  isProvider = false,
}) => {
  const [expandedComms, setExpandedComms] = useState<Set<string>>(new Set());

  const toggleExpanded = (commId: string) => {
    setExpandedComms((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commId)) {
        newSet.delete(commId);
      } else {
        newSet.add(commId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const badgeColorClass = 'bg-primary text-primary-foreground';

  const getMainMessage = (payload: Communication['payload']) => {
    return payload.find((p) => p.contentString)?.contentString || 'No message content';
  };

  if (communications.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>No communications found for this claim.</p>
      </div>
    );
  }

  const getTs = (c: (typeof communications)[number]) =>
    new Date(c.createdAt || (c.sent as any) || (c.received as any) || 0).getTime() || 0;
  const sortedComms = [...communications].sort((a, b) => getTs(a) - getTs(b));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center">
          <MessageSquare className="w-5 h-5 mr-2" />
          Communication Thread ({communications.length})
        </h3>
        <Badge variant="outline">Claim: {claimId}</Badge>
      </div>

      <div className="space-y-4">
        {sortedComms.map((comm) => {
          const isExpanded = expandedComms.has(comm.communicationId);
          const isRequest = comm.communicationType === 'request';
          const mainMessage = getMainMessage(comm.payload);
          const requestedDocs: RequestedDocument[] = comm.requestedDocuments || [];
          const attachments = comm.responseAttachments || [];

          return (
            <div
              key={comm.communicationId}
              className={`border rounded-lg p-4 border-primary/20 bg-primary/5`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full bg-primary/10`}>
                    {isRequest ? (
                      <MessageSquare className="w-4 h-4 text-primary" />
                    ) : (
                      <Reply className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">
                        {isRequest ? 'Communication Request' : 'Response'}
                      </span>
                      <Badge
                        className={`${badgeColorClass} rounded-full px-2.5 py-1 text-xs font-medium`}
                      >
                        {comm.priority.toUpperCase()}
                      </Badge>
                      <Badge
                        className={`${badgeColorClass} rounded-full px-2.5 py-1 text-xs font-medium`}
                      >
                        {comm.workflowStatus.replace('-', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <Building className="w-3 h-3 mr-1" />
                          From: {comm.sender?.display || 'Unknown'}
                        </span>
                        <span className="flex items-center">
                          <ArrowRight className="w-3 h-3 mr-1" />
                          To: {comm.recipient?.[0]?.display || 'Unknown'}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDate(
                            comm.createdAt ||
                              (comm.sent as any) ||
                              (comm.received as any) ||
                              new Date().toISOString(),
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleExpanded(comm.communicationId)}
                >
                  {isExpanded ? 'Collapse' : 'Expand'}
                </Button>
              </div>

              {isRequest && comm.reasonCode?.[0] && (
                <div className="mb-3">
                  <Badge className="bg-primary/10 text-primary rounded-full px-2.5 py-1 text-xs font-medium">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {comm.reasonCode[0].coding?.[0]?.display ||
                      comm.reasonCode[0].coding?.[0]?.code}
                  </Badge>
                </div>
              )}

              <div className="mb-3">
                <p className="text-sm text-gray-700">
                  {isExpanded
                    ? mainMessage || ''
                    : `${(mainMessage || '').substring(0, 150)}${(mainMessage || '').length > 150 ? '...' : ''}`}
                </p>
              </div>

              {isExpanded && (
                <div className="space-y-4 border-t pt-4">
                  {isRequest && requestedDocs.length > 0 && (
                    <div>
                      <h5 className="font-medium text-sm mb-2 flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        Requested Documents
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {requestedDocs.map((doc: RequestedDocument, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {doc.description || doc.type || 'Document'}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {isRequest && comm.dueDate && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>Due Date: {formatDate(comm.dueDate)}</span>
                    </div>
                  )}

                  {attachments.length > 0 && (
                    <div>
                      <h5 className="font-medium text-sm mb-2 flex items-center">
                        <Paperclip className="w-4 h-4 mr-1" />
                        Attachments
                      </h5>
                      <div className="space-y-2">
                        {attachments.map((attachment, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 bg-white rounded border"
                          >
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-gray-500" />
                              <div>
                                <div className="text-sm font-medium">{attachment?.title}</div>
                                <div className="text-xs text-gray-500">
                                  {attachment?.contentType} •{' '}
                                  {attachment?.size
                                    ? `${Math.round(attachment.size / 1024)}KB`
                                    : 'Unknown size'}
                                </div>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onDownloadAttachment?.(attachment)}
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {isRequest && comm.workflowStatus === 'pending' && onReply && (
                    <div className="flex justify-end pt-2 border-t">
                      <Button
                        size="sm"
                        onClick={() => onReply(comm.communicationId)}
                        className="flex items-center bg-primary text-white hover:bg-primary/90"
                      >
                        <Reply className="w-3 h-3 mr-1" />
                        {isProvider ? 'Send Response' : 'Follow Up'}
                      </Button>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 pt-2 border-t">
                    <div className="grid grid-cols-2 gap-2">
                      <div>Communication ID: {comm.communicationId}</div>
                      <div>Correlation ID: {comm.correlationId}</div>
                      {comm.sent && <div>Sent: {formatDate(comm.sent)}</div>}
                      {comm.received && <div>Received: {formatDate(comm.received)}</div>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CommunicationThread;
