import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

// This is a new service function we'll need.
const corpseService = {
  register: (data) => api.post('/corpses', data),
};

const CorpseRegistration = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const mutation = useMutation(corpseService.register, {
    onSuccess: () => {
      toast.success('Corpse registered successfully!');
      reset();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to register corpse.');
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Corpse Registration</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Deceased Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type= "text"
                {...register("firstName", { required: "First name is required" })} 
                className={`input-field ${errors.firstName ? 'border-red-500' : ''}`}
                placeholder= "Enter corpse first name"
              />
              {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Middle Name *
              </label>
              <input
                type= "text"
                {...register("middleName", { required: "Middle name is required" })} 
                className={`input-field ${errors.middleName ? 'border-red-500' : ''}`}
                placeholder= "Enter corpse middle name"
              />
              {errors.middleName && <p className="text-red-500 text-sm mt-1">{errors.middleName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type= "text"
                {...register("lastName", { required: "Last name is required" })} 
                className={`input-field ${errors.lastName ? 'border-red-500' : ''}`}
                placeholder= "Enter corpse last name"
              />
              {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sex
              </label>
              <select
                {...register("sex", { required: "Sex is required" })}
                className={`input-field ${errors.sex ? 'border-red-500' : ' '}`}
              >
                <option value="">Select Sex</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              {errors.sex && <p className="text-red-500 text-sm mt-1">{errors.sex.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              <input
                type="date" 
                {...register("dateOfBirth", { required: "Date of birth is required" })}
                className={`input-field ${errors.dateOfBirth ? 'border-red-500' : ''}`}
                placeholder="Enter corpse birth date"
              />
              {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Death
              </label>
              <input
                type="date" 
                {...register("dateOfDeath", { required: "Date of death is required" })}
                className={`input-field ${errors.dateOfDeath ? 'border-red-500' : ''}`}
              />
              {errors.dateOfDeath && <p className="text-red-500 text-sm mt-1">{errors.dateOfDeath.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cabinet No.
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
                className="input-field" rows="2"
              >
              </textarea>
            </div>
          </div>
          <br />
          {/* Next of Kin Details */}
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Next of Kin Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input 
                {...register("nextOfKin.firstName")} 
                className="input-field"
                placeholder="Enter kin first name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Middle Name
              </label>
              <input 
                {...register("nextOfKin.middleName")} 
                className="input-field"
                placeholder="Enter kin first name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input 
                {...register("nextOfKin.lastName")} 
                className="input-field"
                placeholder="Enter kin first name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relationship
              </label>
              <input 
                {...register("nextOfKin.relationship")}
                className="input-field"
                placeholder="Enter kin relationship"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input 
                {...register("nextOfKin.phone")}
                className="input-field"
                placeholder="Enter kin phone number"
              />
            </div>
          </div>
          <br />

          <div className="flex justify-end pt-4">
            <button type="submit" className="btn-primary" disabled={mutation.isLoading}>
              {mutation.isLoading ? 'Registering...' : 'Register Corpse'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CorpseRegistration;