'use client';

import React, { useEffect, useState } from 'react';

type ExtensionRequest = {
  id: number;
  student_id: number;
  student_name: string;
  extend_minutes: number;
  personal_message: string;
  status: string;
  created_at: string;
};

export default function PendingExtensionRequests() {
  const [requests, setRequests] = useState<ExtensionRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/extension-requests');
      if (!res.ok) {
        throw new Error('Failed to fetch extension requests');
      }
      const data = await res.json();
      setRequests(data.requests);
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unknown error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (requestId: number, action: 'approve' | 'reject') => {
    try {
      setUpdatingId(requestId);
      const res = await fetch('/api/extension-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update request');
      }
      await fetchRequests();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <p>Loading extension requests...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Pending Extension Requests</h1>
      {requests.length === 0 ? (
        <p>No pending extension requests.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">Student</th>
              <th className="border border-gray-300 p-2">Extend Minutes</th>
              <th className="border border-gray-300 p-2">Message</th>
              <th className="border border-gray-300 p-2">Requested At</th>
              <th className="border border-gray-300 p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id}>
                <td className="border border-gray-300 p-2">{req.student_name}</td>
                <td className="border border-gray-300 p-2 text-center">{req.extend_minutes}</td>
                <td className="border border-gray-300 p-2">{req.personal_message || '-'}</td>
                <td className="border border-gray-300 p-2">{new Date(req.created_at).toLocaleString()}</td>
                <td className="border border-gray-300 p-2 text-center space-x-2">
                  <button
                    disabled={updatingId === req.id}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:opacity-50"
                    onClick={() => handleAction(req.id, 'approve')}
                  >
                    Approve
                  </button>
                  <button
                    disabled={updatingId === req.id}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:opacity-50"
                    onClick={() => handleAction(req.id, 'reject')}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
