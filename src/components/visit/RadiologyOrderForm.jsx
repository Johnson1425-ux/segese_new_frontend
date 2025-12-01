import React, { useCallback, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import Select from 'react-select/async'
import { toast } from 'react-hot-toast';
import { debounce } from 'lodash';
import api from '../../utils/api';

// Service function for creating a radiology request
const radiologyService = {
  create: (data) => api.post('/radiology', data),
};

const RadiologyOrderForm = ({ visitId, patientId, visitStatus }) => {
  const { control, register, handleSubmit, reset, formState: { errors } } = useForm();
  const queryClient = useQueryClient();
  const [paymentRequired, setPaymentRequired] = useState(false);

  const mutation = useMutation(radiologyService.create, {
    onSuccess: () => {
      toast.success('Radiology request submitted successfully!');
      queryClient.invalidateQueries(['visit', visitId]);
      setPaymentRequired(false);
      reset();
    },
    onError: (error) => {
      if (error.response?.data?.requiresPayment) {
        setPaymentRequired(true);
        toast.error('Payment required before ordering radiology scans. Please direct patient to reception for payment.', {
          duration: 5000,
        });
      } else {
        toast.error(error.response?.data?.message || 'Failed to submit request.');
      }
    },
  });

  const loadOptions = useCallback(async (inputValue, callback) => {
    if (inputValue.length < 2) {
      callback([]);
      return;
    }
    try {
      const { data } = await api.get(`/services/search?category=Imaging&name=${inputValue}`);
      const options = data.data.map(service => ({
        value: service.name,
        label: `${service.name} - Tsh.${service.price}`
      }));
      callback(options);
    } catch (error) {
      console.error("Error searching imaging :", error);
      callback([]);
    }
  }, []);

  const debouncedLoadOptions = useMemo(
    () => debounce(loadOptions, 400),
    [loadOptions]
  );

  const onSubmit = (data) => {
    if (!data.test) {
      toast.error("Please select a test.");
      return;
    }
    const orderData = { scanType: data.test.value, bodyPart: data.bodyPart, reason: data.reason };
    mutation.mutate({ visit: visitId, patient: patientId, orderData });
  };

  // Check if visit is pending payment
  const isPendingPayment = visitStatus === 'Pending Payment';

  return (
    <div className="p-4 border rounded-lg bg-white">
      <h4 className="text-xl font-semibold mb-4 text-gray-700">Order Radiology Scan</h4>
      
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
                This patient needs to complete payment at reception before radiology scans can be ordered.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          <label className="label-field">Body Part to Scan</label>
          <input 
            {...register("bodyPart", { required: "Body part is required" })} 
            className="input-field"
            disabled={isPendingPayment}
          />
          {errors.bodyPart && <p className="text-red-500 text-sm mt-1">{errors.bodyPart.message}</p>}
        </div>
        <div>
          <label className="label-field">Reason for Scan / Clinical Notes</label>
          <textarea 
            {...register("reason", { required: "Reason is required" })} 
            className="input-field" 
            rows="3"
            disabled={isPendingPayment}
          ></textarea>
          {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason.message}</p>}
        </div>
        <div className="flex justify-end">
          <button 
            type="submit" 
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={mutation.isLoading || isPendingPayment}
          >
            {mutation.isLoading ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RadiologyOrderForm;