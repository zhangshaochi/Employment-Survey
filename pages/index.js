import React, { useState } from 'react';

const HomePage = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const askQuestion = async () => {
    if (!question.trim()) {
      alert('请先输入问题');
      return;
    }

    setLoading(true);
    setAnswer('深度思考中…请耐心等待3-10s');

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: question }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setAnswer(data.answer);
      } else {
        setAnswer(`错误: ${data.answer || '请求失败'}`);
      }
    } catch (error) {
      setAnswer('当前网络不佳，喝口水休息下，过会儿再试试');
      console.error('请求错误:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', 
      padding: '40px', 
      maxWidth: '600px', 
      margin: 'auto' 
    }}>
      <h2>就业专项调查小助手</h2>
      
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="输入你的问题…"
        style={{ 
          width: '100%', 
          height: '80px', 
          fontSize: '16px', 
          padding: '8px', 
          boxSizing: 'border-box',
          marginBottom: '10px'
        }}
        disabled={loading}
      />
      
      <button 
        onClick={askQuestion}
        disabled={loading}
        style={{ 
          padding: '8px 16px', 
          fontSize: '16px',
          backgroundColor: loading ? '#ccc' : '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? '处理中...' : '提问'}
      </button>
      
      {answer && (
        <div style={{ 
          marginTop: '20px', 
          whiteSpace: 'pre-wrap', 
          background: '#f5f5f5', 
          padding: '12px', 
          borderRadius: '4px',
          minHeight: '50px'
        }}>
          {answer}
        </div>
      )}
    </div>
  );
};

export default HomePage;
