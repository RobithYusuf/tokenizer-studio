import React, { useContext, useMemo, useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { AppContext } from '../App';
import Card from '../components/Card';
import { PROVIDERS } from '../constants';
import { Provider, UsageLog } from '../types';
import ViewLogModal from '../components/ViewLogModal';
import ConfirmModal from '../components/ConfirmModal';

const DashboardPage: React.FC = () => {
  const appContext = useContext(AppContext);
  const usageLogs = appContext?.usageLogs || [];
  const [selectedLog, setSelectedLog] = useState<UsageLog | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState<UsageLog | null>(null);

  const stats = useMemo(() => {
    return usageLogs.reduce(
      (acc, log) => {
        acc.totalCostUSD += log.costUSD;
        acc.totalCostIDR += log.costIDR;
        acc.totalTokens += log.inputTokens + log.outputTokens;
        acc.requests += 1;
        const timestamp = new Date(log.timestamp).getTime();
        acc.lastUpdated = Math.max(acc.lastUpdated, timestamp);
        return acc;
      },
      { totalCostUSD: 0, totalCostIDR: 0, totalTokens: 0, requests: 0, lastUpdated: 0 }
    );
  }, [usageLogs]);

  const chartData = useMemo(() => {
    const sortedLogs = [...usageLogs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const dailyCosts: { [key: string]: number } = {};

    sortedLogs.forEach(log => {
      const date = new Date(log.timestamp).toLocaleDateString('en-CA');
      dailyCosts[date] = (dailyCosts[date] || 0) + log.costUSD;
    });

    return Object.keys(dailyCosts)
      .sort()
      .map(date => ({
        name: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        cost: parseFloat(dailyCosts[date].toFixed(4)),
      }));
  }, [usageLogs]);

  const providerSummary = useMemo(() => {
    const summaryMap = new Map<Provider, { usd: number; idr: number; requests: number }>();
    usageLogs.forEach(log => {
      const current = summaryMap.get(log.provider) ?? { usd: 0, idr: 0, requests: 0 };
      current.usd += log.costUSD;
      current.idr += log.costIDR;
      current.requests += 1;
      summaryMap.set(log.provider, current);
    });
    return Array.from(summaryMap.entries())
      .map(([provider, values]) => ({ provider, usd: values.usd, idr: values.idr, requests: values.requests }))
      .sort((a, b) => b.usd - a.usd);
  }, [usageLogs]);

  const getProviderName = (providerId: Provider) => PROVIDERS.find(p => p.id === providerId)?.name || providerId;
  const avgTokensPerRequest = stats.requests === 0 ? 0 : Math.round(stats.totalTokens / stats.requests);
  const lastUpdated = stats.lastUpdated ? new Date(stats.lastUpdated) : null;
  const chartStroke = '#2563eb';

  const handleViewLog = (log: UsageLog) => {
    setSelectedLog(log);
    setIsViewModalOpen(true);
  };

  const handleDeleteClick = (log: UsageLog) => {
    setLogToDelete(log);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (logToDelete && appContext) {
      appContext.deleteUsageLog(logToDelete.id);
      appContext.showToast('Usage log deleted successfully', 'success');
      setIsDeleteModalOpen(false);
      setLogToDelete(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-sm font-medium text-blue-700">Total cost (USD)</p>
          <p className="mt-2 text-3xl font-semibold text-blue-900">${stats.totalCostUSD.toFixed(4)}</p>
          <p className="mt-1 text-xs text-blue-700">{usageLogs.length} sessions</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-blue-700">Total cost (IDR)</p>
          <p className="mt-2 text-3xl font-semibold text-blue-900">Rp {stats.totalCostIDR.toLocaleString('id-ID')}</p>
          <p className="mt-1 text-xs text-blue-700">Providers {providerSummary.length}</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-blue-700">Total tokens</p>
          <p className="mt-2 text-3xl font-semibold text-blue-900">{stats.totalTokens.toLocaleString()}</p>
          <p className="mt-1 text-xs text-blue-700">Avg {avgTokensPerRequest.toLocaleString()} / request</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-blue-700">Requests</p>
          <p className="mt-2 text-3xl font-semibold text-blue-900">{stats.requests.toLocaleString()}</p>
          <p className="mt-1 text-xs text-blue-700">
            {lastUpdated ? `Updated ${lastUpdated.toLocaleString()}` : 'No data'}
          </p>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card className="p-0">
          <div className="space-y-6 p-6">
            <div>
              <h3 className="text-lg font-semibold text-blue-900">Cost trend</h3>
              <p className="text-sm text-blue-700">Daily totals in USD.</p>
            </div>
            {chartData.length === 0 ? (
              <div className="py-12 text-center text-sm text-blue-700">
                Log an estimate to see data here.
              </div>
            ) : (
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="totalCostGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartStroke} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={chartStroke} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(191, 219, 254, 0.4)" />
                    <XAxis dataKey="name" stroke="rgba(37, 99, 235, 0.8)" />
                    <YAxis stroke="rgba(37, 99, 235, 0.8)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '2px solid #3b82f6',
                        borderRadius: '12px',
                        color: '#1e3a8a',
                      }}
                    />
                    <Area type="monotone" dataKey="cost" stroke={chartStroke} fillOpacity={1} fill="url(#totalCostGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-blue-900">Provider mix</h3>
          <div className="mt-4 space-y-3 text-sm text-blue-800">
            {providerSummary.length === 0 ? (
              <p className="text-sm text-blue-700">No records yet.</p>
            ) : (
              providerSummary.map(item => (
                <div key={item.provider} className="flex items-center justify-between rounded-lg border-2 border-blue-200 bg-white px-3 py-2 shadow-md">
                  <div>
                    <p className="font-medium text-blue-900">{getProviderName(item.provider)}</p>
                    <p className="text-xs text-blue-700">{item.requests} requests · Rp {item.idr.toLocaleString('id-ID')}</p>
                  </div>
                  <p className="font-semibold text-blue-900">${item.usd.toFixed(4)}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </section>

      <Card className="p-0">
        <div className="overflow-hidden rounded-xl">
          <div className="border-b-2 border-blue-200 bg-blue-100 px-6 py-4 text-sm font-semibold uppercase tracking-wide text-blue-800">
            Recent logs
          </div>
          {usageLogs.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-blue-700">
              No usage logged yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-blue-200 text-sm">
                <thead className="bg-white text-left text-xs font-semibold uppercase tracking-wide text-blue-700">
                  <tr>
                    <th className="px-6 py-3">Timestamp</th>
                    <th className="px-6 py-3">Provider</th>
                    <th className="px-6 py-3">Model</th>
                    <th className="px-6 py-3 text-right">Tokens (in/out)</th>
                    <th className="px-6 py-3 text-right">Cost (USD)</th>
                    <th className="px-6 py-3 text-right">Cost (IDR)</th>
                    <th className="px-6 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-200 bg-white">
                  {usageLogs.slice(0, 15).map((log) => (
                    <tr key={log.id} className="hover:bg-blue-50 transition-colors cursor-pointer" onClick={() => handleViewLog(log)}>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-blue-700">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-900">
                        {log.type === 'simulator-budget' || log.type === 'simulator-volume' ? (
                          <span className="inline-flex items-center gap-1">
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Simulator</span>
                            {getProviderName(log.provider)}
                          </span>
                        ) : (
                          getProviderName(log.provider)
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">{log.model}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-right text-blue-700">
                        {log.type === 'simulator-budget' || log.type === 'simulator-volume' ? (
                          <span className="text-xs">
                            {log.simulatorData?.totalRequests?.toLocaleString() || 'N/A'} requests<br/>
                            <span className="text-[10px] text-blue-500">
                              {log.simulatorData?.modality || 'N/A'}
                            </span>
                          </span>
                        ) : (
                          `${log.inputTokens.toLocaleString()} / ${log.outputTokens.toLocaleString()}`
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-blue-900">
                        ${log.costUSD.toFixed(6)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-blue-900">
                        Rp {log.costIDR.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewLog(log)}
                            className="rounded-lg bg-blue-100 p-2 text-blue-700 transition-colors hover:bg-blue-200"
                            title="View details"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(log)}
                            className="rounded-lg bg-red-100 p-2 text-red-700 transition-colors hover:bg-red-200"
                            title="Delete log"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      <ViewLogModal
        isOpen={isViewModalOpen}
        log={selectedLog}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedLog(null);
        }}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Log"
        message={`Are you sure you want to delete this log? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setLogToDelete(null);
        }}
        type="warning"
      />
    </div>
  );
};

export default DashboardPage;
