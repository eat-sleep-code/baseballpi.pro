import React from 'react';

const PlayerCard = ({ title, player, stats, hand }) => {
	if (!player || !stats) return null;

	return (
		<div className="backdrop-blur-xl bg-white/5 rounded-2xl p-4 border border-white/10 shadow-xl">
			<h3 className="text-white font-bold mb-3 flex items-center gap-2">
				<span>{title}</span>
				{hand && <span className="text-xs bg-blue-500/20 px-2 py-1 rounded">{hand}</span>}
			</h3>
			<div className="flex items-center gap-4 mb-4">
				<div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-gray-800 flex-shrink-0 border-2 border-white/20">
					<img
						src={`https://img.mlbstatic.com/mlb-photos/image/upload/w_256,q_auto:best/v1/people/${player.id}/headshot/83/current`}
						alt={player.fullName}
						className="w-full h-full object-cover"
						onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23333" width="100" height="100"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%23fff" font-size="40">?</text></svg>'; }}
					/>
				</div>
				<div className="flex-1 min-w-0">
					<div className="text-white font-bold text-base md:text-lg truncate">{player.fullName}</div>
					<div className="text-gray-400">#{player.primaryNumber}</div>
				</div>
			</div>
			<div className="grid grid-cols-3 gap-3 text-center">
				{stats.map(stat => (
					<div key={stat.label}>
						<div className="text-gray-400 text-xs uppercase">{stat.label}</div>
						<div className="text-white font-bold">{stat.value}</div>
					</div>
				))}
			</div>
		</div>
	);
};

const Players = ({ boxscore, currentPlay }) => {
	const batter = currentPlay?.matchup?.batter;
	const pitcher = currentPlay?.matchup?.pitcher;

	const bStats = boxscore?.teams?.away?.players?.[`ID${batter?.id}`]?.seasonStats?.batting || boxscore?.teams?.home?.players?.[`ID${batter?.id}`]?.seasonStats?.batting;
	const pStats = boxscore?.teams?.away?.players?.[`ID${pitcher?.id}`]?.seasonStats?.pitching || boxscore?.teams?.home?.players?.[`ID${pitcher?.id}`]?.seasonStats?.pitching;

	const getBatHand = () => {
		const code = currentPlay?.matchup?.batSide?.code;
		if (code === 'L') return 'Left';
		if (code === 'R') return 'Right';
		if (code === 'S') return 'Switch';
		return null;
	};

	const getPitchHand = () => {
		const code = currentPlay?.matchup?.pitchHand?.code;
		if (code === 'L') return 'Left';
		if (code === 'R') return 'Right';
		return null;
	}

	return (
		<div className="space-y-4">
			<PlayerCard
				title="At Bat"
				player={batter}
				hand={getBatHand()}
				stats={bStats ? [
					{ label: 'AVG', value: bStats.avg },
					{ label: 'HR', value: bStats.homeRuns },
					{ label: 'RBI', value: bStats.rbi },
				] : null}
			/>
			<PlayerCard
				title="Pitching"
				player={pitcher}
				hand={getPitchHand()}
				stats={pStats ? [
					{ label: 'ERA', value: pStats.era },
					{ label: 'W-L', value: `${pStats.wins}-${pStats.losses}` },
					{ label: 'SO', value: pStats.strikeOuts },
				] : null}
			/>
		</div>
	);
};

export default Players;