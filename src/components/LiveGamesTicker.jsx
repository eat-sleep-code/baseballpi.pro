import React, { useState, useEffect } from 'react';

const LiveGamesTicker = ({ currentGamePk }) => {
	const [otherGames, setOtherGames] = useState([]);

	useEffect(() => {
		const fetchOtherGames = async () => {
			try {
				const now = new Date();
				const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

				const response = await fetch(`https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${today}&hydrate=linescore,team`);
				const data = await response.json();

				if (data.dates && data.dates.length > 0) {
					const live = data.dates[0].games.filter(g => g.status.abstractGameState === 'Live' && g.gamePk !== currentGamePk);
					setOtherGames(live);
				}
			} catch (error) {
				console.error('Error fetching other games:', error);
			}
		};

		fetchOtherGames();
		const interval = setInterval(fetchOtherGames, 30000);
		return () => clearInterval(interval);
	}, [currentGamePk]);

	if (otherGames.length === 0) return null;

	return (
		<div className="backdrop-blur-xl bg-white/5 rounded-2xl p-4 border border-white/10 shadow-xl">
			<h3 className="text-white font-bold mb-4 flex items-center gap-2">
				<span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
				Other Live Games
			</h3>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
				{otherGames.map((game) => (
					<div key={game.gamePk} className="bg-white/5 rounded-xl p-3 border border-white/10">
						<div className="flex justify-between items-center mb-2">
							<div className="flex items-center gap-2 flex-1 min-w-0"><img src={`https://www.mlbstatic.com/team-logos/${game.teams.away.team.id}.svg`} alt="" className="w-6 h-6" /> <span className="text-white text-sm truncate">{game.teams.away.team.abbreviation}</span></div>
							<span className="text-white font-bold ml-2">{game.teams.away.score}</span>
						</div>
						<div className="flex justify-between items-center mb-2">
							<div className="flex items-center gap-2 flex-1 min-w-0"><img src={`https://www.mlbstatic.com/team-logos/${game.teams.home.team.id}.svg`} alt="" className="w-6 h-6" /> <span className="text-white text-sm truncate">{game.teams.home.team.abbreviation}</span></div>
							<span className="text-white font-bold ml-2">{game.teams.home.score}</span>
						</div>
						<div className="text-center text-gray-400 text-xs pt-2 border-t border-white/10">{game.linescore?.isTopInning ? '▲' : '▼'} {game.linescore?.currentInningOrdinal || 'Live'}</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default LiveGamesTicker;