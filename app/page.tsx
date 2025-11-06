'use client'

import { useState } from 'react'

type AnalysisMode = 'interview' | 'stock'

export default function Home() {
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [interviewResult, setInterviewResult] = useState('')
  const [stockResult, setStockResult] = useState('')
  const [mode, setMode] = useState<AnalysisMode>('interview')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setInterviewResult('')
    setStockResult('')

    try {
      // 1단계: 자막 추출
      const subtitleResponse = await fetch('/api/extract-subtitles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ youtubeUrl }),
      })

      if (!subtitleResponse.ok) {
        const errorData = await subtitleResponse.json()
        throw new Error(errorData.error || '자막 추출에 실패했습니다.')
      }

      const { subtitles } = await subtitleResponse.json()

      // 2단계: 선택한 모드에 따라 분석
      if (mode === 'interview') {
        const formatResponse = await fetch('/api/format-interview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ subtitles }),
        })

        if (!formatResponse.ok) {
          const errorData = await formatResponse.json()
          throw new Error(errorData.error || '인터뷰 정리에 실패했습니다.')
        }

        const { formattedInterview } = await formatResponse.json()
        setInterviewResult(formattedInterview)
      } else {
        const stockResponse = await fetch('/api/analyze-stocks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ subtitles }),
        })

        if (!stockResponse.ok) {
          const errorData = await stockResponse.json()
          throw new Error(errorData.error || '투자 분석에 실패했습니다.')
        }

        const { stockAnalysis } = await stockResponse.json()
        setStockResult(stockAnalysis)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h1>🎥 YouTube AI Analyzer</h1>
      <p className="subtitle">AI가 유튜브 자막을 분석하여 인터뷰 정리 또는 투자 인사이트를 제공합니다</p>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="youtube-url">YouTube URL</label>
            <input
              id="youtube-url"
              type="text"
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>분석 모드</label>
            <div className="mode-selector">
              <label className={`mode-option ${mode === 'interview' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="mode"
                  value="interview"
                  checked={mode === 'interview'}
                  onChange={(e) => setMode(e.target.value as AnalysisMode)}
                />
                <span className="mode-icon">📝</span>
                <span className="mode-text">
                  <strong>인터뷰 정리</strong>
                  <small>AI 기자가 인터뷰 형식으로 정리</small>
                </span>
              </label>

              <label className={`mode-option ${mode === 'stock' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="mode"
                  value="stock"
                  checked={mode === 'stock'}
                  onChange={(e) => setMode(e.target.value as AnalysisMode)}
                />
                <span className="mode-icon">📈</span>
                <span className="mode-text">
                  <strong>투자 분석</strong>
                  <small>나스닥 기업 추천 및 투자 인사이트</small>
                </span>
              </label>
            </div>
          </div>

          <button type="submit" className="button" disabled={loading}>
            {loading ? '처리 중...' : mode === 'interview' ? '인터뷰 정리하기' : '투자 분석하기'}
          </button>
        </form>

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p style={{ marginTop: '1rem' }}>
              {mode === 'interview'
                ? '자막을 추출하고 AI가 인터뷰를 정리하고 있습니다...'
                : '자막을 추출하고 AI가 투자 인사이트를 분석하고 있습니다...'}
            </p>
          </div>
        )}

        {error && (
          <div className="error">
            <strong>오류:</strong> {error}
          </div>
        )}

        {interviewResult && (
          <div className="result">
            <h2>📝 정리된 인터뷰</h2>
            <div className="result-content">
              {interviewResult}
            </div>
          </div>
        )}

        {stockResult && (
          <div className="result">
            <h2>📈 투자 분석 리포트</h2>
            <div className="result-content">
              {stockResult}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
