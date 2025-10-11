import React, { useState, useEffect, useRef } from 'react'; // Import useRef
import { Settings } from 'lucide-react';
import TeamSelector from './components/TeamSelector';
import LiveGame from './components/LiveGame';
import NextGame from './components/NextGame';
import RecentScoresTicker from './components/RecentScoresTicker';

const App = () => {
	//const [favoriteTeams, setFavoriteTeams] = useState([]);
	const [favoriteTeams, setFavoriteTeams] = useState(() => {
		const saved = localStorage.getItem('mlb-favorite-teams');
		return saved ? JSON.parse(saved) : [];
	});
	const [showTeamSelector, setShowTeamSelector] = useState(false);
	const [liveGames, setLiveGames] = useState([]);
	const [allLiveGames, setAllLiveGames] = useState([]);
	const [currentGameIndex, setCurrentGameIndex] = useState(0);
	const [loading, setLoading] = useState(true);
	const [isOffSeason, setIsOffSeason] = useState(false);
	const [nextGame, setNextGame] = useState(null);
	const [recentScores, setRecentScores] = useState([]);
	const [allTeams, setAllTeams] = useState([]);


	const liveGamesRef = useRef(liveGames);
	useEffect(() => {
		liveGamesRef.current = liveGames;
	}, [liveGames]);


	useEffect(() => {
		localStorage.setItem('mlb-favorite-teams', JSON.stringify(favoriteTeams));
	}, [favoriteTeams]);

	useEffect(() => {
		const fetchTeams = async () => {
			try {
				const response = await fetch('https://statsapi.mlb.com/api/v1/teams?sportId=1');
				const data = await response.json();
				if (data.teams) {
					const teams = data.teams
						.filter(t => t.sport.id === 1)
						.map(t => ({ id: t.id, name: t.name, abbrev: t.abbreviation || t.teamCode }))
						.sort((a, b) => a.name.localeCompare(b.name));
					setAllTeams(teams);
				}
			} catch (error) {
				console.error('Error fetching teams:', error);
			}
		};
		fetchTeams();
	}, []);

	useEffect(() => {
		if (favoriteTeams.length === 0 && allTeams.length > 0) {
			setShowTeamSelector(true);
		}
	}, [allTeams, favoriteTeams.length]);

	useEffect(() => {
		const fetchGames = async () => {
			try {
				const now = new Date();
				const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

				const response = await fetch(
					`https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${today}&hydrate=game(content(summary)),linescore,team,seriesStatus`
				);
				const data = await response.json();

				if (!data.dates || data.dates.length === 0) {
					setIsOffSeason(true);
					setLoading(false);
					return;
				}

				const games = data.dates[0].games;
				const allLive = games.filter(g => g.status.abstractGameState === 'Live');
				setAllLiveGames(allLive);

				const favoriteLive = games.filter(g =>
					g.status.abstractGameState === 'Live' &&
					favoriteTeams.length > 0 &&
					(favoriteTeams.includes(g.teams.away.team.id) || favoriteTeams.includes(g.teams.home.team.id))
				);

				// Priority 1: A favorite team is playing. Show their game(s) and stop.
				if (favoriteLive.length > 0) {
					setLiveGames(favoriteLive);
					setLoading(false);
					return;
				}

				// Priority 2: No favorites playing, but we may be watching a non-favorite.
				if (liveGamesRef.current.length > 0) {
					const watchingGame = liveGamesRef.current[0];
					const isWatchingFavorite = favoriteTeams.includes(watchingGame.teams.away.team.id) || favoriteTeams.includes(watchingGame.teams.home.team.id);

					if (!isWatchingFavorite) {
						const watchedGameStillLive = allLive.find(g => g.gamePk === watchingGame.gamePk);
						if (watchedGameStillLive) {
							setLiveGames([watchedGameStillLive]);
							setLoading(false);
							return;
						}
					}
				}

				// Priority 3: No live games to show. Reset to the "no games" screen.
				setLiveGames([]);
				const relevantGames = games.filter(g =>
					favoriteTeams.length === 0 ||
					favoriteTeams.includes(g.teams.away.team.id) ||
					favoriteTeams.includes(g.teams.home.team.id)
				);
				const upcoming = relevantGames
					.filter(g => g.status.abstractGameState === 'Preview')
					.sort((a, b) => new Date(a.gameDate) - new Date(b.gameDate));

				setNextGame(upcoming.length > 0 ? upcoming[0] : null);

				const final = games
					.filter(g => g.status.abstractGameState === 'Final')
					.sort((a, b) => new Date(b.gameDate) - new Date(a.gameDate));
				setRecentScores(final.slice(0, 5));
				setIsOffSeason(false);

			} catch (error) {
				console.error('Error fetching games:', error);
			} finally {
				setLoading(false);
			}
		};

		if (!showTeamSelector && allTeams.length > 0) {
			fetchGames();
			const interval = setInterval(fetchGames, 15000);
			return () => clearInterval(interval);
		}
	}, [favoriteTeams, showTeamSelector, allTeams]);

	const saveFavoriteTeams = (teams) => {
		setFavoriteTeams(teams);
		setShowTeamSelector(false);
		setCurrentGameIndex(0);
		setLiveGames([]);
	};

	const toggleFavoriteTeam = (teamId) => {
		const MAX_FAVORITE_TEAMS = 3;
		setFavoriteTeams(prev => {
			if (prev.includes(teamId)) {
				return prev.filter(id => id !== teamId);
			}
			return prev.length < MAX_FAVORITE_TEAMS ? [...prev, teamId] : prev;
		});
	};

	// The rest of the component's return logic is unchanged
	if (showTeamSelector) {
		return <TeamSelector
			teams={allTeams}
			selected={favoriteTeams}
			onToggle={toggleFavoriteTeam}
			onSave={() => saveFavoriteTeams(favoriteTeams)}
		/>;
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center">
				<div className="text-white text-xl">Loading...</div>
			</div>
		);
	}

	if (isOffSeason) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex flex-col items-center justify-center p-4">
				<div className="text-white text-center max-w-2xl backdrop-blur-xl bg-white/5 rounded-3xl p-8 border border-white/10 shadow-2xl">
					<h1 className="text-3xl md:text-4xl font-bold mb-4">Off Season</h1>
					<p className="text-lg md:text-xl text-gray-300">
						Baseball is currently out of season. Check back during Spring Training!
					</p>
					<button
						onClick={() => setShowTeamSelector(true)}
						className="mt-8 px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 rounded-xl border border-blue-400/30 transition-all"
					>
						<Settings className="inline mr-2" size={20} />
						Manage Favorite Teams
					</button>
				</div>
			</div>
		);
	}

	if (liveGames.length === 0) {
		return (
			<div className="min-h-screen max-h-screen overflow-y-auto bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex flex-col p-4">
				<div className="flex justify-end mb-4">
					<button
						onClick={() => setShowTeamSelector(true)}
						className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-white transition-all min-h-[44px]"
					>
						<Settings className="inline mr-2" size={20} />
						<span className="hidden sm:inline">Settings</span>
					</button>
				</div>

				<div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full space-y-8">
					{nextGame && (
						<div className="w-full backdrop-blur-xl bg-white/5 rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl">
							<h2 className="text-2xl font-bold text-white mb-6 text-center">Next Game For Your Teams</h2>
							<NextGame game={nextGame} />
						</div>
					)}

					{allLiveGames.length > 0 && favoriteTeams.length > 0 && (
						<div className="w-full backdrop-blur-xl bg-white/5 rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl">
							<h2 className="text-2xl font-bold text-white mb-4 text-center">Your favorites aren't playing</h2>
							<p className="text-gray-300 text-center mb-6">Would you like to watch another game?</p>
							<div className="grid grid-cols-1 gap-3">
								{allLiveGames.map((game) => (
									<button
										key={game.gamePk}
										onClick={() => { setLiveGames([game]); setCurrentGameIndex(0); }}
										className="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-left"
									>
										<div className="flex justify-between items-center">
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 rounded-full backdrop-blur-md bg-gradient-to-br from-white/40 to-white/20 border border-white/30 shadow-lg flex items-center justify-center p-2">
													<img src={`https://www.mlbstatic.com/team-logos/${game.teams.away.team.id}.svg`} alt={game.teams.away.team.name} className="w-full h-full object-contain" />
												</div>
												<span className="text-white font-semibold">{game.teams.away.team.name}</span>
											</div>
											<span className="text-white text-xl font-bold">{game.teams.away.score}</span>
										</div>
										<div className="flex justify-between items-center mt-2">
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 rounded-full backdrop-blur-md bg-gradient-to-br from-white/40 to-white/20 border border-white/30 shadow-lg flex items-center justify-center p-2">
													<img src={`https://www.mlbstatic.com/team-logos/${game.teams.home.team.id}.svg`} alt={game.teams.home.team.name} className="w-full h-full object-contain" />
												</div>
												<span className="text-white font-semibold">{game.teams.home.team.name}</span>
											</div>
											<span className="text-white text-xl font-bold">{game.teams.home.score}</span>
										</div>
										<div className="text-center text-gray-400 text-sm mt-2">{game.linescore?.isTopInning ? '▲' : '▼'} {game.linescore?.currentInningOrdinal || 'Live'}</div>

									</button>
								))}
							</div>
						</div>
					)}

					{recentScores.length > 0 && !nextGame && (
						<div className="w-full backdrop-blur-xl bg-white/5 rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl">
							<h2 className="text-2xl font-bold text-white mb-6 text-center">Recent Scores</h2>
							<RecentScoresTicker scores={recentScores} />
						</div>
					)}

					{!nextGame && allLiveGames.length === 0 && recentScores.length === 0 && (
						<div className="text-white text-center text-xl">
							No games scheduled for your favorite teams today.
						</div>
					)}
				</div>
			</div>
		);
	}

	return (
		<LiveGame
			games={liveGames}
			currentGameIndex={currentGameIndex}
			setCurrentGameIndex={setCurrentGameIndex}
			onShowTeamSelector={() => setShowTeamSelector(true)}
		/>
	);
};

export default App;