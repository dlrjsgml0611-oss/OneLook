import { NextRequest, NextResponse } from 'next/server'
import { YoutubeTranscript } from 'youtube-transcript'
// @ts-ignore - No type definitions available
import { getSubtitles } from 'youtube-captions-scraper'
import { Innertube } from 'youtubei.js'

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

    console.log(`Extracting subtitles for video ID: ${videoId}`)

    // 방법 1: youtube-transcript 라이브러리 시도
    const languagesToTry = ['ko', 'en', 'en-US', 'en-GB', 'ja', 'zh', 'es', 'fr', 'de']

    for (const lang of languagesToTry) {
      try {
        console.log(`Method 1 (youtube-transcript): Trying lang ${lang}`)
        const transcriptArray = await YoutubeTranscript.fetchTranscript(videoId, {
          lang: lang,
        })

        const subtitles = transcriptArray
          .map((item: any) => item.text)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim()

        if (subtitles) {
          console.log(`✓ Success with youtube-transcript (${lang})`)
          return NextResponse.json({ subtitles, method: 'youtube-transcript', language: lang })
        }
      } catch (error) {
        console.log(`✗ Failed youtube-transcript (${lang})`)
      }
    }

    // 방법 2: youtube-transcript (언어 지정 없이)
    try {
      console.log('Method 1b (youtube-transcript): Trying without language')
      const transcriptArray = await YoutubeTranscript.fetchTranscript(videoId)
      const subtitles = transcriptArray
        .map((item: any) => item.text)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()

      if (subtitles) {
        console.log('✓ Success with youtube-transcript (default)')
        return NextResponse.json({ subtitles, method: 'youtube-transcript', language: 'default' })
      }
    } catch (error) {
      console.log('✗ Failed youtube-transcript (default)')
    }

    // 방법 3: youtube-captions-scraper 시도
    for (const lang of languagesToTry) {
      try {
        console.log(`Method 2 (youtube-captions-scraper): Trying lang ${lang}`)
        const captions = await getSubtitles({
          videoID: videoId,
          lang: lang,
        })

        if (captions && captions.length > 0) {
          const subtitles = captions
            .map((item: any) => item.text)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim()

          if (subtitles) {
            console.log(`✓ Success with youtube-captions-scraper (${lang})`)
            return NextResponse.json({ subtitles, method: 'youtube-captions-scraper', language: lang })
          }
        }
      } catch (error) {
        console.log(`✗ Failed youtube-captions-scraper (${lang})`)
      }
    }

    // 방법 4: youtubei.js 시도
    try {
      console.log('Method 3 (youtubei.js): Trying')
      const youtube = await Innertube.create()
      const info = await youtube.getInfo(videoId)

      const transcriptData = await info.getTranscript()

      if (transcriptData?.transcript?.content?.body) {
        const segments = transcriptData.transcript.content.body.initial_segments
        if (segments && segments.length > 0) {
          const subtitles = segments
            .map((segment: any) => segment.snippet?.text || '')
            .filter((text: string) => text.trim())
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim()

          if (subtitles) {
            console.log('✓ Success with youtubei.js')
            return NextResponse.json({ subtitles, method: 'youtubei.js' })
          }
        }
      }
    } catch (error) {
      console.log('✗ Failed youtubei.js:', error)
    }

    // 모든 방법 실패
    console.error('All subtitle extraction methods failed')
    return NextResponse.json(
      {
        error: '자막을 추출할 수 없습니다. 다음을 확인해주세요:\n1. 영상에 자막이 있는지 확인\n2. 영상이 비공개가 아닌지 확인\n3. URL이 올바른지 확인',
      },
      { status: 500 }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
