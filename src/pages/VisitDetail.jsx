import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import DiagnosisForm from '../components/visit/DiagnosisForm';
import LabOrderForm from '../components/visit/LabOrderForm';
import PrescriptionForm from '../components/visit/PrescriptionForm';
import RadiologyOrderForm from '../components/visit/RadiologyOrderForm';

export default function VisitDetail() {
  const { id } = useParams();
  const [visit, setVisit] = useState(null);
  const [activeTab, setActiveTab] = useState('diagnosis');

  useEffect(() => {
    const fetchVisit = async () => {
      const { data } = await api.get(`/visits/${id}`);
      setVisit(data.data);
    };
    fetchVisit();
  }, [id]);

  if (!visit) return <div>Loading visit details...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">
        Visit Details for {visit.patient.firstName} {visit.patient.lastName}
      </h1>
      
      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="flex space-x-4">
          <button onClick={() => setActiveTab('diagnosis')} className={`py-2 px-4 ${activeTab === 'diagnosis' && 'border-b-2 border-blue-500'}`}>Diagnosis</button>
          <button onClick={() => setActiveTab('labs')} className={`py-2 px-4 ${activeTab === 'labs' && 'border-b-2 border-blue-500'}`}>Lab Tests</button>
          <button onClick={() => setActiveTab('radiology')} className={`py-2 px-4 ${activeTab === 'radiology' && 'border-b-2 border-blue-500'}`}>Radiology</button>
          <button onClick={() => setActiveTab('prescription')} className={`py-2 px-4 ${activeTab === 'prescription' && 'border-b-2 border-blue-500'}`}>Prescription</button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'diagnosis' && (
          <div>
            <h2 className="text-xl font-semibold">Diagnosis</h2>
            <DiagnosisForm visitId={id} patientId={visit.patient._id} />
            {/* List existing diagnoses here */}
          </div>
        )}

        {activeTab === 'labs' && (
          <div>
            <h2 className="text-xl font-semibold">Lab Orders & Results</h2>
            <LabOrderForm visitId={id} patientId={visit.patient._id} />
            {/* List existing lab orders and their results here */}
            <ul>
              {visit.labOrders.map(order => (
                <li key={order._id}>
                  {order.testName} - <strong>{order.status}</strong>
                  {order.results && <p>Result: {order.results}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'radiology' && (
          <div>
            <RadiologyOrderForm visitId={id} patientId={visit.patient._id} />
            {/* You can also list existing radiology orders here if needed */}
          </div>
        )}

        {activeTab === 'prescription' && (
          <div>
            <h2 className="text-xl font-semibold">Prescriptions</h2>
            <PrescriptionForm visitId={id} patientId={visit.patient._id} />
            {/* List existing prescriptions here */}
          </div>
        )}
      </div>
    </div>
  );
}