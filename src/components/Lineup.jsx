import React from 'react';

const Lineup = ({ boxscore, liveData }) => {
	const battingTeam = liveData.linescore.isTopInning ? 'away' : 'home';
	const teamData = boxscore?.teams?.[battingTeam];
	const battingOrder = teamData?.battingOrder || [];
	const players = teamData?.players || {};

	const currentBatterId = liveData.plays.currentPlay?.matchup?.batter?.id;

	let currentBatterPosition = -1;
	if (currentBatterId && battingOrder.length > 0) {
		for (let i = 0; i < battingOrder.length; i++) {
			const playerId = battingOrder[i];
			const player = players[`ID${playerId}`]?.person;
			if (player && player.id === currentBatterId) {
				currentBatterPosition = i;
				break;
			}
		}
	}

	const getNextBatters = () => {
		if (battingOrder.length === 0 || currentBatterPosition === -1) {
			return [];
		}

		const next = [];
		for (let i = 1; i <= 3; i++) {
			const index = (currentBatterPosition + i) % battingOrder.length;
			if (battingOrder[index]) {
				next.push(battingOrder[index]);
			}
		}
		return next;
	};

	const nextBatters = getNextBatters();

	if (nextBatters.length === 0) {
		return (
			<div className="backdrop-blur-xl bg-white/5 rounded-2xl p-4 border border-white/10 shadow-xl">
				<h3 className="text-white font-bold mb-4">On Deck</h3>
				<div className="text-gray-400 text-center py-4">Lineup data not available</div>
			</div>
		);
	}

	return (
		<div className="backdrop-blur-xl bg-white/5 rounded-2xl p-4 border border-white/10 shadow-xl">
			<h3 className="text-white font-bold mb-4">On Deck</h3>
			<div className="space-y-3">
				{nextBatters.map((playerId, index) => {
					const player = players[`ID${playerId}`]?.person;
					const stats = players[`ID${playerId}`]?.seasonStats?.batting;

					if (!player) return null;

					return (
						<div key={playerId} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
							<div className="w-10 h-10 rounded-full overflow-hidden bg-gray-800 flex-shrink-0 border border-white/20">
								<img src={`https://img.mlbstatic.com/mlb-photos/image/upload/w_256,q_auto:best/v1/people/${player.id}/headshot/83/current`} alt={player.fullName} className="w-full h-full object-cover" onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23333" width="100" height="100"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%23fff" font-size="30">?</text></svg>'; }} />
							</div>
							<div className="flex-1 min-w-0">
								<div className="text-white font-semibold text-sm truncate">{player.fullName}</div>
								<div className="text-gray-400 text-xs">{stats ? `AVG: ${stats.avg} | HR: ${stats.homeRuns} | RBI: ${stats.rbi}` : 'No stats'}</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default Lineup;