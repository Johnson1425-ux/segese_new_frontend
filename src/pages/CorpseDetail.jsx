import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import api from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Service functions for fetching and updating a single corpse
const corpseService = {
  getById: async (id) => {
    const response = await api.get(`/corpses/${id}`);
    return response.data;
  },
  update: async ({ id, data }) => {
    const response = await api.put(`/corpses/${id}`, data);
    return response.data;
  },
};

const CorpseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Fetch the corpse data
  const { data: corpseData, isLoading, error } = useQuery(
    ['corpse', id],
    () => corpseService.getById(id),
    {
      enabled: !!id, // Only run query if ID exists
    }
  );

  const corpse = corpseData?.data;

  // Populate form with fetched data
  useEffect(() => {
    if (corpse) {
      reset({
        firstName: corpse.firstName,
        middleName: corpse.middleName,
        lastName: corpse.lastName,
        sex: corpse.sex,
        dateOfDeath: corpse.dateOfDeath ? new Date(corpse.dateOfDeath).toISOString().split('T')[0] : '',
        causeOfDeath: corpse.causeOfDeath,
        cabinetNumber: corpse.cabinetNumber,
        status: corpse.status,
        'nextOfKin.firstName': corpse.nextOfKin?.firstName,
        'nextOfKin.middleName': corpse.nextOfKin?.middleName,
        'nextOfKin.lastName': corpse.nextOfKin?.lastName,
        'nextOfKin.relationship': corpse.nextOfKin?.relationship,
        'nextOfKin.phone': corpse.nextOfKin?.phone,
      });
    }
  }, [corpse, reset]);

  // Mutation for updating the data
  const mutation = useMutation(corpseService.update, {
    onSuccess: () => {
      toast.success('Record updated successfully!');
      queryClient.invalidateQueries(['corpse', id]);
      queryClient.invalidateQueries('corpses');
      navigate('/corpses');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Update failed.');
    },
  });

  const onSubmit = (data) => {
    mutation.mutate({ id, data });
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 text-center">Error loading corpse details.</div>;
  if (!corpse) return <div className="text-center">No corpse data found.</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between utems-center mb-4">
        <h1 className="text-3xl font-bold text-gray-800">Manage Corpse Record</h1>
        <button onClick={() => navigate('/corpses')} className="btn-secondary inline-flex items-center mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>
      </div>

      
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl">
        <div className="card">
          {/* Column 1: Editable Corpse Information */}
          <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b">Deceased Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                {...register("firstName", { required: true })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Middle Name
              </label>
              <input
                {...register("middleName", { required: true })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                {...register("lastName", { required: true })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select {...register("status")}
                className="input-field"
              >
                <option value="In Storage">In Storage</option>
                <option value="Awaiting Autopsy">Awaiting Autopsy</option>
                <option value="Released">Released</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cabinet Number
              </label>
              <input 
                {...register("cabinetNumber")} 
                className="input-field" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cause of Death
              </label>
              <textarea 
                {...register("causeOfDeath")}
                className="input-field" 
                rows="3"
              >
              </textarea>
            </div>
          </div>
          <br />

          {/* Next of Kin Information */}
          <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b">Next of Kin Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input 
                {...register("nextOfKin.firstName")}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Middle Name
              </label>
              <input 
                {...register("nextOfKin.middleName")}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input 
                {...register("nextOfKin.lastName")}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relationship
              </label>
              <input 
                {...register("nextOfKin.relationship")}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                {...register("nextOfKin.phone")}
                className="input-field"
              />
            </div>
          </div>
          <br />

          <div className="flex justify-end pt-4">
            <button type="submit" className="btn-primary" disabled={mutation.isLoading}>
              {mutation.isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};

export default CorpseDetail;