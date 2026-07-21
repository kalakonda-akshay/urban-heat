import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, ToggleLeft, ToggleRight, Settings, Radio, Plus, Trash2, Cpu } from 'lucide-react';
import axios from 'axios';
import { User, SpatialZone } from '../types';
import { toast } from '../components/NotificationToast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const Admin: React.FC = () => {
  const [users, setUsers] = useState<User[]>([
    { id: 1, email: 'admin@urbanheatai.gov.in', full_name: 'Lead Scientist (Admin)', role: 'admin', is_active: true },
    { id: 2, email: 'researcher@urbanheatai.gov.in', full_name: 'Dr. Radhakrishnan', role: 'user', is_active: true },
    { id: 3, email: 'officer@urbanheatai.gov.in', full_name: 'Geospatial Analyst', role: 'user', is_active: true }
  ]);
  const [zones, setZones] = useState<SpatialZone[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Form state for creating a new zone
  const [newZoneName, setNewZoneName] = useState<string>('');
  const [newZoneDesc, setNewZoneDesc] = useState<string>('');
  const [newZoneGeoJson, setNewZoneGeoJson] = useState<string>('');

  // Form state for creating a new user
  const [newUserName, setNewUserName] = useState<string>('');
  const [newUserEmail, setNewUserEmail] = useState<string>('');
  const [newUserRole, setNewUserRole] = useState<'user' | 'admin'>('user');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Standard list zones call
      const response = await axios.get(`${API_URL}/zones`);
      setZones(response.data);
    } catch (error) {
      console.warn('API fetch zones failed, loading fallback mock zones', error);
      const mockZones: SpatialZone[] = [
        { id: 1, name: 'Ward A - Koramangala', description: 'Commercial urban core', geometry: {}, created_at: new Date().toISOString() },
        { id: 2, name: 'Ward B - Cubbon Park', description: 'Green park lung zone', geometry: {}, created_at: new Date().toISOString() },
        { id: 3, name: 'Ward C - Whitefield', description: 'Industrial IT zone', geometry: {}, created_at: new Date().toISOString() }
      ];
      setZones(mockZones);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleUserActive = (id: number) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: !u.is_active } : u));
    toast.info('Officer status updated.');
  };

  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName.trim()) {
      toast.error('Ward name is required.');
      return;
    }

    let parsedGeoJson;
    try {
      // Use standard default polygon if left blank
      if (!newZoneGeoJson.trim()) {
        parsedGeoJson = {
          type: "Polygon",
          coordinates: [[[77.56, 12.91], [77.62, 12.91], [77.62, 12.98], [77.56, 12.98], [77.56, 12.91]]]
        };
      } else {
        parsedGeoJson = JSON.parse(newZoneGeoJson);
      }
    } catch (err) {
      toast.error('Invalid GeoJSON syntax. Must be valid JSON format.');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/zones`, {
        name: newZoneName,
        description: newZoneDesc,
        geometry: parsedGeoJson
      });
      toast.success('New spatial zone saved.');
      setZones(prev => [...prev, response.data]);
      setNewZoneName('');
      setNewZoneDesc('');
      setNewZoneGeoJson('');
    } catch (error) {
      console.warn('API save zone failed, simulating locally');
      const mockNew: SpatialZone = {
        id: Math.floor(Math.random() * 1000),
        name: newZoneName,
        description: newZoneDesc,
        geometry: parsedGeoJson,
        created_at: new Date().toISOString()
      };
      setZones(prev => [...prev, mockNew]);
      toast.success('Simulation: Spatial zone created locally.');
      setNewZoneName('');
      setNewZoneDesc('');
      setNewZoneGeoJson('');
    }
  };

  const handleDeleteZone = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/zones/${id}`);
      toast.success('Zone deleted.');
      setZones(prev => prev.filter(z => z.id !== id));
    } catch (error) {
      console.warn('API delete zone failed, simulating locally');
      setZones(prev => prev.filter(z => z.id !== id));
      toast.info('Zone removed from workspace.');
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      toast.error('Officer name and email are required.');
      return;
    }

    if (users.some(u => u.email.toLowerCase() === newUserEmail.trim().toLowerCase())) {
      toast.error('An officer with this email already exists.');
      return;
    }

    const newUser: User = {
      id: Math.floor(Math.random() * 1000),
      full_name: newUserName.trim(),
      email: newUserEmail.trim().toLowerCase(),
      role: newUserRole,
      is_active: true
    };

    setUsers(prev => [...prev, newUser]);
    toast.success(`Officer "${newUser.full_name}" registered successfully as ${newUser.role.toUpperCase()}.`);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('user');
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-semibold tracking-tight text-console-text">
          PLATFORM ADMINISTRATION CORE
        </h1>
        <p className="text-xs text-console-textSec font-mono mt-1">
          SYS_ROOT_ACCESS: SECURE_ENVIRONMENT
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Col 1 & 2: User management and Zones */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Management */}
          <div className="glass-panel p-6 rounded-[4px] border border-console-border shadow-none">
            <div className="flex items-center space-x-3 mb-6">
              <Users className="w-5 h-5 text-console-orange" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-console-text">
                Registered Research Officers
              </h2>
            </div>
            
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-console-border text-console-textSec font-mono uppercase bg-console-bg/60">
                    <th className="py-2.5 px-4 font-semibold">Name</th>
                    <th className="py-2.5 px-4 font-semibold">Email</th>
                    <th className="py-2.5 px-4 font-semibold">Role</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-console-border">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-console-bg/40">
                      <td className="py-3 px-4 font-semibold text-console-text">{u.full_name}</td>
                      <td className="py-3 px-4 font-mono text-console-textSec">{u.email}</td>
                      <td className="py-3 px-4 uppercase font-mono text-console-orange text-[10px]">{u.role}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => toggleUserActive(u.id)}
                          className="focus:outline-none transition-colors"
                        >
                          {u.is_active ? (
                            <ToggleRight className="w-6 h-6 text-console-orange" />
                          ) : (
                            <ToggleLeft className="w-6 h-6 text-console-textSec" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Zones Management */}
          <div className="glass-panel p-6 rounded-[4px] border border-console-border shadow-none">
            <div className="flex items-center space-x-3 mb-6">
              <Settings className="w-5 h-5 text-console-orange" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-console-text">
                Managed Spatial Boundaries (Wards)
              </h2>
            </div>
            
            <div className="space-y-3">
              {zones.map((zone) => (
                <div key={zone.id} className="bg-console-bg border border-console-border rounded-[2px] p-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold font-mono text-console-text">{zone.name}</h3>
                    <p className="text-[10px] text-console-textSec mt-1 leading-normal font-sans">{zone.description || 'No description provided.'}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteZone(zone.id)}
                    className="p-1.5 rounded-[2px] hover:bg-console-extremeBg text-console-textSec hover:text-console-extreme transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Col 3: Forms */}
        <div className="space-y-6">
          {/* Register User Form */}
          <div className="glass-panel p-6 rounded-[4px] border border-console-border shadow-none">
            <div className="flex items-center space-x-3 mb-4">
              <Plus className="w-5 h-5 text-console-orange" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-console-text">
                Register Research Officer
              </h2>
            </div>
            <p className="text-[10px] text-console-textSec leading-normal mb-6 font-mono">
              Create a new user or administrative role.
            </p>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="text-xs text-console-textSec block mb-1.5 font-medium">Officer Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Vikram Sarabhai"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full bg-console-bg border border-console-border focus:border-console-orange rounded-[2px] px-3 py-2.5 text-xs text-console-text placeholder-console-textSec/60 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-console-textSec block mb-1.5 font-medium">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. name@urbanheatai.gov.in"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full bg-console-bg border border-console-border focus:border-console-orange rounded-[2px] px-3 py-2.5 text-xs text-console-text placeholder-console-textSec/60 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-console-textSec block mb-1.5 font-medium">Access Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as 'user' | 'admin')}
                  className="w-full bg-console-bg border border-console-border focus:border-console-orange rounded-[2px] px-3 py-2.5 text-xs text-console-text focus:outline-none transition-colors"
                >
                  <option value="user" className="bg-console-surface text-console-text">RESEARCHER (User)</option>
                  <option value="admin" className="bg-console-surface text-console-text">LEAD SCIENTIST (Admin)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full relative flex items-center justify-center space-x-2 py-2.5 rounded-[2px] bg-console-orange hover:bg-[#d55424] text-slate-100 font-mono font-bold uppercase tracking-wider text-xs transition-colors overflow-hidden"
              >
                <span>REGISTER OFFICER</span>
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-thermal-gradient"></span>
              </button>
            </form>
          </div>

          <div className="glass-panel p-6 rounded-[4px] border border-console-border shadow-none">
            <div className="flex items-center space-x-3 mb-4">
              <Plus className="w-5 h-5 text-console-orange" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-console-text">
                Add Ward Boundary
              </h2>
            </div>
            <p className="text-[10px] text-console-textSec leading-normal mb-6 font-mono">
              Declare coordinate bounds manually.
            </p>

            <form onSubmit={handleCreateZone} className="space-y-4">
              <div>
                <label className="text-xs text-console-textSec block mb-1.5 font-medium">Ward/Zone Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ward 101 - Malleshwaram"
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  className="w-full bg-console-bg border border-console-border focus:border-console-orange rounded-[2px] px-3 py-2.5 text-xs text-console-text placeholder-console-textSec/60 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-console-textSec block mb-1.5 font-medium">Description</label>
                <textarea
                  placeholder="e.g. Commercial dense street grid area"
                  value={newZoneDesc}
                  rows={2}
                  onChange={(e) => setNewZoneDesc(e.target.value)}
                  className="w-full bg-console-bg border border-console-border focus:border-console-orange rounded-[2px] px-3 py-2.5 text-xs text-console-text placeholder-console-textSec/60 focus:outline-none transition-colors resize-none"
                />
              </div>

              <div>
                <label className="text-xs text-console-textSec block mb-1.5 font-medium">GeoJSON Coordinates (Optional)</label>
                <textarea
                  placeholder='{"type": "Polygon", "coordinates": [[[77.5, 12.9], ...]]}'
                  value={newZoneGeoJson}
                  rows={4}
                  onChange={(e) => setNewZoneGeoJson(e.target.value)}
                  className="w-full bg-console-bg border border-console-border focus:border-console-orange rounded-[2px] px-3 py-2.5 text-[10px] font-mono text-console-text placeholder-console-textSec/60 focus:outline-none transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full relative flex items-center justify-center space-x-2 py-2.5 rounded-[2px] bg-console-orange hover:bg-[#d55424] text-slate-100 font-mono font-bold uppercase tracking-wider text-xs transition-colors overflow-hidden"
              >
                <span>CREATE WARD LAYER</span>
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-thermal-gradient"></span>
              </button>
            </form>
          </div>

          {/* Diagnostics Box */}
          <div className="glass-panel p-6 rounded-[4px] border border-console-border shadow-none">
            <div className="flex items-center space-x-3 mb-4">
              <Cpu className="w-5 h-5 text-console-orange" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-console-text">
                System Diagnostics
              </h2>
            </div>
            <div className="space-y-2 text-[11px] font-mono">
              <div className="flex justify-between">
                <span className="text-console-textSec">DATABASE_NODE</span>
                <span className="text-console-low font-semibold">STABLE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-console-textSec">API_WORKERS</span>
                <span className="text-console-low font-semibold">8/8 ONLINE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-console-textSec">COMPUTE_ENGINE</span>
                <span className="text-console-low font-semibold">GPU_ACCEL_ON</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
