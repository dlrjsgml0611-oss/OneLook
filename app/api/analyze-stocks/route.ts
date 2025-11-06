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

    // OpenAI를 사용하여 투자 인사이트 분석
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `당신은 전문 투자 애널리스트입니다. 주어진 유튜브 자막 내용을 분석하고, 언급된 산업 트렌드, 기술, 비즈니스 모델 등을 바탕으로 투자 가치가 있을 만한 나스닥 상장 기업들을 추천해주세요.

다음 규칙을 따라주세요:
1. 자막에서 언급된 핵심 키워드와 트렌드를 파악
2. 해당 트렌드와 관련된 나스닥 상장 기업 3-5개 추천
3. 각 기업별로:
   - 기업명과 티커 심볼
   - 추천 이유 (자막 내용과의 연관성)
   - 투자 포인트 (성장 가능성, 시장 위치 등)
   - 주의사항 (리스크)
4. 전반적인 시장 전망과 투자 전략 제시
5. 전문적이면서도 이해하기 쉬운 언어로 작성

⚠️ 중요: 이것은 투자 참고 정보이며, 실제 투자는 본인의 판단과 책임 하에 이루어져야 함을 명시

출력 형식:
[투자 분석 리포트]

## 📊 자막 내용 요약
- 핵심 키워드와 트렌드

## 💰 추천 나스닥 기업

### 1. [기업명] (티커: XXX)
**추천 이유:**
- 자막 내용과의 연관성

**투자 포인트:**
- 성장 가능성
- 경쟁 우위

**주의사항:**
- 리스크 요인

### 2. [기업명] (티커: XXX)
...

## 🎯 투자 전략
- 전반적인 시장 전망
- 투자 시 고려사항

## ⚠️ 투자 유의사항
본 분석은 참고용 정보이며, 실제 투자 결정은 투자자 본인의 판단과 책임 하에 이루어져야 합니다.`,
        },
        {
          role: 'user',
          content: `다음은 유튜브 동영상의 자막입니다. 이 내용을 바탕으로 투자할 만한 나스닥 기업을 추천해주세요:\n\n${subtitles}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    })

    const stockAnalysis = completion.choices[0]?.message?.content || ''

    if (!stockAnalysis) {
      return NextResponse.json(
        { error: '투자 분석에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ stockAnalysis })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
