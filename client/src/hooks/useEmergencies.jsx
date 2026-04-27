import { useState, useEffect, useCallback } from 'react';
import api from '../utils/axios';
import useSocketEvent from './useSocket';
import toast from 'react-hot-toast';

const useEmergencies = (filters = {}) => {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEmergencies = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(filters).toString();
      const { data } = await api.get(`/emergencies?${params}`);
      setEmergencies(data.emergencies || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch emergencies');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchEmergencies();
  }, [fetchEmergencies]);

  // Real-time: new emergency
  useSocketEvent('emergency:new', useCallback((newEmergency) => {
    setEmergencies((prev) => [newEmergency, ...prev]);
    toast.custom(
      (t) => (
        <div className={`hot-toast-custom flex items-center gap-3 px-4 py-3 shadow-2xl min-w-[300px] ${t.visible ? 'animate-fade-in' : 'opacity-0'}`}>
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm text-white">🚨 New Emergency!</p>
            <p className="text-xs text-slate-400">{newEmergency.title} — {newEmergency.location?.area || 'Unknown area'}</p>
          </div>
        </div>
      ),
      { duration: 6000, position: 'top-right' }
    );
  }, []));

  // Real-time: updated emergency
  useSocketEvent('emergency:updated', useCallback((updated) => {
    setEmergencies((prev) =>
      prev.map((e) => (e._id === updated._id ? updated : e))
    );
  }, []));

  return { emergencies, loading, error, refetch: fetchEmergencies };
};

export default useEmergencies;
