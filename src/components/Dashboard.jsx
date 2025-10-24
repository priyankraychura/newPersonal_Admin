import React,  { useState, useEffect } from 'react';
import { BarChart3, Database, Server, Folder, Activity, HardDrive } from 'lucide-react';
import AdminAPI from '../services/adminAPI';


const App = () => {
  const [atlasData, setAtlasData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- 1. ADD useEffect TO FETCH DATA ---
  useEffect(() => {
    const fetchAtlasData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // This will make a GET request to '/api/atlas-info' because of the Vite proxy
        const response = await AdminAPI.get('/atlas-info'); 

        setAtlasData(response.data);
      } catch (err) {
        console.error("Error fetching Atlas data:", err);
        setError('Failed to load Atlas statistics. Please check the backend connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchAtlasData();
  }, []); // The empty array [] ensures this runs only once when the component mounts


  // Dummy data for business metrics
  const stats = [
    { title: 'Total Users', value: '1,234', color: 'blue', change: '+12%' },
    { title: 'Revenue', value: '$12,345', color: 'green', change: '+8%' },
    { title: 'Orders', value: '456', color: 'purple', change: '+23%' },
    { title: 'Growth', value: '89%', color: 'pink', change: '+5%' }
  ];

  const AtlasStatCard = ({ icon: Icon, title, value, color, loading }) => {
    const colorClasses = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      purple: 'text-purple-600 bg-purple-100',
      yellow: 'text-yellow-600 bg-yellow-100',
      orange: 'text-orange-600 bg-orange-100',
    };
    const statusColorClass = value === 'IDLE' ? 'text-green-500' : 'text-yellow-500';

    return (
      <div className="bg-white rounded-xl shadow-lg p-6 flex items-center space-x-4 hover:shadow-xl transition-shadow duration-300">
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          {loading ? (
            <div className="animate-pulse bg-gray-200 h-6 w-32 mt-1 rounded-md"></div>
          ) : (
            <p className={`text-2xl font-bold text-gray-800 mt-1 ${title === 'Status' ? statusColorClass : ''}`}>
              {value}
            </p>
          )}
        </div>
      </div>
    );
  };


  return (
    <div className="space-y-6">
      <div className="">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>

        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">MongoDB Atlas Stats</h2>
          
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AtlasStatCard icon={Database} title="Cluster Name" value={atlasData?.clusterName || 'N/A'} color="blue" loading={loading} />
            <AtlasStatCard icon={Server} title="Status" value={atlasData?.status || 'N/A'} color="green" loading={loading} />
            <AtlasStatCard icon={HardDrive} title="Disk Size Used" value={atlasData?.diskSizeUsed || 'N/A'} color="orange" loading={loading} />
            {/* --- 2. CORRECTED PROP from totalRequests to totalRequests24h --- */}
            <AtlasStatCard 
              icon={Activity} 
              title="Total Requests (24h)" 
              value={atlasData?.totalRequests24h?.toLocaleString() ?? '0'} 
              color="purple" 
              loading={loading} 
            />
          </div>

          <div className="mt-6 bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <Folder className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-gray-600 text-sm font-medium">Collections</h3>
                {loading ? (
                  <div className="animate-pulse bg-gray-200 h-5 w-64 mt-2 rounded-md"></div>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {atlasData?.collections?.map(col => (
                      <span key={col} className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-1 rounded-full">{col}</span>
                    )) || 'N/A'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Business Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
                    <p className={`${stat.color === 'blue' ? 'text-blue-600' : stat.color === 'green' ? 'text-green-600' : stat.color === 'purple' ? 'text-purple-600' : 'text-pink-600'} text-sm font-medium mt-1`}>{stat.change} from last month</p>
                  </div>
                  <div className={`${stat.color === 'blue' ? 'bg-blue-100' : stat.color === 'green' ? 'bg-green-100' : stat.color === 'purple' ? 'bg-purple-100' : 'bg-pink-100'} p-3 rounded-full`}>
                    <BarChart3 className={`w-6 h-6 ${stat.color === 'blue' ? 'text-blue-600' : stat.color === 'green' ? 'text-green-600' : stat.color === 'purple' ? 'text-purple-600' : 'text-pink-600'}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
