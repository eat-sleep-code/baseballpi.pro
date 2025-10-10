import React from 'react';

const RecentScoresTicker = ({ scores }) => {
  return (
    <div className="space-y-3">
      {scores.map((game, index) => (
        <div key={index} className="backdrop-blur-xl bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <img src={`https://www.mlbstatic.com/team-logos/${game.teams.away.team.id}.svg`} alt={game.teams.away.team.name} className="w-8 h-8 object-contain"/>
              <span className="text-white text-sm truncate">{game.teams.away.team.name}</span>
            </div>
            <span className={`font-bold text-lg ml-2 ${game.teams.away.isWinner ? 'text-white' : 'text-gray-400'}`}>{game.teams.away.score}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <img src={`https://www.mlbstatic.com/team-logos/${game.teams.home.team.id}.svg`} alt={game.teams.home.team.name} className="w-8 h-8 object-contain"/>
              <span className="text-white text-sm truncate">{game.teams.home.team.name}</span>
            </div>
            <span className={`font-bold text-lg ml-2 ${game.teams.home.isWinner ? 'text-white' : 'text-gray-400'}`}>{game.teams.home.score}</span>
          </div>
          
          <div className="mt-2 pt-2 border-t border-white/10 text-center text-gray-400 text-xs">
            Final
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentScoresTicker;