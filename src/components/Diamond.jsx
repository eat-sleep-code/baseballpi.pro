import React from 'react';
import { X } from 'lucide-react';

const Diamond = ({ linescore, boxscore, onBaseClick, baseTooltip, onCloseTooltip }) => {
	const { offense } = linescore;
	const basesOccupied = {};
	if (offense?.first) basesOccupied['1B'] = { ...offense.first, details: { runner: offense.first } };
	if (offense?.second) basesOccupied['2B'] = { ...offense.second, details: { runner: offense.second } };
	if (offense?.third) basesOccupied['3B'] = { ...offense.third, details: { runner: offense.third } };

	const getPlayerData = (playerId) => {
		if (!boxscore || !playerId) return null;
		return boxscore.teams?.away?.players?.[`ID${playerId}`] || boxscore.teams?.home?.players?.[`ID${playerId}`];
	};

	const getPlayerStats = (playerId) => {
		const player = getPlayerData(playerId);
		return player?.seasonStats?.batting;
	};

	// Get the full player data with jersey number for the tooltip
	const tooltipPlayerData = baseTooltip?.runner ? getPlayerData(baseTooltip.runner.id) : null;
	const tooltipStats = tooltipPlayerData?.seasonStats?.batting;
	const tooltipRunner = tooltipPlayerData?.person ? {
		...tooltipPlayerData.person,
		primaryNumber: tooltipPlayerData.jerseyNumber
	} : baseTooltip?.runner;

	const baseDisplayName = baseTooltip?.base
		? { '1B': '1st', '2B': '2nd', '3B': '3rd' }[baseTooltip.base]
		: '';


	const renderBase = (baseName, position, displayName) => {
		const runner = basesOccupied[baseName]?.details?.runner;

		return (
			<div className="relative" style={{ position: 'absolute', ...position }}>
				<button
					onClick={() => onBaseClick(baseName, runner)}
					className={`rounded w-10 h-10 md:w-14 md:h-14 rotate-45 transition-all flex items-center justify-center ${runner
							? 'bg-yellow-400 border-2 border-yellow-500 shadow-lg shadow-yellow-500/50'
							: 'bg-white/20 border-2 border-white/40'
						}`}
				>
					<span className="-rotate-45 block text-xs md:text-sm font-bold" style={{ color: runner ? '#000' : '#fff' }}>
						{displayName}
					</span>
				</button>
			</div>
		);
	};

	return (
		<div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 md:p-8 border border-white/10 shadow-xl">
			<div className="relative w-full max-w-md mx-auto aspect-square">
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="relative w-4/5 h-4/5">
						<svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100"><path d="M 50 10 L 90 50 L 50 90 L 10 50 Z" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" /></svg>
						<div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2"><div className="w-8 h-8 md:w-10 md:h-10 bg-white/40 rounded-full border-2 border-white/60 flex items-center justify-center"><span className="text-xs font-bold text-white">H</span></div></div>
						{renderBase('1B', { right: '0', top: '50%', transform: 'translate(50%, -50%)' }, '1st')}
						{renderBase('2B', { top: '0', left: '50%', transform: 'translate(-50%, -50%)' }, '2nd')}
						{renderBase('3B', { left: '0', top: '50%', transform: 'translate(-50%, -50%)' }, '3rd')}
					</div>
				</div>
			</div>

			{baseTooltip?.runner && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onCloseTooltip}>
					<div className="bg-gray-900 rounded-2xl p-4 md:p-6 text-white shadow-2xl border border-white/20 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
						<div className="flex justify-between items-start mb-4">
							<h3 className="text-lg font-bold">Runner on {baseDisplayName}</h3>
							<button onClick={onCloseTooltip} className="p-1 hover:bg-white/10 rounded min-h-[32px] min-w-[32px] flex-shrink-0"><X size={20} /></button>
						</div>

						<div className="flex items-center gap-4 mb-4">
							<div className="w-20 h-20 rounded-full overflow-hidden bg-gray-800 flex-shrink-0 border-2 border-white/20">
								<img
									src={`https://img.mlbstatic.com/mlb-photos/image/upload/w_256,q_auto:best/v1/people/${tooltipRunner.id}/headshot/83/current`}
									alt={tooltipRunner.fullName}
									className="w-full h-full object-cover"
									onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23333" width="100" height="100"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%23fff" font-size="40">?</text></svg>'; }}
								/>
							</div>
							<div className="flex-1 min-w-0">
								<div className="font-bold text-xl truncate">{tooltipRunner.fullName}</div>
								<div className="text-gray-400">#{tooltipRunner.primaryNumber}</div>
							</div>
						</div>

						{tooltipStats && (
							<div className="grid grid-cols-3 gap-4 text-center bg-white/5 rounded-lg p-3">
								<div><div className="text-gray-400 text-xs uppercase">AVG</div><div className="font-bold">{tooltipStats.avg}</div></div>
								<div><div className="text-gray-400 text-xs uppercase">HR</div><div className="font-bold">{tooltipStats.homeRuns}</div></div>
								<div><div className="text-gray-400 text-xs uppercase">RBI</div><div className="font-bold">{tooltipStats.rbi}</div></div>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default Diamond;