"use client";

import React, { useState } from 'react';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';

export default function TestSyncPage() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    try {
      setSyncing(true);
      setError(null);
      setResult(null);

      const response = await fetch('/api/cron/bootcamp-sync', {
        method: 'POST'
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Sync failed');
      }
    } catch (err) {
      console.error('Sync error:', err);
      setError('Failed to trigger sync');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-black/60 backdrop-blur-sm border border-yellow-500/30 rounded-xl p-8">
          <h1 className="text-3xl font-bold text-white mb-6">Bootcamp Sync Test</h1>
          
          <p className="text-gray-400 mb-6">
            This page allows you to manually trigger the bootcamp sync process for testing purposes.
          </p>

          <button
            onClick={handleSync}
            disabled={syncing}
            className="w-full px-6 py-4 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {syncing ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5 mr-2" />
                Trigger Sync
              </>
            )}
          </button>

          {/* Success Result */}
          {result && (
            <div className="mt-6 bg-green-500/20 border border-green-500/50 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <h3 className="text-xl font-bold text-white">Sync Successful!</h3>
              </div>
              <div className="space-y-2 text-gray-300">
                <p><strong>Message:</strong> {result.message}</p>
                {result.results && result.results.length > 0 && (
                  <div className="mt-4">
                    <p className="font-bold text-white mb-2">Results:</p>
                    {result.results.map((r: any, i: number) => (
                      <div key={i} className="bg-black/40 rounded p-3 mb-2">
                        <p><strong>Bootcamp:</strong> {r.name}</p>
                        <p><strong>Synced:</strong> {r.synced || 0} participants</p>
                        {r.errors && r.errors.length > 0 && (
                          <p className="text-red-400"><strong>Errors:</strong> {r.errors.length}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-6 bg-red-500/20 border border-red-500/50 rounded-lg p-6">
              <div className="flex items-center space-x-2">
                <XCircle className="w-6 h-6 text-red-500" />
                <h3 className="text-xl font-bold text-white">Sync Failed</h3>
              </div>
              <p className="text-red-400 mt-2">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
