import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../utils/api'; 


const AddEditClient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [clientData, setClientData] = useState({
    name: '',
    email: '',
    company: '',
    industry: '',
    phone: '',
    gstNumber: '',
    address: '',
    gstin: '',
    city: '',
    state: '',
    pincode: '',
    country: '',
    pan: '',
  });

  useEffect(() => {
    if (isEditing) {
      const fetchClient = async () => {
        try {
          const response = await api.get(`/clients/${id}`);
          const data = response.data;
          setClientData({
          name: data.name || '',
          email: data.email || '',
          company: data.company || '',
          industry: data.industry || '',
          phone: data.phone || '',
          gstNumber: data.gstNumber || '',
          gstin: data.gstin || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          pincode: data.pincode || '',
          country: data.country || '',
          pan: data.pan || '',
        });
        } catch (err) {
          console.error('Failed to fetch client', err);
        }
      };
      fetchClient();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClientData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    if (isEditing) {
      await api.put(`/clients/${id}`, clientData);
    } else {
      await api.post('/clients', clientData);
    }

    navigate('/clients');
  } catch (error) {
    console.error('Error saving client:', error);
  }
};

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-2xl font-semibold mb-6">{isEditing ? 'Edit Client' : 'Add New Client'}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-1 font-medium">Name</label>
            <input
              type="text"
              name="name"
              value={clientData.name}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={clientData.email}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Company</label>
            <input
              type="text"
              name="company"
              value={clientData.company}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="Acme Inc."
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Industry</label>
            <input
              type="text"
              name="industry"
              value={clientData.industry}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="Tech, Finance, etc."
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Phone</label>
            <input
              type="tel"
              name="phone"
              value={clientData.phone}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="+91 9876543210"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">GST Number</label>
            <input
              type="text"
              name="gstNumber"
              value={clientData.gstNumber}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="22AAAAA0000A1Z5"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">PAN</label>
            <input
              type="text"
              name="pan"
              value={clientData.pan}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="ABCDE1234F"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">City</label>
            <input
              type="text"
              name="city"
              value={clientData.city}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="Mumbai"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">State</label>
            <input
              type="text"
              name="state"
              value={clientData.state}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="Maharashtra"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">PIN / ZIP</label>
            <input
              type="text"
              name="pincode"
              value={clientData.pincode}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="400001"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Country</label>
            <input
              type="text"
              name="country"
              value={clientData.country}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="India"
            />
          </div>

          <div className="md:col-span-2 flex gap-4 mt-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              {isEditing ? 'Update Client' : 'Create Client'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/clients')}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
            >
              Go Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditClient;
