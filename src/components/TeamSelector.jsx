import React from 'react';

const TeamSelector = ({ teams, selected, onToggle, onSave }) => {
  const MAX_TEAMS = 3;
  
  return (
    <div className="min-h-screen max-h-screen overflow-auto bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-4 flex items-center justify-center">
      <div className="max-w-4xl w-full">
        <div className="backdrop-blur-xl bg-white/5 rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Select Your Favorite Teams</h2>
          <p className="text-gray-300 mb-6">Choose up to {MAX_TEAMS} teams to follow.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6 max-h-[60vh] overflow-y-auto p-1">
            {teams.map(team => {
              const isSelected = selected.includes(team.id);
              const isDisabled = !isSelected && selected.length >= MAX_TEAMS;
              
              return (
                <button
                  key={team.id}
                  onClick={() => onToggle(team.id)}
                  disabled={isDisabled}
                  className={`p-4 rounded-xl border transition-all text-left flex items-center gap-3 ${
                    isSelected
                      ? 'bg-blue-500/20 border-blue-400/50'
                      : isDisabled
                      ? 'bg-white/5 border-white/10 opacity-50 cursor-not-allowed'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <img 
                    src={`https://www.mlbstatic.com/team-logos/${team.id}.svg`}
                    alt={team.name}
                    className="w-10 h-10 object-contain flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold">{team.name}</div>
                  </div>
                </button>
              );
            })}
          </div>
          
          <button
            onClick={onSave}
            disabled={selected.length === 0}
            className="w-full py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl text-white font-semibold transition-all"
          >
            Save Favorites ({selected.length}/{MAX_TEAMS})
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamSelector;