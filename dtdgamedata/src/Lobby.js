// src/Lobby.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

function Lobby() {
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState('');
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const seasonCollection = collection(db, 'seasons');
        const seasonSnapshot = await getDocs(seasonCollection);
        const seasonList = seasonSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSeasons(seasonList);
      } catch (error) {
        console.error("Error fetching seasons: ", error);
      }
    };

    fetchSeasons();
  }, []);

  const handleSeasonChange = (e) => {
    const seasonId = e.target.value;
    setSelectedSeason(seasonId);
    if (seasonId) {
      const season = seasons.find(s => s.id === seasonId);
      setMatches(season ? season.matches : []);
      setSelectedMatch(null);
    }
  };

  const handleMatchClick = (match) => {
    setSelectedMatch(match);
  };

  const handleDeleteMatch = async () => {
    if (!selectedSeason || !selectedMatch) return;

    try {
      const seasonRef = doc(db, 'seasons', selectedSeason);
      const seasonData = seasons.find(season => season.id === selectedSeason);

      // 移除選中的比賽
      const updatedMatches = seasonData.matches.filter(match => match !== selectedMatch);
      
      // 更新賽季數據
      await updateDoc(seasonRef, { matches: updatedMatches });

      // 更新本地狀態
      setMatches(updatedMatches);
      setSelectedMatch(null);
      setSeasons(seasons.map(season => 
        season.id === selectedSeason ? { ...season, matches: updatedMatches } : season
      ));
    } catch (error) {
      console.error('Error deleting match:', error);
    }
  };

  return (
    <div>
      <h1>大廳</h1>
      <button onClick={() => navigate('/add-match')}>新增比賽</button>
      <div>
        <h2>查看數據</h2>
        <select onChange={handleSeasonChange} value={selectedSeason}>
          <option value="">選擇賽季</option>
          {seasons.map(season => (
            <option key={season.id} value={season.id}>{season.year}</option>
          ))}
        </select>
        {matches.length > 0 && (
          <ul>
            {matches.map((match, index) => (
              <li key={index} onClick={() => handleMatchClick(match)}>
                <strong>日期：</strong> {match.date}, <strong>對手：</strong> {match.opponent}
              </li>
            ))}
          </ul>
        )}
      </div>
      {selectedMatch && (
        <div>
          <h3>比賽詳細內容</h3>
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
              </tr>
            </thead>
            <tbody>
              {selectedMatch.players.map((player, index) => (
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
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={handleDeleteMatch}>刪除該筆資料</button>
        </div>
      )}
    </div>
  );
}

export default Lobby;
