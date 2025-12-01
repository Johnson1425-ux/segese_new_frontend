import React from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

const PaymentConfirmation = ({ visit, onSuccess }) => {
  const queryClient = useQueryClient();

  const confirmPaymentMutation = useMutation(
    (visitId) => api.patch(`/visits/${visitId}/payment-status`, { paymentConfirmed: true }),
    {
      onSuccess: () => {
        toast.success('Payment confirmed! Patient moved to queue.');
        queryClient.invalidateQueries(['visits']);
        queryClient.invalidateQueries(['visit', visit._id]);
        if (onSuccess) onSuccess();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to confirm payment');
      }
    }
  );

  const handleConfirmPayment = () => {
    if (window.confirm('Confirm that payment has been received?')) {
      confirmPaymentMutation.mutate(visit._id);
    }
  };

  // Only show if visit is pending payment
  if (visit.status !== 'Pending Payment') {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Payment Required
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              This patient does not have insurance coverage and must complete payment before services can be ordered.
            </p>
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={handleConfirmPayment}
              disabled={confirmPaymentMutation.isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {confirmPaymentMutation.isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Confirming...
                </>
              ) : (
                <>
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Confirm Payment Received
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmation;