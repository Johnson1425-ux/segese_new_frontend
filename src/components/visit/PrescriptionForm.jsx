import React, { useCallback, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import Select from 'react-select/async';
import { toast } from 'react-hot-toast';
import { debounce } from 'lodash';
import api from '../../utils/api';

const prescriptionService = {
  create: (data) => api.post('/prescriptions', data)
};

const PrescriptionForm = ({ visitId, patientId, existingPrescriptions, visitStatus }) => {
  const { control, handleSubmit, register, reset, formState: { isSubmitting } } = useForm({
    defaultValues: {
      medication: null,
      dosage: '',
      frequency: '',
      duration: '',
      notes: ''
    }
  });
  const queryClient = useQueryClient();
  const [paymentRequired, setPaymentRequired] = useState(false);

  const loadOptions = useCallback(async (inputValue, callback) => {
    if (inputValue.length < 2) {
      callback([]);
      return;
    }
    try {
      const { data } = await api.get(`/medications/search?name=${inputValue}`);
      const options = data.data.map(medication => ({
        value: medication.name,
        label: `${medication.name} - $${medication.price}`,
        price: medication.price
      }));
      callback(options);
    } catch (error) {
      console.error("Error searching medications:", error);
      callback([]);
    }
  }, []);

  const debouncedLoadOptions = useMemo(
    () => debounce(loadOptions, 400),
    [loadOptions]
  );

  const mutation = useMutation(prescriptionService.create, {
    onSuccess: () => {
      toast.success('Prescription added successfully!');
      queryClient.invalidateQueries(['visit', visitId]);
      setPaymentRequired(false);
      reset();
    },
    onError: (error) => {
      if (error.response?.data?.requiresPayment) {
        setPaymentRequired(true);
        toast.error('Payment required before ordering prescriptions. Please direct patient to reception for payment.', {
          duration: 5000,
        });
      } else {
        const errorMessage = error.response?.data?.message || 'Failed to add prescription.';
        toast.error(errorMessage);
      }
    },
  });

  const onSubmit = (data) => {
    // Validate that medication is selected
    if (!data.medication || !data.medication.value) {
      toast.error('Please select a medication');
      return;
    }

    // Prepare the prescription data
    const prescriptionData = {
      medication: data.medication.value,
      dosage: data.dosage,
      frequency: data.frequency,
      duration: data.duration,
      notes: data.notes
    };

    // Send to backend
    mutation.mutate({ 
      visitId, 
      patient: patientId, 
      prescriptionData 
    });
  };

  // Check if visit is pending payment
  const isPendingPayment = visitStatus === 'Pending Payment';

  return (
    <div>
      <h4 className="font-semibold mb-2">New Prescription</h4>
      
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
                This patient needs to complete payment at reception before prescriptions can be ordered.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-6 p-4 border rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label-field">Medication *</label>
            <Controller
              name="medication"
              control={control}
              rules={{ required: 'Medication is required' }}
              render={({ field }) => (
                <Select
                  {...field}
                  loadOptions={debouncedLoadOptions}
                  isClearable
                  placeholder="Type to search medications..."
                  noOptionsMessage={({ inputValue }) => 
                    inputValue.length < 2 
                      ? "Please enter 2 or more characters" 
                      : "No medications found"
                  }
                  isDisabled={isPendingPayment}
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: '38px',
                      borderColor: '#d1d5db',
                    })
                  }}
                />
             )}
            /> 
          </div>
          <div>
            <label className="label-field">Dosage (e.g., 1 tablet) *</label>
            <input 
              {...register('dosage', { required: true })} 
              className="input-field" 
              placeholder="e.g., 500mg"
              disabled={isPendingPayment}
            />
          </div>
          <div>
            <label className="label-field">Frequency (e.g., Twice a day) *</label>
            <input 
              {...register('frequency', { required: true })} 
              className="input-field" 
              placeholder="e.g., Twice daily"
              disabled={isPendingPayment}
            />
          </div>
          <div>
            <label className="label-field">Duration (e.g., 7 days)</label>
            <input 
              {...register('duration')} 
              className="input-field" 
              placeholder="e.g., 7 days"
              disabled={isPendingPayment}
            />
          </div>
        </div>
        <div>
          <label className="label-field">Notes (Optional)</label>
          <textarea 
            {...register('notes')} 
            className="input-field" 
            rows="2"
            placeholder="Additional instructions or notes"
            disabled={isPendingPayment}
          />
        </div>
        <div className="flex justify-end">
          <button 
            type="submit" 
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={isSubmitting || mutation.isLoading || isPendingPayment}
          >
            {mutation.isLoading ? 'Adding...' : 'Add Prescription'}
          </button>
        </div>
      </form>

      <h4 className="font-semibold mb-2">Existing Prescriptions</h4>
      {existingPrescriptions && existingPrescriptions.length > 0 ? (
        <ul className="space-y-2">
          {existingPrescriptions.map(p => (
            <li key={p._id} className="p-3 border rounded-md bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{p.medication}</p>
                  <p className="text-sm text-gray-600">
                    {p.dosage} • {p.frequency}
                    {p.duration && ` • ${p.duration}`}
                  </p>
                  {p.notes && (
                    <p className="text-sm text-gray-500 mt-1">{p.notes}</p>
                  )}
                </div>
                {p.isActive !== undefined && (
                  <span className={`text-xs px-2 py-1 rounded ${
                    p.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {p.isActive ? 'Active' : 'Inactive'}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 text-sm">No prescriptions yet.</p>
      )}
    </div>
  );
};

export default PrescriptionForm;