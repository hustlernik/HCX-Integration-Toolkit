import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/dashboard/Sidebar';
import { apiTestingSidebarSections } from '@/constants/sidebarSections';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { API_ENDPOINTS } from '@/config/api';

interface Transaction {
  _id?: string;
  status: string;
  correlationId: string;
  workflow?: string;
  requestFHIR?: unknown;
  responseFHIR?: unknown;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse {
  transactions?: Transaction[];
}

type ModalType = 'request' | 'response' | null;

const TransactionLog: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [modalTxn, setModalTxn] = useState<Transaction | null>(null);

  function openModal(type: 'request' | 'response', txn: Transaction) {
    setModalType(type);
    setModalTxn(txn);
    setModalOpen(true);
  }

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    axios
      .get<Transaction[] | ApiResponse>(API_ENDPOINTS.PROVIDER.TRANSACTIONS, {
        signal: controller.signal,
      })
      .then((res) => {
        const data = res.data;
        if (Array.isArray(data)) {
          setTransactions(data);
        } else if (data && Array.isArray(data.transactions)) {
          setTransactions(data.transactions);
        } else {
          setTransactions([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === 'CanceledError') return;
        setError(err.message || 'Error fetching transactions');
        setLoading(false);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setModalOpen(false);
      }
    };

    if (modalOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [modalOpen]);

  return (
    <>
      <Header />
      <Sidebar sections={apiTestingSidebarSections} />
      <main className="ml-64 p-8 min-h-[calc(100vh-4rem)] bg-gray-50">
        <Card>
          <CardHeader>
            <CardTitle>Transaction Log</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && <div className="py-8 text-center text-gray-500">Loading...</div>}
            {error && <div className="py-8 text-center text-red-500">{error}</div>}
            {!loading && !error && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Correlation ID</TableHead>
                    <TableHead>Workflow</TableHead>
                    <TableHead>Request</TableHead>
                    <TableHead>Response</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Updated At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                        No transactions found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((txn, idx) => (
                      <TableRow key={txn._id || idx}>
                        <TableCell>{txn.status}</TableCell>
                        <TableCell>{txn.correlationId}</TableCell>
                        <TableCell>{txn.workflow || '-'}</TableCell>
                        <TableCell>
                          {txn.requestFHIR ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openModal('request', txn)}
                            >
                              View
                            </Button>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {txn.responseFHIR ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openModal('response', txn)}
                            >
                              View
                            </Button>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {txn.createdAt ? new Date(txn.createdAt).toLocaleString() : ''}
                        </TableCell>
                        <TableCell>
                          {txn.updatedAt ? new Date(txn.updatedAt).toLocaleString() : ''}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}

            {modalOpen && modalTxn && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
                onClick={() => setModalOpen(false)}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
              >
                <div
                  className="bg-white rounded-lg shadow-xl p-8 w-full max-w-3xl mx-auto max-h-[90vh] overflow-y-auto relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setModalOpen(false)}
                    className="absolute top-2 right-2"
                    aria-label="Close modal"
                  >
                    Close
                  </Button>
                  <div id="modal-title" className="mb-2 font-semibold">
                    {modalType === 'request' ? 'Request' : 'Response'}
                  </div>
                  {modalType === 'request' && modalTxn.requestFHIR && (
                    <pre className="bg-gray-100 p-2 rounded text-xs max-h-96 overflow-auto">
                      {JSON.stringify(modalTxn.requestFHIR, null, 2)}
                    </pre>
                  )}
                  {modalType === 'response' && modalTxn.responseFHIR ? (
                    <pre className="bg-gray-100 p-2 rounded text-xs max-h-96 overflow-auto">
                      {JSON.stringify(modalTxn.responseFHIR, null, 2)}
                    </pre>
                  ) : modalType === 'response' ? (
                    <div className="text-gray-400">No response yet.</div>
                  ) : null}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
};

export default TransactionLog;
