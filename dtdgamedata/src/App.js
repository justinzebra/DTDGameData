// src/App.js
import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore';
import './App.css';

function App() {
  const [seasons, setSeasons] = useState([]);
  const [newSeason, setNewSeason] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('');
  const [matches, setMatches] = useState([]);
  const [newMatch, setNewMatch] = useState({ date: '', opponent: '', players: [] });
  const [playerData, setPlayerData] = useState({
    number: '', name: '', missed_two: 0, made_two: 0, missed_three: 0, made_three: 0,
    missed_free: 0, made_free: 0, off_reb: 0, def_reb: 0, assists: 0, steals: 0,
    blocks: 0, turnovers: 0, fouls: 0, total_points: 0
  });

  // Fetch seasons from Firestore
  useEffect(() => {
    const fetchSeasons = async () => {
      const seasonCollection = collection(db, 'seasons');
      const seasonSnapshot = await getDocs(seasonCollection);
      const seasonList = seasonSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSeasons(seasonList);
    };

    fetchSeasons();
  }, []);

  // Add a new season
  const addSeason = async () => {
    if (newSeason) {
      try {
        await addDoc(collection(db, 'seasons'), {
          year: newSeason,
          matches: [],
        });
        setNewSeason('');
        alert('Season added successfully!');
        // Refresh the seasons list
        const seasonCollection = collection(db, 'seasons');
        const seasonSnapshot = await getDocs(seasonCollection);
        const seasonList = seasonSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSeasons(seasonList);
      } catch (error) {
        console.error('Error adding season: ', error);
      }
    }
  };

  // Fetch matches of the selected season
  const fetchMatches = async (seasonId) => {
    setSelectedSeason(seasonId);
    const season = seasons.find(season => season.id === seasonId);
    setMatches(season.matches || []);
  };

  // Add a new match
  const addMatch = async () => {
    if (newMatch.date && newMatch.opponent) {
      const seasonRef = doc(db, 'seasons', selectedSeason);
      const updatedMatches = [...matches, newMatch];
      await updateDoc(seasonRef, { matches: updatedMatches });
      setNewMatch({ date: '', opponent: '', players: [] });
      alert('Match added successfully!');
      fetchMatches(selectedSeason); // Refresh matches
    }
  };

  // Add player data to the current match
  const addPlayer = () => {
    const updatedPlayers = [...newMatch.players, playerData];
    setNewMatch({ ...newMatch, players: updatedPlayers });
    setPlayerData({
      number: '', name: '', missed_two: 0, made_two: 0, missed_three: 0, made_three: 0,
      missed_free: 0, made_free: 0, off_reb: 0, def_reb: 0, assists: 0, steals: 0,
      blocks: 0, turnovers: 0, fouls: 0, total_points: 0
    });
  };

  // Calculate statistics
  const calculateStats = (player) => {
    const twoPointRate = player.made_two / (player.missed_two + player.made_two) || 0;
    const threePointRate = player.made_three / (player.missed_three + player.made_three) || 0;
    const freeThrowRate = player.made_free / (player.missed_free + player.made_free) || 0;
    const eff = (player.made_two + player.made_three + player.made_free + player.off_reb + player.def_reb +
      player.assists + player.steals + player.blocks - (player.missed_two + player.missed_three +
      player.missed_free) - player.turnovers) || 0;
    return {
      twoPointRate: (twoPointRate * 100).toFixed(1),
      threePointRate: (threePointRate * 100).toFixed(1),
      freeThrowRate: (freeThrowRate * 100).toFixed(1),
      eff: eff.toFixed(1)
    };
  };

  return (
    <div className="App">
      <h1>男子籃球隊後臺管理</h1>

      <div>
        <h2>新增賽季</h2>
        <label>年份：</label>
        <input 
          type="text" 
          value={newSeason} 
          onChange={(e) => setNewSeason(e.target.value)} 
          placeholder="輸入年份" 
        />
        <button onClick={addSeason}>添加賽季</button>
      </div>

      <div>
        <h2>選擇賽季</h2>
        <label>賽季：</label>
        <select onChange={(e) => fetchMatches(e.target.value)} value={selectedSeason}>
          <option value="">選擇賽季</option>
          {seasons.map(season => (
            <option key={season.id} value={season.id}>{season.year}</option>
          ))}
        </select>
      </div>

      <div>
        <h2>新增比賽</h2>
        <label>比賽日期：</label>
        <input 
          type="text" 
          value={newMatch.date} 
          onChange={(e) => setNewMatch({ ...newMatch, date: e.target.value })} 
          placeholder="比賽日期" 
        />
        <label>對手隊伍：</label>
        <input 
          type="text" 
          value={newMatch.opponent} 
          onChange={(e) => setNewMatch({ ...newMatch, opponent: e.target.value })} 
          placeholder="對手隊伍" 
        />
        <button onClick={addMatch}>添加比賽</button>
      </div>

      <div>
        <h2>輸入球員數據</h2>
        <label>姓名：</label>
        <input type="text" value={playerData.name} onChange={(e) => setPlayerData({ ...playerData, name: e.target.value })} placeholder="姓名" />
        <label>背號：</label>
        <input type="number" value={playerData.number} onChange={(e) => setPlayerData({ ...playerData, number: e.target.value })} placeholder="背號" />
        <label>兩分不進球數：</label>
        <input type="number" value={playerData.missed_two} onChange={(e) => setPlayerData({ ...playerData, missed_two: parseInt(e.target.value) })} placeholder="兩分不進球數" />
        <label>兩分進球數：</label>
        <input type="number" value={playerData.made_two} onChange={(e) => setPlayerData({ ...playerData, made_two: parseInt(e.target.value) })} placeholder="兩分進球數" />
        <label>三分不進球數：</label>
        <input type="number" value={playerData.missed_three} onChange={(e) => setPlayerData({ ...playerData, missed_three: parseInt(e.target.value) })} placeholder="三分不進球數" />
        <label>三分進球數：</label>
        <input type="number" value={playerData.made_three} onChange={(e) => setPlayerData({ ...playerData, made_three: parseInt(e.target.value) })} placeholder="三分進球數" />
        <label>罰球不進球數：</label>
        <input type="number" value={playerData.missed_free} onChange={(e) => setPlayerData({ ...playerData, missed_free: parseInt(e.target.value) })} placeholder="罰球不進球數" />
        <label>罰球進球數：</label>
        <input type="number" value={playerData.made_free} onChange={(e) => setPlayerData({ ...playerData, made_free: parseInt(e.target.value) })} placeholder="罰球進球數" />
        <label>進攻籃板：</label>
        <input type="number" value={playerData.off_reb} onChange={(e) => setPlayerData({ ...playerData, off_reb: parseInt(e.target.value) })} placeholder="進攻籃板" />
        <label>防守籃板：</label>
        <input type="number" value={playerData.def_reb} onChange={(e) => setPlayerData({ ...playerData, def_reb: parseInt(e.target.value) })} placeholder="防守籃板" />
        <label>助攻數：</label>
        <input type="number" value={playerData.assists} onChange={(e) => setPlayerData({ ...playerData, assists: parseInt(e.target.value) })} placeholder="助攻數" />
        <label>抄截數：</label>
        <input type="number" value={playerData.steals} onChange={(e) => setPlayerData({ ...playerData, steals: parseInt(e.target.value) })} placeholder="抄截數" />
        <label>阻攻數：</label>
        <input type="number" value={playerData.blocks} onChange={(e) => setPlayerData({ ...playerData, blocks: parseInt(e.target.value) })} placeholder="阻攻數" />
        <label>失誤數：</label>
        <input type="number" value={playerData.turnovers} onChange={(e) => setPlayerData({ ...playerData, turnovers: parseInt(e.target.value) })} placeholder="失誤數" />
        <label>犯規數：</label>
        <input type="number" value={playerData.fouls} onChange={(e) => setPlayerData({ ...playerData, fouls: parseInt(e.target.value) })} placeholder="犯規數" />
        <label>總得分：</label>
        <input type="number" value={playerData.total_points} onChange={(e) => setPlayerData({ ...playerData, total_points: parseInt(e.target.value) })} placeholder="總得分" />
        <button onClick={addPlayer}>添加球員數據</button>
      </div>

      <div>
        <h2>球員統計</h2>
        {newMatch.players.map((player, index) => {
          const stats = calculateStats(player);
          return (
            <div key={index}>
              <p>{player.name} - 背號: {player.number}</p>
              <p>兩分命中率: {stats.twoPointRate}% | 三分命中率: {stats.threePointRate}% | 罰球命中率: {stats.freeThrowRate}% | EFF效率值: {stats.eff}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
