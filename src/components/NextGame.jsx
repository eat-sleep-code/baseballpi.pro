import React from 'react';

const NextGame = ({ game }) => {
  const gameTime = new Date(game.gameDate);
  
  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4 flex-1 min-w-0">
           <div className="w-12 h-12 md:w-16 md:h-16 rounded-full backdrop-blur-md bg-gradient-to-br from-white/40 to-white/20 border border-white/30 shadow-lg flex items-center justify-center p-2.5 flex-shrink-0">
            <img src={`https://www.mlbstatic.com/team-logos/${game.teams.away.team.id}.svg`} alt={game.teams.away.team.name} className="w-full h-full object-contain"/>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-bold text-lg truncate">{game.teams.away.team.name}</div>
            <div className="text-gray-400 text-sm">{game.teams.away.leagueRecord?.wins || 0}-{game.teams.away.leagueRecord?.losses || 0}</div>
          </div>
        </div>
        <div className="text-gray-400 text-xl font-bold mx-4">@</div>
        <div className="flex items-center gap-4 flex-1 min-w-0 justify-end">
          <div className="flex-1 min-w-0 text-right">
            <div className="text-white font-bold text-lg truncate">{game.teams.home.team.name}</div>
            <div className="text-gray-400 text-sm">{game.teams.home.leagueRecord?.wins || 0}-{game.teams.home.leagueRecord?.losses || 0}</div>
          </div>
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full backdrop-blur-md bg-gradient-to-br from-white/40 to-white/20 border border-white/30 shadow-lg flex items-center justify-center p-2.5 flex-shrink-0">
            <img src={`https://www.mlbstatic.com/team-logos/${game.teams.home.team.id}.svg`} alt={game.teams.home.team.name} className="w-full h-full object-contain"/>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-white/10 text-center">
        <div className="text-gray-400 text-sm mb-1">Game Time</div>
        <div className="text-white text-xl font-bold">
          {gameTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
        </div>
        <div className="text-gray-400 text-sm">
          {gameTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>
    </div>
  );
};

export default NextGame;