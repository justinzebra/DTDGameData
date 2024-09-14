// src/AddMatch.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore';

function AddMatch() {
  const [newMatch, setNewMatch] = useState({ season: '', date: '', opponent: '', players: [] });
  const [feedback, setFeedback] = useState('');
  const navigate = useNavigate();

  const handleAddMatch = async () => {
    if (!newMatch.season || !newMatch.date || !newMatch.opponent) {
      setFeedback('請填寫所有必填欄位。');
      return;
    }

    try {
      console.log('正在添加比賽...');

      // 獲取賽季數據
      const seasonCollection = collection(db, 'seasons');
      const seasonSnapshot = await getDocs(seasonCollection);
      const seasons = seasonSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      let seasonRef = seasons.find(season => season.year === newMatch.season);
      
      // 如果賽季不存在，則創建一個新的賽季
      if (!seasonRef) {
        const newSeason = await addDoc(seasonCollection, { year: newMatch.season, matches: [] });
        seasonRef = { id: newSeason.id, year: newMatch.season, matches: [] };
      }

      // 更新比賽資料
      const updatedMatches = [...seasonRef.matches, newMatch];
    //   await updateDoc(doc(db, 'seasons', seasonRef.id), { matches: updatedMatches });

      setFeedback('比賽已成功添加！');

      // 確保 navigate 調用是正確的，並觀察是否有打印輸出
      console.log('比賽添加成功，正在跳轉到添加球員數據頁面...');
      navigate('/add-player', { state: { match: newMatch, seasonId: seasonRef.id } });

    } catch (error) {
      console.error('添加比賽失敗：', error);
      setFeedback('無法添加比賽，請稍後再試。');
    }
  };

  return (
    <div>
      <h1>新增比賽</h1>
      {feedback && <p>{feedback}</p>}
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
      <button onClick={handleAddMatch}>添加比賽</button>
    </div>
  );
}

export default AddMatch;
