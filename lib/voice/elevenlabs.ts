// ElevenLabs API Client for LaunchReady

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1'

export interface VoiceSettings {
  stability: number       // 0-1, higher = more consistent
  similarity_boost: number // 0-1, higher = more similar to original voice
  style?: number          // 0-1, style exaggeration
  use_speaker_boost?: boolean
}

export interface ElevenLabsConfig {
  apiKey: string
  voiceId: string
  modelId?: string
  settings?: VoiceSettings
}

// Default voice settings optimized for assistant
export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  stability: 0.5,
  similarity_boost: 0.75,
  style: 0.3,
  use_speaker_boost: true,
}

// Recommended voices for assistant
export const RECOMMENDED_VOICES = {
  rachel: '21m00Tcm4TlvDq8ikWAM',    // Warm, professional female
  charlie: 'IKne3meq5aSn9XLyUdCD',   // Natural Australian male
  bella: 'EXAVITQu4vr4xnSDxMaL',     // Soft, conversational female
  adam: 'pNInz6obpgDQGcFmaJgB',      // Deep, narrative male
}

// Generate speech from text using ElevenLabs API
export async function textToSpeech(
  text: string,
  config: ElevenLabsConfig
): Promise<ArrayBuffer> {
  const response = await fetch(
    `${ELEVENLABS_API_URL}/text-to-speech/${config.voiceId}`,
    {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': config.apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: config.modelId || 'eleven_monolingual_v1',
        voice_settings: config.settings || DEFAULT_VOICE_SETTINGS,
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`ElevenLabs API error: ${response.status} - ${error}`)
  }

  return response.arrayBuffer()
}

// Get signed URL for conversational AI WebSocket
export async function getConversationSignedUrl(
  agentId: string,
  apiKey: string
): Promise<string> {
  const response = await fetch(
    `${ELEVENLABS_API_URL}/convai/conversation/get-signed-url?agent_id=${agentId}`,
    {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
      },
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get signed URL: ${response.status} - ${error}`)
  }

  const data = await response.json()
  return data.signed_url
}

// Check API key validity
export async function checkApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/user`, {
      headers: { 'xi-api-key': apiKey },
    })
    return response.ok
  } catch {
    return false
  }
}

// Get subscription/quota info
export async function getSubscription(apiKey: string) {
  const response = await fetch(`${ELEVENLABS_API_URL}/user/subscription`, {
    headers: { 'xi-api-key': apiKey },
  })

  if (!response.ok) {
    throw new Error('Failed to get subscription info')
  }

  return response.json()
}
