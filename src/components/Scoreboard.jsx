import React from 'react';

const Scoreboard = ({ game, liveData, gameInfo, onTeamClick }) => {
	const away = game.teams.away;
	const home = game.teams.home;
	const linescore = liveData.linescore;

	const seriesDescription = gameInfo?.game?.seriesDescription || '';
	const seriesGameNumber = gameInfo?.game?.seriesGameNumber || '';

	const awaySeriesWins = away.seriesNumber || 0;
	const homeSeriesWins = home.seriesNumber || 0;

	let seriesStatus = '';
	if (seriesGameNumber) {
		if (awaySeriesWins > 0 || homeSeriesWins > 0) {
			if (awaySeriesWins > homeSeriesWins) {
				seriesStatus = `Game ${seriesGameNumber} (${away.team.abbreviation} leads ${awaySeriesWins}-${homeSeriesWins})`;
			} else if (homeSeriesWins > awaySeriesWins) {
				seriesStatus = `Game ${seriesGameNumber} (${home.team.abbreviation} leads ${homeSeriesWins}-${awaySeriesWins})`;
			} else {
				seriesStatus = `Game ${seriesGameNumber} (Series tied ${awaySeriesWins}-${homeSeriesWins})`;
			}
		} else {
			seriesStatus = `Game ${seriesGameNumber}`;
		}
	}

	return (
		<div className="backdrop-blur-xl bg-white/5 rounded-2xl p-4 md:p-6 border border-white/10 shadow-xl">
			{(seriesDescription || seriesStatus) && (
				<div className="text-center text-gray-300 text-sm mb-3 pb-3 border-b border-white/10">
					{seriesDescription && <div className="font-semibold">{seriesDescription}</div>}
					{seriesStatus && <div>{seriesStatus}</div>}
				</div>
			)}

			<button onClick={() => onTeamClick(away.team.id, away.team.name)} className="w-full flex justify-between items-center mb-4 hover:bg-white/5 rounded-lg p-2 -m-2 transition-all">
				<div className="flex items-center gap-3 flex-1 min-w-0">
					<div className="w-12 h-12 md:w-14 md:h-14 rounded-full backdrop-blur-md bg-gradient-to-br from-white/40 to-white/20 border border-white/30 shadow-lg flex items-center justify-center p-2.5 flex-shrink-0">
						<img src={`https://www.mlbstatic.com/team-logos/${away.team.id}.svg`} alt={away.team.name} className="w-full h-full object-contain" />
					</div>
					<div className="flex-1 min-w-0 text-left"><div className="text-white font-bold text-base md:text-lg truncate">{away.team.name}</div><div className="text-gray-400 text-sm">{away.leagueRecord.wins}-{away.leagueRecord.losses}</div></div>
				</div>
				<div className="text-3xl md:text-4xl font-bold text-white ml-2">{away.score}</div>
			</button>

			<button onClick={() => onTeamClick(home.team.id, home.team.name)} className="w-full flex justify-between items-center hover:bg-white/5 rounded-lg p-2 -m-2 transition-all">
				<div className="flex items-center gap-3 flex-1 min-w-0">
					<div className="w-12 h-12 md:w-14 md:h-14 rounded-full backdrop-blur-md bg-gradient-to-br from-white/40 to-white/20 border border-white/30 shadow-lg flex items-center justify-center p-2.5 flex-shrink-0">
						<img src={`https://www.mlbstatic.com/team-logos/${home.team.id}.svg`} alt={home.team.name} className="w-full h-full object-contain" />
					</div>
					<div className="flex-1 min-w-0 text-left"><div className="text-white font-bold text-base md:text-lg truncate">{home.team.name}</div><div className="text-gray-400 text-sm">{home.leagueRecord.wins}-{home.leagueRecord.losses}</div></div>
				</div>
				<div className="text-3xl md:text-4xl font-bold text-white ml-2">{home.score}</div>
			</button>

			<div className="mt-4 pt-4 border-t border-white/10 flex justify-around text-center">
				<div><div className="text-gray-400 text-xs uppercase">Inning</div><div className="text-white font-bold">{linescore.isTopInning ? '▲' : '▼'} {linescore.currentInningOrdinal}</div></div>
				<div><div className="text-gray-400 text-xs uppercase">Outs</div><div className="text-white font-bold">{linescore.outs}</div></div>
				<div><div className="text-gray-400 text-xs uppercase">Count</div><div className="text-white font-bold">{linescore.balls}-{linescore.strikes}</div></div>
			</div>
		</div>
	);
};

export default Scoreboard;