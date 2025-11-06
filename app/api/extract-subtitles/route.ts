import { NextRequest, NextResponse } from 'next/server'
import { YoutubeTranscript } from 'youtube-transcript'

export async function POST(request: NextRequest) {
  try {
    const { youtubeUrl } = await request.json()

    if (!youtubeUrl) {
      return NextResponse.json(
        { error: 'YouTube URL이 필요합니다.' },
        { status: 400 }
      )
    }

    // YouTube URL에서 비디오 ID 추출
    let videoId = ''
    try {
      const url = new URL(youtubeUrl)
      videoId = url.searchParams.get('v') || ''

      // 짧은 URL 형식 (youtu.be) 처리
      if (!videoId && url.hostname === 'youtu.be') {
        videoId = url.pathname.slice(1)
      }

      if (!videoId) {
        return NextResponse.json(
          { error: '유효한 YouTube URL이 아닙니다.' },
          { status: 400 }
        )
      }
    } catch (error) {
      return NextResponse.json(
        { error: '유효한 YouTube URL이 아닙니다.' },
        { status: 400 }
      )
    }

    // 자막 추출 - 여러 언어 시도
    const languagesToTry = ['ko', 'en', 'en-US', 'en-GB']
    let lastError: any = null

    for (const lang of languagesToTry) {
      try {
        console.log(`Trying to fetch transcript with lang: ${lang}`)
        const transcriptArray = await YoutubeTranscript.fetchTranscript(videoId, {
          lang: lang,
        })

        // 자막 텍스트만 추출하여 합치기
        const subtitles = transcriptArray
          .map((item: any) => item.text)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim()

        if (subtitles) {
          console.log(`Successfully fetched ${lang} transcript`)
          return NextResponse.json({ subtitles })
        }
      } catch (error) {
        console.error(`Failed to fetch ${lang} transcript:`, error)
        lastError = error
        // 다음 언어 시도
        continue
      }
    }

    // 모든 언어 시도 실패 - 언어 옵션 없이 기본 자막 시도
    try {
      console.log('Trying to fetch transcript without language option')
      const transcriptArray = await YoutubeTranscript.fetchTranscript(videoId)

      const subtitles = transcriptArray
        .map((item: any) => item.text)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()

      if (subtitles) {
        console.log('Successfully fetched default transcript')
        return NextResponse.json({ subtitles })
      }
    } catch (error) {
      console.error('Failed to fetch default transcript:', error)
      lastError = error
    }

    // 모든 시도 실패
    console.error('All transcript fetch attempts failed:', lastError)
    return NextResponse.json(
      {
        error: '자막을 추출할 수 없습니다. 자막이 있는 동영상인지 확인해주세요.',
        details: lastError instanceof Error ? lastError.message : String(lastError)
      },
      { status: 500 }
    )
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
