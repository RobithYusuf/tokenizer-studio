import React, { useEffect } from 'react';
import { UsageLog } from '../types';

interface ViewLogModalProps {
  isOpen: boolean;
  log: UsageLog | null;
  onClose: () => void;
}

const ViewLogModal: React.FC<ViewLogModalProps> = ({ isOpen, log, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !log) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-blue-200 bg-blue-50 px-6 py-4">
          <div>
            <h3 className="text-xl font-semibold text-blue-900">Usage Log Details</h3>
            <p className="text-sm text-blue-700">
              {new Date(log.timestamp).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-blue-700 transition-colors hover:bg-blue-100"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto px-6 py-6 space-y-6">
          {/* Model Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-blue-700">Provider</p>
              <p className="mt-1 text-lg font-semibold text-blue-900">{log.provider}</p>
            </div>
            <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-blue-700">Model</p>
              <p className="mt-1 text-lg font-semibold text-blue-900">{log.model}</p>
            </div>
          </div>

          {/* Tokens Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-green-700">Input Tokens</p>
              <p className="mt-1 text-2xl font-semibold text-green-900">{log.inputTokens.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border-2 border-purple-200 bg-purple-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-purple-700">Output Tokens</p>
              <p className="mt-1 text-2xl font-semibold text-purple-900">{log.outputTokens.toLocaleString()}</p>
            </div>
          </div>

          {/* Cost Info */}
          <div className="rounded-lg border-2 border-blue-600 bg-gradient-to-br from-blue-600 to-blue-700 p-5 text-white shadow-lg">
            <p className="text-xs font-medium uppercase tracking-wide text-blue-100">Total Cost</p>
            <div className="mt-2 flex items-baseline gap-4">
              <div>
                <p className="text-3xl font-bold">${log.costUSD.toFixed(6)}</p>
              </div>
              <div className="border-l-2 border-blue-400 pl-4">
                <p className="text-2xl font-semibold">Rp {log.costIDR.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>

          {/* Input Text */}
          {log.inputText && (
            <div>
              <label className="mb-2 block text-sm font-medium text-blue-800">Input Text</label>
              <div className="max-h-60 overflow-y-auto rounded-lg border-2 border-blue-300 bg-gray-50 p-4">
                <pre className="whitespace-pre-wrap break-words text-sm text-gray-800 font-mono">
                  {log.inputText}
                </pre>
              </div>
            </div>
          )}

          {!log.inputText && (
            <div className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4 text-center">
              <p className="text-sm text-yellow-800">No input text saved for this log</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t-2 border-blue-200 bg-blue-50 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewLogModal;
