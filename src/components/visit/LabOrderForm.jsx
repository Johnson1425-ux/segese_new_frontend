import React, { useCallback, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from 'react-query';
import Select from 'react-select/async';
import { toast } from 'react-hot-toast';
import { debounce } from 'lodash';
import { labTestService } from '../../utils/labTestService';
import api from '../../utils/api';
import LoadingSpinner from '../common/LoadingSpinner';

const LabOrderForm = ({ visitId, existingOrders, patientId }) => {
  const { control, register, handleSubmit, reset, formState: { isSubmitting } } = useForm();
  const queryClient = useQueryClient();

  const mutation = useMutation(labTestService.create, {
    onSuccess: () => {
      toast.success('Lab order added!');
      queryClient.invalidateQueries(['visit', visitId]);
      reset();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to add order.'),
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
  }, []); // Empty dependency array since api is stable

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

  return (
    <div className="container mx-auto p-6">
      <h4 className="font-semibold mb-2">New Lab Order</h4>
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
                noOptionsMessage={({ inputValue }) => 
                  inputValue.length < 2 ? "Please enter 2 or more characters" : "No tests found"
                }
              />
            )}
          />
        </div>
        <div>
          <label className="label-field">Notes (Optional)</label>
          <input {...register('notes')} className="input-field" />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="btn-primary" disabled={isSubmitting}>Add Order</button>
        </div>
      </form>
    </div>
  );
};

export default LabOrderForm;
