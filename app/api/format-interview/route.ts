import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  try {
    const { subtitles } = await request.json()

    if (!subtitles) {
      return NextResponse.json(
        { error: '자막 데이터가 필요합니다.' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API 키가 설정되지 않았습니다.' },
        { status: 500 }
      )
    }

    // OpenAI 클라이언트 생성 (런타임에만)
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // OpenAI를 사용하여 인터뷰 형식으로 정리
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `당신은 전문 기자입니다. 주어진 유튜브 자막을 읽고 인터뷰 형식으로 정리해주세요.

다음 규칙을 따라주세요:
1. 질문과 답변을 명확하게 구분하여 "Q:"와 "A:" 형식으로 작성
2. 중요한 내용과 핵심 포인트를 중심으로 정리
3. 자연스러운 한국어로 다듬기
4. 불필요한 반복이나 잡음은 제거
5. 인터뷰의 맥락과 흐름을 유지
6. 전문적이고 읽기 쉬운 형식으로 작성
7. 제목을 "[인터뷰 정리]"로 시작

출력 형식:
[인터뷰 정리] 제목

Q: 질문 내용
A: 답변 내용

Q: 질문 내용
A: 답변 내용

...`,
        },
        {
          role: 'user',
          content: `다음은 유튜브 동영상의 자막입니다. 이를 인터뷰 형식으로 정리해주세요:\n\n${subtitles}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    })

    const formattedInterview = completion.choices[0]?.message?.content || ''

    if (!formattedInterview) {
      return NextResponse.json(
        { error: '인터뷰 정리에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ formattedInterview })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
