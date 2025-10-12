import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Settings, X } from 'lucide-react';
import Scoreboard from './Scoreboard';
import Diamond from './Diamond';
import Players from './Players';
import Lineup from './Lineup';
import CurrentPlay from './CurrentPlay';
import LiveGamesTicker from './LiveGamesTicker';

const LiveGameDisplay = ({ games, currentGameIndex, setCurrentGameIndex, onShowTeamSelector }) => {
	const [gameData, setGameData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState('game');
	const [baseTooltip, setBaseTooltip] = useState(null);
	const [teamStatsDialog, setTeamStatsDialog] = useState(null);
	const tooltipTimeoutRef = useRef(null);

	const currentGame = games[currentGameIndex];

	useEffect(() => {
		if (!currentGame?.gamePk) {
			setGameData(null);
			setLoading(false);
			return;
		}

		setLoading(true);
		setGameData(null);
		setBaseTooltip(null);

		let isComponentMounted = true;

		const fetchGameData = async () => {
			try {
				const response = await fetch(`https://statsapi.mlb.com/api/v1.1/game/${currentGame.gamePk}/feed/live`);
				const data = await response.json();
				if (isComponentMounted) {
					setGameData(data);
				}
			} catch (error) {
				console.error(`Error fetching game data for gamePk ${currentGame.gamePk}:`, error);
			} finally {
				if (isComponentMounted) {
					setLoading(false);
				}
			}
		};

		fetchGameData();
		const interval = setInterval(fetchGameData, 10000);

		return () => {
			isComponentMounted = false;
			clearInterval(interval);
		};
	}, [currentGame?.gamePk]);


	const handleBaseClick = (base, runner) => {
		if (runner) {
			if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
			setBaseTooltip({ base, runner });
			tooltipTimeoutRef.current = setTimeout(() => setBaseTooltip(null), 5000);
		}
	};

	const closeTooltip = () => {
		if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
		setBaseTooltip(null);
	};

	const showTeamStats = async (teamId, teamName) => {
		try {
			const response = await fetch(`https://statsapi.mlb.com/api/v1/standings?leagueId=103,104&season=2025&standingsTypes=regularSeason`);
			const data = await response.json();
			
			// Find the team in the standings
			let teamRecord = null;
			for (const recordList of data.records || []) {
				const team = recordList.teamRecords?.find(t => t.team.id === teamId);
				if (team) {
					teamRecord = team;
					break;
				}
			}

			if (!teamRecord) {
				console.error('Team not found in standings');
				setTeamStatsDialog({
					name: teamName,
					stats: {
						wins: '-',
						losses: '-',
						pct: '-',
						home: '-',
						away: '-',
						gb: '-',
						l10: '-',
					}
				});
				return;
			}

			const winPct = teamRecord.leagueRecord?.pct 
				? teamRecord.leagueRecord.pct 
				: '.000';

			setTeamStatsDialog({
				name: teamName,
				stats: {
					wins: teamRecord.leagueRecord?.wins ?? '-',
					losses: teamRecord.leagueRecord?.losses ?? '-',
					pct: winPct,
					home: teamRecord.records?.splitRecords?.find(r => r.type === 'home') 
						? `${teamRecord.records.splitRecords.find(r => r.type === 'home').wins}-${teamRecord.records.splitRecords.find(r => r.type === 'home').losses}` 
						: '-',
					away: teamRecord.records?.splitRecords?.find(r => r.type === 'away') 
						? `${teamRecord.records.splitRecords.find(r => r.type === 'away').wins}-${teamRecord.records.splitRecords.find(r => r.type === 'away').losses}` 
						: '-',
					gb: teamRecord.gamesBack ?? '-',
					l10: teamRecord.records?.splitRecords?.find(r => r.type === 'lastTen') 
						? `${teamRecord.records.splitRecords.find(r => r.type === 'lastTen').wins}-${teamRecord.records.splitRecords.find(r => r.type === 'lastTen').losses}` 
						: '-',
				}
			});
		} catch (error) {
			console.error('Error fetching team stats:', error);
		}
	};

	const liveData = gameData?.liveData;
	const plays = liveData?.plays;
	const currentPlay = plays?.currentPlay;
	const boxscore = liveData?.boxscore;
	const gameInfo = gameData?.gameData;

	const renderContent = () => {
		if (loading) {
			return <div className="text-white text-center p-8">Loading game data...</div>;
		}

		if (!gameData || !liveData) {
			return <div className="text-white text-center p-8">Could not load details for this game.</div>;
		}

		return (
			<div className="max-w-7xl mx-auto">
				<div className="hidden md:grid md:grid-cols-3 md:gap-4 mb-4">
					<div className="space-y-4"><Scoreboard game={currentGame} liveData={liveData} gameInfo={gameInfo} onTeamClick={showTeamStats} /><Diamond linescore={liveData.linescore} boxscore={boxscore} onBaseClick={handleBaseClick} baseTooltip={baseTooltip} onCloseTooltip={closeTooltip} /></div>
					<div className="space-y-4"><Players boxscore={boxscore} currentPlay={currentPlay} /><Lineup boxscore={boxscore} liveData={liveData} /></div>
					<div><CurrentPlay currentPlay={currentPlay} plays={plays} /></div>
				</div>

				<div className="md:hidden space-y-4">
					{activeTab === 'game' && <><Scoreboard game={currentGame} liveData={liveData} gameInfo={gameInfo} onTeamClick={showTeamStats} /><Diamond linescore={liveData.linescore} boxscore={boxscore} onBaseClick={handleBaseClick} baseTooltip={baseTooltip} onCloseTooltip={closeTooltip} /></>}
					{activeTab === 'players' && <><Players boxscore={boxscore} currentPlay={currentPlay} /><Lineup boxscore={boxscore} liveData={liveData} /></>}
					{activeTab === 'play' && <CurrentPlay currentPlay={currentPlay} plays={plays} />}
				</div>

				<div className="mt-4">
					<LiveGamesTicker currentGamePk={currentGame.gamePk} />
				</div>
			</div>
		);
	};

	return (
		<div className="min-h-screen max-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex flex-col">
			{teamStatsDialog && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setTeamStatsDialog(null)}>
					<div className="bg-gray-900 rounded-2xl p-6 text-white shadow-2xl border border-white/20 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
						<div className="flex justify-between items-start mb-6"><h3 className="text-xl font-bold">{teamStatsDialog.name}</h3><button onClick={() => setTeamStatsDialog(null)} className="p-1 hover:bg-white/10 rounded"><X size={20} /></button></div>
						<div className="grid grid-cols-2 gap-4">
							<div className="bg-white/5 rounded-lg p-3"><div className="text-gray-400 text-xs uppercase mb-1">Record</div><div className="text-white font-bold text-lg">{teamStatsDialog.stats.wins}-{teamStatsDialog.stats.losses}</div></div>
							<div className="bg-white/5 rounded-lg p-3"><div className="text-gray-400 text-xs uppercase mb-1">Win %</div><div className="text-white font-bold text-lg">{teamStatsDialog.stats.pct}</div></div>
							<div className="bg-white/5 rounded-lg p-3"><div className="text-gray-400 text-xs uppercase mb-1">Home</div><div className="text-white font-bold">{teamStatsDialog.stats.home}</div></div>
							<div className="bg-white/5 rounded-lg p-3"><div className="text-gray-400 text-xs uppercase mb-1">Away</div><div className="text-white font-bold">{teamStatsDialog.stats.away}</div></div>
							<div className="bg-white/5 rounded-lg p-3"><div className="text-gray-400 text-xs uppercase mb-1">Games Back</div><div className="text-white font-bold">{teamStatsDialog.stats.gb}</div></div>
							<div className="bg-white/5 rounded-lg p-3"><div className="text-gray-400 text-xs uppercase mb-1">Last 10</div><div className="text-white font-bold">{teamStatsDialog.stats.l10}</div></div>
						</div>
					</div>
				</div>
			)}

			<header className="flex items-center justify-between p-4 backdrop-blur-xl bg-white/5 border-b border-white/10">
				<div className="flex items-center gap-2 md:gap-4">
					{games.length > 1 && (
						<>
							<button onClick={() => setCurrentGameIndex((p) => (p - 1 + games.length) % games.length)} className="p-2 hover:bg-white/10 rounded-lg"><ChevronLeft className="text-white" size={24} /></button>
							<span className="text-white text-sm">{currentGameIndex + 1} / {games.length}</span>
							<button onClick={() => setCurrentGameIndex((p) => (p + 1) % games.length)} className="p-2 hover:bg-white/10 rounded-lg"><ChevronRight className="text-white" size={24} /></button>
						</>
					)}
				</div>
				<h1 className="text-white text-lg md:text-2xl font-bold flex-1 text-center">MLB Live Tracker</h1>
				<button onClick={onShowTeamSelector} className="p-2 hover:bg-white/10 rounded-lg"><Settings className="text-white" size={24} /></button>
			</header>

			<nav className="md:hidden flex backdrop-blur-xl bg-white/5 border-b border-white/10">
				<button onClick={() => setActiveTab('game')} className={`flex-1 py-3 text-center transition-all ${activeTab === 'game' ? 'text-white border-b-2 border-blue-400' : 'text-gray-400'}`}>Game</button>
				<button onClick={() => setActiveTab('players')} className={`flex-1 py-3 text-center transition-all ${activeTab === 'players' ? 'text-white border-b-2 border-blue-400' : 'text-gray-400'}`}>Players</button>
				<button onClick={() => setActiveTab('play')} className={`flex-1 py-3 text-center transition-all ${activeTab === 'play' ? 'text-white border-b-2 border-blue-400' : 'text-gray-400'}`}>Play</button>
			</nav>

			<main className="flex-1 overflow-auto p-4">
				{renderContent()}
			</main>
		</div>
	);
};

export default LiveGameDisplay;