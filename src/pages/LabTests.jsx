import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import api from '../utils/api';

export default function LabTests() {
  const [labTests, setLabTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLabTests = async () => {
      try {
        const { data } = await api.get('/lab-tests');
        // Filter to show only pending tests
        const pendingTests = data.data.filter(test => test.status === 'Pending');
        setLabTests(pendingTests);
      } catch (error) {
        console.error("Failed to fetch lab tests", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLabTests();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary mb-6">Lab Test Orders</h1>
      <div className="bg-white rounded-xl shadow-md p-6">
        {labTests.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No lab tests found.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ordered On</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {labTests.map((test) => (
                <tr key={test._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {test.patient?.firstName} {test.patient?.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {test.testName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(test.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-sm rounded-full bg-yellow-100 text-yellow-800">
                      {test.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/lab-tests/${test._id}`} className="btn-primary text-sm font-medium">
                      Add Result
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}