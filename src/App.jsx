import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Settings, X, Info } from 'lucide-react';

const App = () => {
  const [favoriteTeams, setFavoriteTeams] = useState([]);
  const [showTeamSelector, setShowTeamSelector] = useState(false);
  const [liveGames, setLiveGames] = useState([]);
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isOffSeason, setIsOffSeason] = useState(false);
  const [nextGame, setNextGame] = useState(null);
  const [recentScores, setRecentScores] = useState([]);
  const [activeTab, setActiveTab] = useState('game');
  const [baseTooltip, setBaseTooltip] = useState(null);
  const [allTeams, setAllTeams] = useState([]);
  const tooltipTimeoutRef = useRef(null);

  // Fetch teams list dynamically
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch('https://statsapi.mlb.com/api/v1/teams?sportId=1');
        const data = await response.json();
        if (data.teams) {
          const teams = data.teams
            .filter(t => t.sport.id === 1)
            .map(t => ({
              id: t.id,
              name: t.name,
              abbrev: t.abbreviation || t.teamCode
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
          setAllTeams(teams);
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };
    fetchTeams();
  }, []);

  // Check if favorites exist on mount
  useEffect(() => {
    // Stub: Would normally load from localStorage
    // const saved = localStorage.getItem('mlbFavoriteTeams');
    // if (saved) {
    //   setFavoriteTeams(JSON.parse(saved));
    // } else {
    //   setShowTeamSelector(true);
    // }
    
    if (favoriteTeams.length === 0 && allTeams.length > 0) {
      setShowTeamSelector(true);
    }
  }, [allTeams]);

  // Fetch live games data
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const today = `${year}-${month}-${day}`;
        
        const response = await fetch(
          `https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${today}&hydrate=game(content(summary)),linescore,team`
        );
        const data = await response.json();
        
        if (data.dates && data.dates.length > 0) {
          const games = data.dates[0].games;
          
          const relevantGames = games.filter(g => 
            favoriteTeams.length === 0 || 
            favoriteTeams.includes(g.teams.away.team.id) || 
            favoriteTeams.includes(g.teams.home.team.id)
          );
          
          const live = relevantGames.filter(g => 
            g.status.abstractGameState === 'Live'
          );
          
          if (live.length > 0) {
            setLiveGames(live);
            setIsOffSeason(false);
          } else {
            const upcoming = relevantGames.filter(g => 
              g.status.abstractGameState === 'Preview'
            );
            
            if (upcoming.length > 0) {
              setNextGame(upcoming[0]);
              setIsOffSeason(false);
            }
            
            const final = games.filter(g => g.status.abstractGameState === 'Final');
            setRecentScores(final.slice(0, 5));
            setIsOffSeason(false);
          }
        } else {
          setIsOffSeason(true);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching games:', error);
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
    // Stub: Would normally save to localStorage
    // localStorage.setItem('mlbFavoriteTeams', JSON.stringify(teams));
    setShowTeamSelector(false);
  };

  const toggleFavoriteTeam = (teamId) => {
    setFavoriteTeams(prev => 
      prev.includes(teamId) 
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handleBaseClick = (base, runner) => {
    if (runner) {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
      
      setBaseTooltip({ base, runner });
      
      tooltipTimeoutRef.current = setTimeout(() => {
        setBaseTooltip(null);
      }, 10000);
    }
  };

  const closeTooltip = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    setBaseTooltip(null);
  };

  useEffect(() => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    setBaseTooltip(null);
  }, [currentGameIndex, liveGames]);

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
      <div className="min-h-screen max-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex flex-col items-center justify-center p-4">
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
      <div className="min-h-screen max-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex flex-col p-4">
        <div className="flex justify-end mb-4">
          <button 
            onClick={() => setShowTeamSelector(true)}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-white transition-all min-h-[44px] min-w-[44px]"
          >
            <Settings className="inline mr-2" size={20} />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center max-w-6xl mx-auto w-full">
          {nextGame && (
            <div className="w-full backdrop-blur-xl bg-white/5 rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl mb-8">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Next Game</h2>
              <NextGameDisplay game={nextGame} />
            </div>
          )}
          
          {recentScores.length > 0 && (
            <div className="w-full backdrop-blur-xl bg-white/5 rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Recent Scores</h2>
              <RecentScoresTicker scores={recentScores} />
            </div>
          )}
          
          {!nextGame && recentScores.length === 0 && (
            <div className="text-white text-center text-xl">
              No games scheduled for your favorite teams today.
            </div>
          )}
        </div>
      </div>
    );
  }

  const currentGame = liveGames[currentGameIndex];

  return (
    <div className="min-h-screen max-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="flex items-center gap-2 md:gap-4">
          {liveGames.length > 1 && (
            <>
              <button 
                onClick={() => setCurrentGameIndex((prev) => (prev - 1 + liveGames.length) % liveGames.length)}
                className="p-2 hover:bg-white/10 rounded-lg transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <ChevronLeft className="text-white" size={24} />
              </button>
              <span className="text-white text-sm">
                {currentGameIndex + 1} / {liveGames.length}
              </span>
              <button 
                onClick={() => setCurrentGameIndex((prev) => (prev + 1) % liveGames.length)}
                className="p-2 hover:bg-white/10 rounded-lg transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <ChevronRight className="text-white" size={24} />
              </button>
            </>
          )}
        </div>
        
        <h1 className="text-white text-lg md:text-2xl font-bold flex-1 text-center">MLB Live Tracker</h1>
        
        <button 
          onClick={() => setShowTeamSelector(true)}
          className="p-2 hover:bg-white/10 rounded-lg transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <Settings className="text-white" size={24} />
        </button>
      </div>

      {/* Mobile Tabs */}
      <div className="md:hidden flex backdrop-blur-xl bg-white/5 border-b border-white/10">
        <button
          onClick={() => setActiveTab('game')}
          className={`flex-1 py-3 text-center transition-all min-h-[44px] ${
            activeTab === 'game' ? 'text-white border-b-2 border-blue-400' : 'text-gray-400'
          }`}
        >
          Game
        </button>
        <button
          onClick={() => setActiveTab('players')}
          className={`flex-1 py-3 text-center transition-all min-h-[44px] ${
            activeTab === 'players' ? 'text-white border-b-2 border-blue-400' : 'text-gray-400'
          }`}
        >
          Players
        </button>
        <button
          onClick={() => setActiveTab('play')}
          className={`flex-1 py-3 text-center transition-all min-h-[44px] ${
            activeTab === 'play' ? 'text-white border-b-2 border-blue-400' : 'text-gray-400'
          }`}
        >
          Play
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4">
        <LiveGameDisplay 
          game={currentGame} 
          activeTab={activeTab}
          onBaseClick={handleBaseClick}
          baseTooltip={baseTooltip}
          onCloseTooltip={closeTooltip}
        />
      </div>
    </div>
  );
};

const TeamSelector = ({ teams, selected, onToggle, onSave }) => {
  return (
    <div className="min-h-screen max-h-screen overflow-auto bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="backdrop-blur-xl bg-white/5 rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Select Your Favorite Teams</h2>
          <p className="text-gray-300 mb-6">Choose the teams you want to follow</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6 max-h-[60vh] overflow-auto">
            {teams.map(team => (
              <button
                key={team.id}
                onClick={() => onToggle(team.id)}
                className={`p-4 rounded-xl border transition-all text-left min-h-[60px] flex items-center gap-3 ${
                  selected.includes(team.id)
                    ? 'bg-blue-500/20 border-blue-400/50'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="w-12 h-12 rounded-full backdrop-blur-md bg-gradient-to-br from-white/40 to-white/20 border border-white/30 shadow-lg flex items-center justify-center p-2 flex-shrink-0">
                  <img 
                    src={`https://www.mlbstatic.com/team-logos/${team.id}.svg`}
                    alt={team.name}
                    className="w-full h-full object-contain"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold">{team.abbrev}</div>
                  <div className="text-gray-400 text-sm truncate">{team.name}</div>
                </div>
              </button>
            ))}
          </div>
          
          <button
            onClick={onSave}
            disabled={selected.length === 0}
            className="w-full py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl text-white font-semibold transition-all min-h-[56px]"
          >
            Save Favorites ({selected.length})
          </button>
        </div>
      </div>
    </div>
  );
};

const LiveGameDisplay = ({ game, activeTab, onBaseClick, baseTooltip, onCloseTooltip }) => {
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const response = await fetch(
          `https://statsapi.mlb.com/api/v1.1/game/${game.gamePk}/feed/live`
        );
        const data = await response.json();
        setGameData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching game data:', error);
        setLoading(false);
      }
    };

    fetchGameData();
    const interval = setInterval(fetchGameData, 10000);
    return () => clearInterval(interval);
  }, [game.gamePk]);

  if (loading || !gameData) {
    return <div className="text-white text-center">Loading game data...</div>;
  }

  const liveData = gameData.liveData;
  const plays = liveData.plays;
  const currentPlay = plays.currentPlay;
  const boxscore = liveData.boxscore;
  const gameInfo = gameData.gameData;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* Column 1: Score and Diamond */}
          <div className="space-y-4">
            <ScoreboardSection game={game} liveData={liveData} gameInfo={gameInfo} />
            <DiamondSection 
              runners={currentPlay?.runners || []} 
              onBaseClick={onBaseClick}
              baseTooltip={baseTooltip}
              onCloseTooltip={onCloseTooltip}
              boxscore={boxscore}
            />
          </div>
          
          {/* Column 2: Players and Lineup */}
          <div className="space-y-4">
            <PlayersSection boxscore={boxscore} currentPlay={currentPlay} />
            <LineupSection boxscore={boxscore} liveData={liveData} />
          </div>
          
          {/* Column 3: Current Play */}
          <div>
            <CurrentPlaySection currentPlay={currentPlay} plays={plays} />
          </div>
        </div>
        
        {/* Full width ticker */}
        <OtherLiveGamesTicker currentGamePk={game.gamePk} />
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden space-y-4">
        {activeTab === 'game' && (
          <>
            <ScoreboardSection game={game} liveData={liveData} gameInfo={gameInfo} />
            <DiamondSection 
              runners={currentPlay?.runners || []} 
              onBaseClick={onBaseClick}
              baseTooltip={baseTooltip}
              onCloseTooltip={onCloseTooltip}
              boxscore={boxscore}
            />
          </>
        )}
        
        {activeTab === 'players' && (
          <>
            <PlayersSection boxscore={boxscore} currentPlay={currentPlay} />
            <LineupSection boxscore={boxscore} liveData={liveData} />
          </>
        )}
        
        {activeTab === 'play' && (
          <CurrentPlaySection currentPlay={currentPlay} plays={plays} />
        )}
        
        <OtherLiveGamesTicker currentGamePk={game.gamePk} />
      </div>
    </div>
  );
};

const ScoreboardSection = ({ game, liveData, gameInfo }) => {
  const away = game.teams.away;
  const home = game.teams.home;
  const linescore = liveData.linescore;
  
  const seriesDescription = gameInfo?.game?.seriesDescription || '';
  const seriesGameNumber = gameInfo?.game?.seriesGameNumber || '';

  return (
    <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-4 md:p-6 border border-white/10 shadow-xl">
      {seriesDescription && (
        <div className="text-center text-gray-300 text-sm mb-3 pb-3 border-b border-white/10">
          {seriesDescription} {seriesGameNumber && `- Game ${seriesGameNumber}`}
        </div>
      )}
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full backdrop-blur-md bg-gradient-to-br from-white/40 to-white/20 border border-white/30 shadow-lg flex items-center justify-center p-2.5 flex-shrink-0">
            <img 
              src={`https://www.mlbstatic.com/team-logos/${away.team.id}.svg`}
              alt={away.team.name}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-bold text-base md:text-lg truncate">{away.team.name}</div>
            <div className="text-gray-400 text-sm">
              {linescore.teams.away.wins}-{linescore.teams.away.losses}
              {away.seriesNumber && ` (${away.seriesNumber})`}
            </div>
          </div>
        </div>
        <div className="text-3xl md:text-4xl font-bold text-white ml-2">{away.score}</div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full backdrop-blur-md bg-gradient-to-br from-white/40 to-white/20 border border-white/30 shadow-lg flex items-center justify-center p-2.5 flex-shrink-0">
            <img 
              src={`https://www.mlbstatic.com/team-logos/${home.team.id}.svg`}
              alt={home.team.name}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-bold text-base md:text-lg truncate">{home.team.name}</div>
            <div className="text-gray-400 text-sm">
              {linescore.teams.home.wins}-{linescore.teams.home.losses}
              {home.seriesNumber && ` (${home.seriesNumber})`}
            </div>
          </div>
        </div>
        <div className="text-3xl md:text-4xl font-bold text-white ml-2">{home.score}</div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10 flex justify-around text-center">
        <div>
          <div className="text-gray-400 text-xs uppercase">Inning</div>
          <div className="text-white font-bold">
            {linescore.isTopInning ? '▲' : '▼'} {linescore.currentInningOrdinal}
          </div>
        </div>
        <div>
          <div className="text-gray-400 text-xs uppercase">Outs</div>
          <div className="text-white font-bold">{linescore.outs}</div>
        </div>
        <div>
          <div className="text-gray-400 text-xs uppercase">Count</div>
          <div className="text-white font-bold">{linescore.balls}-{linescore.strikes}</div>
        </div>
      </div>
    </div>
  );
};

const DiamondSection = ({ runners, onBaseClick, baseTooltip, onCloseTooltip, boxscore }) => {
  const basesOccupied = {};
  runners.forEach(runner => {
    if (runner.movement.start) {
      basesOccupied[runner.movement.start] = runner.details.runner;
    }
  });

  const getPlayerStats = (playerId) => {
    if (!boxscore || !playerId) return null;
    
    const awayPlayer = boxscore.teams?.away?.players?.[`ID${playerId}`];
    const homePlayer = boxscore.teams?.home?.players?.[`ID${playerId}`];
    const player = awayPlayer || homePlayer;
    
    return player?.seasonStats?.batting;
  };

  const renderBase = (baseName, position, displayName) => {
    const occupied = basesOccupied[baseName];
    const stats = occupied ? getPlayerStats(occupied.id) : null;
    
    return (
      <div className="relative" style={{ position: 'absolute', ...position }}>
        <button
          onClick={() => onBaseClick(baseName, occupied)}
          className={`w-10 h-10 md:w-14 md:h-14 rotate-45 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center ${
            occupied 
              ? 'bg-yellow-400 border-2 border-yellow-500 shadow-lg shadow-yellow-500/50' 
              : 'bg-white/20 border-2 border-white/40'
          }`}
        >
          <span className="-rotate-45 block text-xs md:text-sm font-bold" style={{ color: occupied ? '#000' : '#fff' }}>
            {displayName}
          </span>
        </button>
        
        {baseTooltip?.base === baseName && baseTooltip?.runner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
               onClick={onCloseTooltip}>
            <div className="bg-gray-900 rounded-2xl p-4 md:p-6 text-white shadow-2xl border border-white/20 max-w-sm w-full"
                 onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold">Runner on {displayName}</h3>
                <button onClick={onCloseTooltip} className="p-1 hover:bg-white/10 rounded min-h-[32px] min-w-[32px]">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
                  <img 
                    src={`https://img.mlbstatic.com/mlb-photos/image/upload/w_256,q_auto:best/v1/people/${baseTooltip.runner.id}/headshot/83/current`}
                    alt={baseTooltip.runner.fullName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23333" width="100" height="100"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%23fff" font-size="40">?</text></svg>';
                    }}
                  />
                </div>
                <div>
                  <div className="font-bold text-xl">{baseTooltip.runner.fullName}</div>
                  <div className="text-gray-400">#{baseTooltip.runner.primaryNumber}</div>
                </div>
              </div>
              
              {stats && (
                <div className="grid grid-cols-3 gap-4 text-center bg-white/5 rounded-lg p-3">
                  <div>
                    <div className="text-gray-400 text-xs uppercase">AVG</div>
                    <div className="font-bold">{stats.avg}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs uppercase">HR</div>
                    <div className="font-bold">{stats.homeRuns}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs uppercase">RBI</div>
                    <div className="font-bold">{stats.rbi}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 md:p-8 border border-white/10 shadow-xl">
      <div className="relative w-full max-w-md mx-auto aspect-square">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-4/5 h-4/5">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
              <path d="M 50 10 L 90 50 L 50 90 L 10 50 Z" 
                    fill="none" 
                    stroke="rgba(255,255,255,0.3)" 
                    strokeWidth="2" />
            </svg>
            
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-white/40 rounded-full border-2 border-white/60 flex items-center justify-center">
                <span className="text-xs font-bold text-white">H</span>
              </div>
            </div>
            
            {renderBase('1B', { right: '0', top: '50%', transform: 'translate(50%, -50%)' }, '1st')}
            {renderBase('2B', { top: '0', left: '50%', transform: 'translate(-50%, -50%)' }, '2nd')}
            {renderBase('3B', { left: '0', top: '50%', transform: 'translate(-50%, -50%)' }, '3rd')}
          </div>
        </div>
      </div>
    </div>
  );
};

const CurrentPlaySection = ({ currentPlay, plays }) => {
  if (!currentPlay && !plays?.allPlays?.length) return null;

  const displayPlay = currentPlay || plays.allPlays[plays.allPlays.length - 1];
  const playEvents = displayPlay.playEvents || [];
  
  // Get all pitches in this at-bat
  const pitches = playEvents.filter(event => event.isPitch);
  const lastPitch = pitches[pitches.length - 1];
  
  // Strike zone visualization with pitch history
  const renderStrikeZone = () => {
    if (pitches.length === 0) return null;
    
    return (
      <div className="relative w-full max-w-xs mx-auto aspect-square bg-gradient-to-br from-blue-900/20 to-blue-800/20 rounded-lg border border-blue-400/30">
        {/* Strike Zone Box */}
        <div className="absolute" 
             style={{
               left: '25%',
               top: '25%',
               width: '50%',
               height: '50%',
               border: '2px solid rgba(255, 255, 255, 0.5)',
               backgroundColor: 'rgba(255, 255, 255, 0.05)'
             }}>
        </div>
        
        {/* Home Plate */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-white/30 transform rotate-45"></div>
        
        {/* All Pitches */}
        {pitches.map((pitch, index) => {
          const coords = pitch.pitchData?.coordinates;
          if (!coords || coords.pX === undefined || coords.pZ === undefined) return null;
          
          const { pX, pZ } = coords;
          const strikeZoneLeft = -0.83;
          const strikeZoneRight = 0.83;
          const strikeZoneBottom = 1.5;
          const strikeZoneTop = 3.5;
          
          const xRange = 3;
          const zRange = 5;
          const xPercent = ((pX + xRange/2) / xRange) * 100;
          const zPercent = ((strikeZoneTop + 1 - pZ) / zRange) * 100;
          
          const inZone = pX >= strikeZoneLeft && pX <= strikeZoneRight && 
                         pZ >= strikeZoneBottom && pZ <= strikeZoneTop;
          
          const isLastPitch = index === pitches.length - 1;
          const pitchResult = pitch.details?.call?.description || '';
          const isBall = pitchResult.includes('Ball');
          const isStrike = pitchResult.includes('Strike') || pitchResult.includes('Foul') || pitchResult.includes('In play');
          
          return (
            <div 
              key={index}
              className="absolute transition-all"
              style={{
                left: `${Math.max(0, Math.min(100, xPercent))}%`,
                top: `${Math.max(0, Math.min(100, zPercent))}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: isLastPitch ? 10 : 5
              }}
            >
              <div 
                className={`rounded-full ${isLastPitch ? 'w-4 h-4' : 'w-3 h-3'}`}
                style={{
                  backgroundColor: isBall ? '#ef4444' : isStrike ? '#22c55e' : '#6b7280',
                  opacity: isLastPitch ? 1 : 0.6,
                  boxShadow: isLastPitch ? (isBall ? '0 0 10px #ef4444' : '0 0 10px #22c55e') : 'none'
                }}
              >
              </div>
              {isLastPitch && (
                <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 text-xs text-white whitespace-nowrap bg-black/70 px-2 py-1 rounded">
                  {pitch.details?.type?.description}
                </div>
              )}
            </div>
          );
        })}
        
        <div className="absolute top-1 left-2 text-xs text-gray-400">
          Balls: {pitches.filter(p => p.details?.call?.description?.includes('Ball')).length}
        </div>
        <div className="absolute top-1 right-2 text-xs text-gray-400">
          Strikes: {pitches.filter(p => {
            const desc = p.details?.call?.description || '';
            return desc.includes('Strike') || desc.includes('Foul');
          }).length}
        </div>
        
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs text-gray-400">
          Catcher's View
        </div>
      </div>
    );
  };
  
  return (
    <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-4 md:p-6 border border-white/10 shadow-xl">
      <h3 className="text-white font-bold text-lg mb-3">
        {displayPlay === currentPlay ? 'Current Play' : 'Last Play'}
      </h3>
      
      <div className="space-y-4">
        {lastPitch?.isPitch && (
          <>
            <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-400/20">
              <div className="flex justify-between items-center mb-2">
                <span className="text-blue-300 font-semibold text-lg">
                  {lastPitch.details?.type?.description || 'Pitch'}
                </span>
                <span className="text-white text-2xl font-bold">
                  {lastPitch.pitchData?.startSpeed ? `${Math.round(lastPitch.pitchData.startSpeed)} mph` : ''}
                </span>
              </div>
              <div className="text-gray-300 text-sm">
                {lastPitch.details?.description || ''}
              </div>
            </div>
            
            {renderStrikeZone()}
          </>
        )}
        
        <div className="text-gray-300 bg-white/5 p-3 rounded-lg">
          {displayPlay.result?.description || 'No play description available'}
        </div>
      </div>
    </div>
  );
};

const PlayersSection = ({ boxscore, currentPlay }) => {
  const batterStats = currentPlay?.matchup?.batter;
  const pitcherStats = currentPlay?.matchup?.pitcher;
  
  const getBatterStats = () => {
    if (!batterStats) return null;
    const stats = boxscore?.teams?.away?.players?.[`ID${batterStats.id}`]?.seasonStats?.batting || 
                  boxscore?.teams?.home?.players?.[`ID${batterStats.id}`]?.seasonStats?.batting;
    return stats;
  };

  const getPitcherStats = () => {
    if (!pitcherStats) return null;
    const stats = boxscore?.teams?.away?.players?.[`ID${pitcherStats.id}`]?.seasonStats?.pitching || 
                  boxscore?.teams?.home?.players?.[`ID${pitcherStats.id}`]?.seasonStats?.pitching;
    return stats;
  };

  const bStats = getBatterStats();
  const pStats = getPitcherStats();

  return (
    <div className="space-y-4">
      {/* Batter */}
      {batterStats && (
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-4 border border-white/10 shadow-xl">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <span>At Bat</span>
            {currentPlay?.matchup?.batSide && (
              <span className="text-xs bg-blue-500/20 px-2 py-1 rounded">
                {currentPlay.matchup.batSide.code === 'L' ? 'Left' : currentPlay.matchup.batSide.code === 'R' ? 'Right' : 'Switch'}
              </span>
            )}
          </h3>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-gray-800 flex-shrink-0 border-2 border-white/20">
              <img 
                src={`https://img.mlbstatic.com/mlb-photos/image/upload/w_256,q_auto:best/v1/people/${batterStats.id}/headshot/83/current`}
                alt={batterStats.fullName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23333" width="100" height="100"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%23fff" font-size="40">?</text></svg>';
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-bold text-base md:text-lg truncate">{batterStats.fullName}</div>
              <div className="text-gray-400">#{batterStats.primaryNumber}</div>
            </div>
          </div>
          
          {bStats && (
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-gray-400 text-xs uppercase">AVG</div>
                <div className="text-white font-bold">{bStats.avg}</div>
              </div>
              <div>
                <div className="text-gray-400 text-xs uppercase">HR</div>
                <div className="text-white font-bold">{bStats.homeRuns}</div>
              </div>
              <div>
                <div className="text-gray-400 text-xs uppercase">RBI</div>
                <div className="text-white font-bold">{bStats.rbi}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pitcher */}
      {pitcherStats && (
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-4 border border-white/10 shadow-xl">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <span>Pitching</span>
            {currentPlay?.matchup?.pitchHand && (
              <span className="text-xs bg-green-500/20 px-2 py-1 rounded">
                {currentPlay.matchup.pitchHand.code === 'L' ? 'Left' : 'Right'}
              </span>
            )}
          </h3>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-gray-800 flex-shrink-0 border-2 border-white/20">
              <img 
                src={`https://img.mlbstatic.com/mlb-photos/image/upload/w_256,q_auto:best/v1/people/${pitcherStats.id}/headshot/83/current`}
                alt={pitcherStats.fullName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23333" width="100" height="100"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%23fff" font-size="40">?</text></svg>';
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-bold text-base md:text-lg truncate">{pitcherStats.fullName}</div>
              <div className="text-gray-400">#{pitcherStats.primaryNumber}</div>
            </div>
          </div>
          
          {pStats && (
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-gray-400 text-xs uppercase">ERA</div>
                <div className="text-white font-bold">{pStats.era}</div>
              </div>
              <div>
                <div className="text-gray-400 text-xs uppercase">W-L</div>
                <div className="text-white font-bold">{pStats.wins}-{pStats.losses}</div>
              </div>
              <div>
                <div className="text-gray-400 text-xs uppercase">SO</div>
                <div className="text-white font-bold">{pStats.strikeOuts}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const LineupSection = ({ boxscore, liveData }) => {
  const battingTeam = liveData.linescore.isTopInning ? 'away' : 'home';
  const teamData = boxscore?.teams?.[battingTeam];
  const battingOrder = teamData?.battingOrder || [];
  const players = teamData?.players || {};
  
  const currentBatterId = liveData.plays.currentPlay?.matchup?.batter?.id;
  
  // Find current batter position in the lineup
  let currentBatterPosition = -1;
  if (currentBatterId) {
    for (let i = 0; i < battingOrder.length; i++) {
      const playerId = battingOrder[i];
      const player = players[playerId]?.person;
      if (player && player.id === currentBatterId) {
        currentBatterPosition = i;
        break;
      }
    }
  }

  const getNextBatters = () => {
    if (battingOrder.length === 0) return [];
    
    // If we found the current batter, get next 3
    if (currentBatterPosition !== -1) {
      const next = [];
      for (let i = 1; i <= 3; i++) {
        const index = (currentBatterPosition + i) % battingOrder.length;
        if (battingOrder[index]) {
          next.push(battingOrder[index]);
        }
      }
      return next;
    }
    
    // Fallback: just show first 3 batters
    return battingOrder.slice(0, 3);
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
          const player = players[playerId]?.person;
          const stats = players[playerId]?.seasonStats?.batting;
          
          if (!player) return null;
          
          return (
            <div key={playerId} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
              <div className="w-8 h-8 flex items-center justify-center bg-blue-500/20 rounded-full text-blue-300 font-bold text-sm flex-shrink-0">
                {index + 1}
              </div>
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-800 flex-shrink-0 border border-white/20">
                <img 
                  src={`https://img.mlbstatic.com/mlb-photos/image/upload/w_256,q_auto:best/v1/people/${player.id}/headshot/83/current`}
                  alt={player.fullName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23333" width="100" height="100"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%23fff" font-size="30">?</text></svg>';
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-semibold text-sm truncate">{player.fullName}</div>
                <div className="text-gray-400 text-xs">
                  {stats ? `AVG: ${stats.avg}` : 'No stats'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const OtherLiveGamesTicker = ({ currentGamePk }) => {
  const [otherGames, setOtherGames] = useState([]);

  useEffect(() => {
    const fetchOtherGames = async () => {
      try {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const today = `${year}-${month}-${day}`;
        
        const response = await fetch(
          `https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${today}&hydrate=linescore,team`
        );
        const data = await response.json();
        
        if (data.dates && data.dates.length > 0) {
          const games = data.dates[0].games;
          const live = games.filter(g => 
            g.status.abstractGameState === 'Live' && 
            g.gamePk !== currentGamePk
          );
          setOtherGames(live);
        }
      } catch (error) {
        console.error('Error fetching other games:', error);
      }
    };

    fetchOtherGames();
    const interval = setInterval(fetchOtherGames, 30000); // Update every 30 seconds
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
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-6 h-6 rounded-full backdrop-blur-md bg-gradient-to-br from-white/40 to-white/20 border border-white/30 shadow-lg flex items-center justify-center p-1 flex-shrink-0">
                  <img 
                    src={`https://www.mlbstatic.com/team-logos/${game.teams.away.team.id}.svg`}
                    alt={game.teams.away.team.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-white text-sm truncate">{game.teams.away.team.abbreviation}</span>
              </div>
              <span className="text-white font-bold ml-2">{game.teams.away.score}</span>
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-6 h-6 rounded-full backdrop-blur-md bg-gradient-to-br from-white/40 to-white/20 border border-white/30 shadow-lg flex items-center justify-center p-1 flex-shrink-0">
                  <img 
                    src={`https://www.mlbstatic.com/team-logos/${game.teams.home.team.id}.svg`}
                    alt={game.teams.home.team.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-white text-sm truncate">{game.teams.home.team.abbreviation}</span>
              </div>
              <span className="text-white font-bold ml-2">{game.teams.home.score}</span>
            </div>
            
            <div className="text-center text-gray-400 text-xs pt-2 border-t border-white/10">
              {game.linescore?.isTopInning ? '▲' : '▼'} {game.linescore?.currentInningOrdinal || 'Live'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const NextGameDisplay = ({ game }) => {
  const gameTime = new Date(game.gameDate);
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full backdrop-blur-md bg-gradient-to-br from-white/40 to-white/20 border border-white/30 shadow-lg flex items-center justify-center p-2.5 flex-shrink-0">
            <img 
              src={`https://www.mlbstatic.com/team-logos/${game.teams.away.team.id}.svg`}
              alt={game.teams.away.team.name}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-bold text-lg truncate">{game.teams.away.team.name}</div>
            <div className="text-gray-400 text-sm">
              {game.teams.away.leagueRecord?.wins || 0}-{game.teams.away.leagueRecord?.losses || 0}
            </div>
          </div>
        </div>
        <div className="text-gray-400 text-xl font-bold mx-4">@</div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full backdrop-blur-md bg-gradient-to-br from-white/40 to-white/20 border border-white/30 shadow-lg flex items-center justify-center p-2.5 flex-shrink-0">
            <img 
              src={`https://www.mlbstatic.com/team-logos/${game.teams.home.team.id}.svg`}
              alt={game.teams.home.team.name}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-bold text-lg truncate">{game.teams.home.team.name}</div>
            <div className="text-gray-400 text-sm">
              {game.teams.home.leagueRecord?.wins || 0}-{game.teams.home.leagueRecord?.losses || 0}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-white/10 text-center">
        <div className="text-gray-400 text-sm mb-1">Game Time</div>
        <div className="text-white text-xl font-bold">
          {gameTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
        </div>
        <div className="text-gray-400 text-sm">
          {gameTime.toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

const RecentScoresTicker = ({ scores }) => {
  return (
    <div className="space-y-3">
      {scores.map((game, index) => (
        <div key={index} className="backdrop-blur-xl bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-full backdrop-blur-md bg-gradient-to-br from-white/40 to-white/20 border border-white/30 shadow-lg flex items-center justify-center p-1.5 flex-shrink-0">
                <img 
                  src={`https://www.mlbstatic.com/team-logos/${game.teams.away.team.id}.svg`}
                  alt={game.teams.away.team.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-white text-sm truncate">{game.teams.away.team.name}</span>
            </div>
            <span className="text-white font-bold text-lg ml-2">{game.teams.away.score}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-full backdrop-blur-md bg-gradient-to-br from-white/40 to-white/20 border border-white/30 shadow-lg flex items-center justify-center p-1.5 flex-shrink-0">
                <img 
                  src={`https://www.mlbstatic.com/team-logos/${game.teams.home.team.id}.svg`}
                  alt={game.teams.home.team.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-white text-sm truncate">{game.teams.home.team.name}</span>
            </div>
            <span className="text-white font-bold text-lg ml-2">{game.teams.home.score}</span>
          </div>
          
          <div className="mt-2 pt-2 border-t border-white/10 text-center text-gray-400 text-xs">
            Final {game.isTie ? '(Tie)' : ''}
          </div>
        </div>
      ))}
    </div>
  );
};

export default App;