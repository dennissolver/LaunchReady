import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY

  if (!ELEVENLABS_API_KEY) {
    console.error('Missing ELEVENLABS_API_KEY')
    return NextResponse.json(
      { error: true, message: 'ElevenLabs API key not configured' },
      { status: 500 }
    )
  }
  
  try {
    const { agentId, metadata } = await request.json()

    if (!agentId) {
      return NextResponse.json(
        { error: true, message: 'Agent ID required' },
        { status: 400 }
      )
    }

    // Get signed URL for WebSocket connection from ElevenLabs
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`,
      {
        method: 'GET',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
        },
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('ElevenLabs API error:', error)
      
      if (response.status === 404) {
        return NextResponse.json(
          { error: true, message: 'Voice agent not found. Please check agent configuration.' },
          { status: 404 }
        )
      }
      
      if (response.status === 401) {
        return NextResponse.json(
          { error: true, message: 'Invalid ElevenLabs API key' },
          { status: 401 }
        )
      }
      
      return NextResponse.json(
        { error: true, message: `ElevenLabs error: ${error}` },
        { status: 500 }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      signedUrl: data.signed_url,
    })
  } catch (error) {
    console.error('Voice connect error:', error)
    return NextResponse.json(
      { error: true, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
