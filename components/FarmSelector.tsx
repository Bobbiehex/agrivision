
import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import { Farm } from '../types';
import { MapPin, ChevronDown, Globe } from 'lucide-react';

interface FarmSelectorProps {
  selectedFarmId: string | null;
  onSelectFarm: (id: string) => void;
}

export const FarmSelector: React.FC<FarmSelectorProps> = ({ selectedFarmId, onSelectFarm }) => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const loadFarms = async () => {
      const allFarms = await dbService.getAllFarms();
      setFarms(allFarms);
      if (!selectedFarmId && allFarms.length > 0) {
        onSelectFarm(allFarms[0].id);
      }
    };
    loadFarms();
  }, [selectedFarmId, onSelectFarm]);

  const selectedFarm = farms.find(f => f.id === selectedFarmId);

  const handleAddFarm = async () => {
    const name = prompt("Enter Farm Name:");
    if (!name) return;
    const location = prompt("Enter Farm Location (e.g. California, USA):");
    if (!location) return;

    const newFarm: Farm = {
      id: `f-${Date.now()}`,
      name,
      location,
      totalArea: 0,
      image: `https://picsum.photos/seed/${name}/800/600`
    };

    await dbService.updateFarm(newFarm);
    const allFarms = await dbService.getAllFarms();
    setFarms(allFarms);
    onSelectFarm(newFarm.id);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
      >
        <Globe size={18} className="text-emerald-500" />
        <div className="text-left">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Current Farm</p>
          <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[150px]">
            {selectedFarm ? selectedFarm.name : 'Select Farm'}
          </p>
        </div>
        <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="p-2 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 px-2 py-1">YOUR FARMS</p>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {farms.map(farm => (
              <button
                key={farm.id}
                onClick={() => {
                  onSelectFarm(farm.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left ${selectedFarmId === farm.id ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}`}
              >
                <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 overflow-hidden mr-3 flex-shrink-0">
                  {farm.image ? (
                    <img src={farm.image} alt={farm.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <MapPin size={20} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{farm.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{farm.location}</p>
                </div>
                {selectedFarmId === farm.id && (
                  <div className="w-2 h-2 rounded-full bg-emerald-500 ml-2 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                )}
              </button>
            ))}
          </div>
          <button 
            onClick={handleAddFarm}
            className="w-full p-3 text-sm font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 border-t border-slate-100 dark:border-slate-700 transition-colors"
          >
            + Add New Farm
          </button>
        </div>
      )}
    </div>
  );
};
