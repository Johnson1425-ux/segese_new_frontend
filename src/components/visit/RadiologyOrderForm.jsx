import React, { useCallback } from 'react';
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

const RadiologyOrderForm = ({ visitId, patientId }) => {
  const { control, register, handleSubmit, reset, formState: { errors } } = useForm();
  const queryClient = useQueryClient();

  const mutation = useMutation(radiologyService.create, {
    onSuccess: () => {
      toast.success('Radiology request submitted successfully!');
      queryClient.invalidateQueries(['visit', visitId]);
      reset();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to submit request.');
    },
  });

  const loadOptions = async (inputValue, callback) => {
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
  };

  const debouncedLoadOptions = useCallback(debounce(loadOptions, 400), []);

  const onSubmit = (data) => {
    if (!data.test) {
      toast.error("Please select a test.");
      return;
    }
    const orderData = { scanType: data.test.value, bodyPart: data.bodyPart, reason: data.reason };
    mutation.mutate({ visit: visitId, patient: patientId, orderData });
  };

  return (
    <div className="p-4 border rounded-lg bg-white">
      <h4 className="text-xl font-semibold mb-4 text-gray-700">Order Radiology Scan</h4>
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
          />
          {errors.bodyPart && <p className="text-red-500 text-sm mt-1">{errors.bodyPart.message}</p>}
        </div>

        <div>
          <label className="label-field">Reason for Scan / Clinical Notes</label>
          <textarea 
            {...register("reason", { required: "Reason is required" })} 
            className="input-field" 
            rows="3"
          ></textarea>
          {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason.message}</p>}
        </div>

        <div className="flex justify-end">
          <button type="submit" className="btn-primary" disabled={mutation.isLoading}>
            {mutation.isLoading ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RadiologyOrderForm;