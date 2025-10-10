import React from 'react';

const CurrentPlay = ({ currentPlay, plays }) => {
  const displayPlay = currentPlay || (plays?.allPlays?.length > 0 ? plays.allPlays[plays.allPlays.length - 1] : null);
  
  if (!displayPlay) {
    return (
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-4 md:p-6 border border-white/10 shadow-xl">
        <h3 className="text-white font-bold text-lg mb-3">Current Play</h3>
        <div className="text-gray-400">Waiting for play data...</div>
      </div>
    );
  }

  const playEvents = displayPlay.playEvents || [];
  const pitches = playEvents.filter(event => event.isPitch);
  const lastPitch = pitches[pitches.length - 1];
  
  const { balls, strikes } = displayPlay.count || { balls: 0, strikes: 0 };
  
  const renderStrikeZone = () => {
    return (
      // ** FIX: Added overflow-hidden to clip pitches outside the box **
      <div className="relative w-full max-w-xs mx-auto aspect-square bg-gradient-to-br from-blue-900/20 to-blue-800/20 rounded-lg border border-blue-400/30 overflow-hidden">
        <div className="absolute" style={{ left: '25%', top: '25%', width: '50%', height: '50%', border: '2px solid rgba(255, 255, 255, 0.5)', backgroundColor: 'rgba(255, 255, 255, 0.05)' }} />
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-white/30 transform rotate-45"></div>
        
        {pitches.map((pitch, index) => {
          const coords = pitch.pitchData?.coordinates;
          if (!coords || typeof coords.pX !== 'number' || typeof coords.pZ !== 'number') return null;
          
          const { pX, pZ } = coords;
          // This calculation maps the API's (x, z) coordinates to percentages for CSS positioning
          const xPercent = ((pX + 1.5) / 3) * 100;
          const zPercent = (1 - ((pZ - 1.5) / 2)) * 100;
          
          const isLastPitch = index === pitches.length - 1;
          const call = pitch.details?.call?.description || '';
          const isBall = call.includes('Ball');
          const isStrike = call.includes('Strike') || call.includes('Foul');
          
          return (
            <div 
              key={index}
              className="absolute"
              style={{ left: `${xPercent}%`, top: `${zPercent}%`, transform: 'translate(-50%, -50%)', zIndex: isLastPitch ? 10 : 5 }}
            >
              <div 
                className={`rounded-full flex items-center justify-center ${isLastPitch ? 'w-6 h-6' : 'w-5 h-5'}`}
                style={{
                  backgroundColor: isBall ? '#ef4444' : isStrike ? '#22c55e' : '#6b7280',
                  opacity: isLastPitch ? 1 : 0.7,
                  boxShadow: isLastPitch ? `0 0 10px ${isBall ? '#ef4444' : isStrike ? '#22c55e' : 'none'}` : 'none',
                  border: '2px solid rgba(255,255,255,0.5)'
                }}
              >
                <span className="text-white text-xs font-bold">{index + 1}</span>
              </div>
              {isLastPitch && pitch.details?.type?.description && (
                <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 text-xs text-white whitespace-nowrap bg-black/70 px-2 py-1 rounded">
                  {pitch.details.type.description}
                </div>
              )}
            </div>
          );
        })}
        
        <div className="absolute top-1 left-2"><div className="flex gap-1">{[...Array(4)].map((_, i) => <div key={i} className="w-3 h-3 rounded-full border-2 border-red-400" style={{ backgroundColor: i < balls ? '#ef4444' : 'transparent' }} />)}</div><div className="text-gray-400 text-xs mt-1">Balls</div></div>
        <div className="absolute top-1 right-2"><div className="flex gap-1">{[...Array(3)].map((_, i) => <div key={i} className="w-3 h-3 rounded-full border-2 border-green-400" style={{ backgroundColor: i < strikes ? '#22c55e' : 'transparent' }} />)}</div><div className="text-gray-400 text-xs mt-1 text-right">Strikes</div></div>
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs text-gray-400">Catcher's View</div>
      </div>
    );
  };
  
  return (
    <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-4 md:p-6 border border-white/10 shadow-xl">
      <h3 className="text-white font-bold text-lg mb-3">{displayPlay === currentPlay ? 'Current Play' : 'Last Play'}</h3>
      <div className="space-y-4">
        {lastPitch?.isPitch && (
          <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-400/20">
            <div className="flex justify-between items-center mb-2">
              <span className="text-blue-300 font-semibold text-lg">{lastPitch.details?.type?.description || 'Pitch'}</span>
              <span className="text-white text-2xl font-bold">{lastPitch.pitchData?.startSpeed ? `${Math.round(lastPitch.pitchData.startSpeed)} mph` : ''}</span>
            </div>
            <div className="text-gray-300 text-sm">{lastPitch.details?.description || ''}</div>
          </div>
        )}
        
        {renderStrikeZone()}
        
        <div className="text-gray-300 bg-white/5 p-3 rounded-lg">
          {displayPlay.result?.description || 'No play description available'}
        </div>
      </div>
    </div>
  );
};

export default CurrentPlay;