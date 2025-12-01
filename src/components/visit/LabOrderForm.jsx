import React, { useCallback, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import Select from 'react-select/async';
import { toast } from 'react-hot-toast';
import { debounce } from 'lodash';
import { labTestService } from '../../utils/labTestService';
import api from '../../utils/api';

const LabOrderForm = ({ visitId, existingOrders, patientId, visitStatus }) => {
  const { control, register, handleSubmit, reset, formState: { isSubmitting } } = useForm();
  const queryClient = useQueryClient();
  const [paymentRequired, setPaymentRequired] = useState(false);

  const mutation = useMutation(labTestService.create, {
    onSuccess: () => {
      toast.success('Lab order added!');
      queryClient.invalidateQueries(['visit', visitId]);
      setPaymentRequired(false);
      reset();
    },
    onError: (error) => {
      if (error.response?.data?.requiresPayment) {
        setPaymentRequired(true);
        toast.error('Payment required before ordering lab tests. Please direct patient to reception for payment.', {
          duration: 5000,
        });
      } else {
        toast.error(error.response?.data?.message || 'Failed to add order.');
      }
    },
  });

  // Define loadOptions with useCallback to prevent recreation
  const loadOptions = useCallback(async (inputValue, callback) => {
    if (inputValue.length < 2) {
      callback([]);
      return;
    }
    try {
      const { data } = await api.get(`/services/search?category=Lab Test&name=${inputValue}`);
      const options = data.data.map(service => ({
        value: service.name,
        label: `${service.name} - Tsh.${service.price}`
      }));
      callback(options);
    } catch (error) {
      console.error("Error searching lab tests:", error);
      callback([]);
    }
  }, []);

  // Use useMemo to create the debounced function only once
  const debouncedLoadOptions = useMemo(
    () => debounce(loadOptions, 400),
    [loadOptions]
  );

  const onSubmit = (data) => {
    if (!data.test) {
        toast.error("Please select a test.");
        return;
    }
    const orderData = { testName: data.test.value, notes: data.notes };
    mutation.mutate({ visit: visitId, patient: patientId, orderData });
  };

  // Check if visit is pending payment
  const isPendingPayment = visitStatus === 'Pending Payment';

  return (
    <div className="container mx-auto p-6">
      <h4 className="font-semibold mb-2">New Lab Order</h4>
      
      {/* Payment Warning Banner */}
      {(isPendingPayment || paymentRequired) && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-800">
                Payment Required
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                This patient needs to complete payment at reception before lab tests can be ordered.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-6 p-4 border rounded-lg">
        <div>
          <label className="label-field">Search for a Test</label>
          <Controller
            name="test"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                loadOptions={debouncedLoadOptions}
                isClearable
                placeholder="Type to search..."
                isDisabled={isPendingPayment}
                noOptionsMessage={({ inputValue }) => 
                  inputValue.length < 2 ? "Please enter 2 or more characters" : "No tests found"
                }
              />
            )}
          />
        </div>
        <div>
          <label className="label-field">Notes (Optional)</label>
          <input 
            {...register('notes')} 
            className="input-field"
            disabled={isPendingPayment}
          />
        </div>
        <div className="flex justify-end">
          <button 
            type="submit" 
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={isSubmitting || isPendingPayment}
          >
            Add Order
          </button>
        </div>
      </form>
    </div>
  );
};

export default LabOrderForm;