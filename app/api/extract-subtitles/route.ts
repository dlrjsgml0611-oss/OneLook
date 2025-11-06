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

    // 자막 추출
    try {
      const transcriptArray = await YoutubeTranscript.fetchTranscript(videoId, {
        lang: 'ko',
      })

      // 자막 텍스트만 추출하여 합치기
      const subtitles = transcriptArray
        .map((item: any) => item.text)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()

      if (!subtitles) {
        return NextResponse.json(
          { error: '자막을 찾을 수 없습니다. 한국어 자막이 있는지 확인해주세요.' },
          { status: 404 }
        )
      }

      return NextResponse.json({ subtitles })
    } catch (error) {
      console.error('Transcript fetch error:', error)

      // 한국어 자막이 없는 경우 영어 자막 시도
      try {
        const transcriptArray = await YoutubeTranscript.fetchTranscript(videoId, {
          lang: 'en',
        })

        const subtitles = transcriptArray
          .map((item: any) => item.text)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim()

        if (!subtitles) {
          return NextResponse.json(
            { error: '자막을 찾을 수 없습니다.' },
            { status: 404 }
          )
        }

        return NextResponse.json({ subtitles })
      } catch (fallbackError) {
        return NextResponse.json(
          { error: '자막을 추출할 수 없습니다. 자막이 있는 동영상인지 확인해주세요.' },
          { status: 500 }
        )
      }
    }
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
