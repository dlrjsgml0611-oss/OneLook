'use client'

import { useState } from 'react'

export default function Home() {
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult('')

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

      // 2단계: AI로 인터뷰 형식으로 정리
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
      setResult(formattedInterview)
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h1>🎥 YouTube Interview Formatter</h1>
      <p className="subtitle">AI 기자가 유튜브 인터뷰 자막을 인터뷰 형식으로 정리해드립니다</p>

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

          <button type="submit" className="button" disabled={loading}>
            {loading ? '처리 중...' : '인터뷰 정리하기'}
          </button>
        </form>

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p style={{ marginTop: '1rem' }}>자막을 추출하고 AI가 인터뷰를 정리하고 있습니다...</p>
          </div>
        )}

        {error && (
          <div className="error">
            <strong>오류:</strong> {error}
          </div>
        )}

        {result && (
          <div className="result">
            <h2>정리된 인터뷰</h2>
            <div className="result-content">
              {result}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
