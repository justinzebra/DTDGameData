// src/App.js
import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore';
import './App.css';

function App() {
  const [seasons, setSeasons] = useState([]);
  const [newMatch, setNewMatch] = useState({
    season: '',
    date: '',
    opponent: '',
    players: []
  });
  const [playerData, setPlayerData] = useState({
    number: '', name: '', missed_two: 0, made_two: 0, missed_three: 0, made_three: 0,
    missed_free: 0, made_free: 0, off_reb: 0, def_reb: 0, assists: 0, steals: 0,
    blocks: 0, turnovers: 0, fouls: 0
  });
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [matchInfo, setMatchInfo] = useState(null);

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

  // Add a new match
  const addMatch = async () => {
    if (newMatch.season && newMatch.date && newMatch.opponent) {
      try {
        let seasonRef = seasons.find(season => season.year === newMatch.season);
        if (!seasonRef) {
          const newSeason = await addDoc(collection(db, 'seasons'), {
            year: newMatch.season,
            matches: []
          });
          seasonRef = { id: newSeason.id, year: newMatch.season, matches: [] };
          setSeasons([...seasons, seasonRef]);
        }
        const updatedMatches = [...(seasonRef.matches || []), newMatch];
        await updateDoc(doc(db, 'seasons', seasonRef.id), { matches: updatedMatches });
        setMatchInfo({ season: newMatch.season, date: newMatch.date, opponent: newMatch.opponent });
        setNewMatch({ season: '', date: '', opponent: '', players: [] });
        setFeedback('比賽已成功添加！');
        setShowForm(false);
      } catch (error) {
        setFeedback('無法添加比賽，請稍後再試。');
      }
    } else {
      setFeedback('請填寫所有必填欄位。');
    }
  };

  // Add player data to the current match
  const addPlayer = () => {
    const total_points = playerData.made_two * 2 + playerData.made_three * 3 + playerData.made_free;
    const updatedPlayers = [...newMatch.players, { ...playerData, total_points }];
    setNewMatch({ ...newMatch, players: updatedPlayers });
    setPlayerData({
      number: '', name: '', missed_two: 0, made_two: 0, missed_three: 0, made_three: 0,
      missed_free: 0, made_free: 0, off_reb: 0, def_reb: 0, assists: 0, steals: 0,
      blocks: 0, turnovers: 0, fouls: 0
    });
    setFeedback('球員數據已成功添加！');
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

      <button onClick={() => setShowForm(true)}>新增比賽</button>

      {feedback && <p className="feedback">{feedback}</p>}

      {showForm && (
        <div className="match-form">
          <h2>新增比賽數據</h2>
          <label>賽季：</label>
          <input 
            type="text" 
            value={newMatch.season} 
            onChange={(e) => setNewMatch({ ...newMatch, season: e.target.value })} 
            placeholder="輸入賽季" 
          />
          <label>比賽日期：</label>
          <input 
            type="text" 
            value={newMatch.date} 
            onChange={(e) => setNewMatch({ ...newMatch, date: e.target.value })} 
            placeholder="比賽日期" 
          />
          <label>對手：</label>
          <input 
            type="text" 
            value={newMatch.opponent} 
            onChange={(e) => setNewMatch({ ...newMatch, opponent: e.target.value })} 
            placeholder="對手隊伍" 
          />
          <button onClick={addMatch}>添加比賽</button>

          <h3>輸入球員數據</h3>
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
          <button onClick={addPlayer}>添加球員數據</button>
        </div>
      )}

      <h4>球員統計</h4>
      {matchInfo && (
        <div className="match-info">
          <h3>比賽資訊</h3>
          <p><strong>賽季：</strong> {matchInfo.season}</p>
          <p><strong>比賽日期：</strong> {matchInfo.date}</p>
          <p><strong>對手：</strong> {matchInfo.opponent}</p>
        </div>
      )}
      <table>
        <thead>
          <tr>
            <th>姓名</th>
            <th>背號</th>
            <th>兩分命中率</th>
            <th>三分命中率</th>
            <th>罰球命中率</th>
            <th>EFF效率值</th>
            <th>兩分不進球數</th>
            <th>兩分進球數</th>
            <th>三分不進球數</th>
            <th>三分進球數</th>
            <th>罰球不進球數</th>
            <th>罰球進球數</th>
            <th>進攻籃板</th>
            <th>防守籃板</th>
            <th>助攻數</th>
            <th>抄截數</th>
            <th>阻攻數</th>
            <th>失誤數</th>
            <th>犯規數</th>
            <th>總得分</th>
          </tr>
        </thead>
        <tbody>
          {newMatch.players.map((player, index) => {
            const stats = calculateStats(player);
            return (
              <tr key={index}>
                <td>{player.name}</td>
                <td>{player.number}</td>
                <td>{stats.twoPointRate}%</td>
                <td>{stats.threePointRate}%</td>
                <td>{stats.freeThrowRate}%</td>
                <td>{stats.eff}</td>
                <td>{player.missed_two}</td>
                <td>{player.made_two}</td>
                <td>{player.missed_three}</td>
                <td>{player.made_three}</td>
                <td>{player.missed_free}</td>
                <td>{player.made_free}</td>
                <td>{player.off_reb}</td>
                <td>{player.def_reb}</td>
                <td>{player.assists}</td>
                <td>{player.steals}</td>
                <td>{player.blocks}</td>
                <td>{player.turnovers}</td>
                <td>{player.fouls}</td>
                <td>{player.total_points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default App;
