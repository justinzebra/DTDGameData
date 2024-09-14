// src/AddPlayer.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { updateDoc, doc, getDoc } from 'firebase/firestore'; // 引入 getDoc 來獲取現有數據
import './AddPlayer.css';

function AddPlayer() {
  const location = useLocation();
  const navigate = useNavigate();
  const [playerData, setPlayerData] = useState({
    number: '', name: '', missed_two: '', made_two: '', missed_three: '', made_three: '',
    missed_free: '', made_free: '', off_reb: '', def_reb: '', assists: '', steals: '',
    blocks: '', turnovers: '', fouls: ''
  });
  const [players, setPlayers] = useState([]);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!location.state || !location.state.match || !location.state.seasonId) {
      console.error('無法接收狀態，回到大廳。');
      navigate('/');
    } else {
      setPlayers(location.state.match.players || []);
      console.log('接收到的比賽數據:', location.state.match);
    }
  }, [location, navigate]);

  const handleAddPlayer = () => {
    const formatValue = (value) => (value === '' ? 0 : parseInt(value));
    const missed_two = formatValue(playerData.missed_two);
    const made_two = formatValue(playerData.made_two);
    const missed_three = formatValue(playerData.missed_three);
    const made_three = formatValue(playerData.made_three);
    const missed_free = formatValue(playerData.missed_free);
    const made_free = formatValue(playerData.made_free);
    const off_reb = formatValue(playerData.off_reb);
    const def_reb = formatValue(playerData.def_reb);
    const assists = formatValue(playerData.assists);
    const steals = formatValue(playerData.steals);
    const blocks = formatValue(playerData.blocks);
    const turnovers = formatValue(playerData.turnovers);
    const fouls = formatValue(playerData.fouls);

    const total_two_attempts = missed_two + made_two;
    const two_point_percentage = total_two_attempts > 0 ? (made_two / total_two_attempts) * 100 : 0;

    const total_three_attempts = missed_three + made_three;
    const three_point_percentage = total_three_attempts > 0 ? (made_three / total_three_attempts) * 100 : 0;

    const total_free_attempts = missed_free + made_free;
    const free_throw_percentage = total_free_attempts > 0 ? (made_free / total_free_attempts) * 100 : 0;

    const total_points = made_two * 2 + made_three * 3 + made_free;

    const newPlayer = {
      ...playerData,
      missed_two,
      made_two,
      missed_three,
      made_three,
      missed_free,
      made_free,
      off_reb,
      def_reb,
      assists,
      steals,
      blocks,
      turnovers,
      fouls,
      total_two_attempts,
      two_point_percentage,
      total_three_attempts,
      three_point_percentage,
      total_free_attempts,
      free_throw_percentage,
      total_points
    };

    setPlayers([...players, newPlayer]);
    setPlayerData({
      number: '', name: '', missed_two: '', made_two: '', missed_three: '', made_three: '',
      missed_free: '', made_free: '', off_reb: '', def_reb: '', assists: '', steals: '',
      blocks: '', turnovers: '', fouls: ''
    });
    setFeedback('球員數據已成功添加！');
  };

  const handleDeletePlayer = (index) => {
    const updatedPlayers = players.filter((_, i) => i !== index);
    setPlayers(updatedPlayers);
  };

  const handleSubmitPlayers = async () => {
    try {
      const match = { ...location.state.match, players };
      const seasonRef = doc(db, 'seasons', location.state.seasonId);

      // 先獲取現有賽季數據
      const seasonSnapshot = await getDoc(seasonRef);
      if (seasonSnapshot.exists()) {
        const seasonData = seasonSnapshot.data();
        const existingMatches = seasonData.matches || [];
        
        // 將新比賽數據追加到現有的比賽數組中
        const updatedMatches = [...existingMatches, match];

        // 更新賽季數據中的比賽數組
        await updateDoc(seasonRef, { matches: updatedMatches });
        setFeedback('所有數據已成功提交！');
        navigate('/');
      } else {
        setFeedback('未找到指定的賽季數據！');
      }
    } catch (error) {
      console.error('提交失敗：', error);
      setFeedback('提交失敗，請稍後再試。');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (/^\d*$/.test(value)) {
      setPlayerData({ ...playerData, [name]: value });
    }
  };

  return (
    <div>
      <h1>添加球員數據</h1>
      {feedback && <p className="feedback">{feedback}</p>}
      <div className="input-form">
        <label>姓名：</label>
        <input type="text" name="name" value={playerData.name} onChange={(e) => setPlayerData({ ...playerData, name: e.target.value })} placeholder="姓名" />
        <label>背號：</label>
        <input type="text" name="number" value={playerData.number} onChange={handleInputChange} placeholder="背號" />
        <label>兩分不進球數：</label>
        <input type="text" name="missed_two" value={playerData.missed_two} onChange={handleInputChange} placeholder="兩分不進球數" />
        <label>兩分進球數：</label>
        <input type="text" name="made_two" value={playerData.made_two} onChange={handleInputChange} placeholder="兩分進球數" />
        <label>三分不進球數：</label>
        <input type="text" name="missed_three" value={playerData.missed_three} onChange={handleInputChange} placeholder="三分不進球數" />
        <label>三分進球數：</label>
        <input type="text" name="made_three" value={playerData.made_three} onChange={handleInputChange} placeholder="三分進球數" />
        <label>罰球不進球數：</label>
        <input type="text" name="missed_free" value={playerData.missed_free} onChange={handleInputChange} placeholder="罰球不進球數" />
        <label>罰球進球數：</label>
        <input type="text" name="made_free" value={playerData.made_free} onChange={handleInputChange} placeholder="罰球進球數" />
        <label>進攻籃板：</label>
        <input type="text" name="off_reb" value={playerData.off_reb} onChange={handleInputChange} placeholder="進攻籃板" />
        <label>防守籃板：</label>
        <input type="text" name="def_reb" value={playerData.def_reb} onChange={handleInputChange} placeholder="防守籃板" />
        <label>助攻數：</label>
        <input type="text" name="assists" value={playerData.assists} onChange={handleInputChange} placeholder="助攻數" />
        <label>抄截數：</label>
        <input type="text" name="steals" value={playerData.steals} onChange={handleInputChange} placeholder="抄截數" />
        <label>阻攻數：</label>
        <input type="text" name="blocks" value={playerData.blocks} onChange={handleInputChange} placeholder="阻攻數" />
        <label>失誤數：</label>
        <input type="text" name="turnovers" value={playerData.turnovers} onChange={handleInputChange} placeholder="失誤數" />
        <label>犯規數：</label>
        <input type="text" name="fouls" value={playerData.fouls} onChange={handleInputChange} placeholder="犯規數" />
        <button onClick={handleAddPlayer}>添加球員數據</button>
      </div>

      <h4>球員統計表</h4>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>姓名</th>
              <th>背號</th>
              <th>兩分不進球數</th>
              <th>兩分進球數</th>
              <th>兩分命中率</th>
              <th>三分不進球數</th>
              <th>三分進球數</th>
              <th>三分命中率</th>
              <th>罰球不進球數</th>
              <th>罰球進球數</th>
              <th>罰球命中率</th>
              <th>進攻籃板</th>
              <th>防守籃板</th>
              <th>助攻數</th>
              <th>抄截數</th>
              <th>阻攻數</th>
              <th>失誤數</th>
              <th>犯規數</th>
              <th>總得分</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => (
              <tr key={index}>
                <td>{player.name}</td>
                <td>{player.number}</td>
                <td>{player.missed_two}</td>
                <td>{player.made_two}</td>
                <td>{player.two_point_percentage.toFixed(1)}%</td>
                <td>{player.missed_three}</td>
                <td>{player.made_three}</td>
                <td>{player.three_point_percentage.toFixed(1)}%</td>
                <td>{player.missed_free}</td>
                <td>{player.made_free}</td>
                <td>{player.free_throw_percentage.toFixed(1)}%</td>
                <td>{player.off_reb}</td>
                <td>{player.def_reb}</td>
                <td>{player.assists}</td>
                <td>{player.steals}</td>
                <td>{player.blocks}</td>
                <td>{player.turnovers}</td>
                <td>{player.fouls}</td>
                <td>{player.total_points}</td>
                <td>
                  <button onClick={() => handleDeletePlayer(index)}>刪除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button onClick={handleSubmitPlayers}>確認提交資料</button>
    </div>
  );
}

export default AddPlayer;
