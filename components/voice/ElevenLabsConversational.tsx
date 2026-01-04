'use client'

import { useState, useCallback } from 'react'
import { Conversation } from '@11labs/client'
import { Mic, MicOff, Loader2, PhoneOff, AlertCircle } from 'lucide-react'

const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || ''

interface ElevenLabsConversationalProps {
  metadata?: Record<string, any>
  onConversationEnd?: (result: any) => void
  onFieldExtracted?: (field: string, value: any) => void
  onError?: (error: Error) => void
  className?: string
}

export function ElevenLabsConversational({
  metadata = {},
  onConversationEnd,
  onError,
  className = '',
}: ElevenLabsConversationalProps) {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle')
  const [isMuted, setIsMuted] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [conversation, setConversation] = useState<Conversation | null>(null)

  const startConversation = useCallback(async () => {
    if (!AGENT_ID) {
      setErrorMessage('Voice agent not configured')
      setStatus('error')
      return
    }

    setStatus('connecting')
    setErrorMessage(null)

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true })

      // Get signed URL from our backend
      const response = await fetch('/api/voice/elevenlabs-connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: AGENT_ID, metadata }),
      })

      if (!response.ok) {
        throw new Error('Failed to get conversation URL')
      }

      const { signedUrl } = await response.json()

      // Start the conversation using ElevenLabs SDK
      const conv = await Conversation.startSession({
        signedUrl,
        onConnect: () => {
          setStatus('connected')
        },
        onDisconnect: () => {
          setStatus('idle')
          setConversation(null)
          onConversationEnd?.({})
        },
        onError: (error) => {
          console.error('Conversation error:', error)
          const message = typeof error === 'string' ? error : 'Connection error'
          setErrorMessage(message)
          setStatus('error')
          onError?.(new Error(message))
        },
        onModeChange: ({ mode }) => {
          // mode can be 'speaking', 'listening', etc.
          console.log('Mode:', mode)
        },
      })

      setConversation(conv)
    } catch (error) {
      console.error('Start error:', error)
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Failed to start')
      onError?.(error instanceof Error ? error : new Error('Unknown error'))
    }
  }, [metadata, onConversationEnd, onError])

  const endConversation = useCallback(async () => {
    if (conversation) {
      await conversation.endSession()
      setConversation(null)
    }
    setStatus('idle')
  }, [conversation])

  const toggleMute = useCallback(async () => {
    if (conversation) {
      if (isMuted) {
        await conversation.setVolume({ volume: 1 })
      } else {
        await conversation.setVolume({ volume: 0 })
      }
      setIsMuted(!isMuted)
    }
  }, [conversation, isMuted])

  return (
    <div className={className}>
      <div className="flex items-center gap-3">
        <button
          onClick={status === 'connected' ? endConversation : startConversation}
          disabled={status === 'connecting'}
          className={`
            flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all
            ${status === 'idle' ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : ''}
            ${status === 'connecting' ? 'bg-amber-100 text-amber-700 cursor-wait' : ''}
            ${status === 'connected' ? 'bg-emerald-500 text-white' : ''}
            ${status === 'error' ? 'bg-red-100 text-red-700 hover:bg-red-200' : ''}
          `}
        >
          {status === 'idle' && <><Mic className="w-5 h-5" /> Start Voice Assistant</>}
          {status === 'connecting' && <><Loader2 className="w-5 h-5 animate-spin" /> Connecting...</>}
          {status === 'connected' && <><PhoneOff className="w-5 h-5" /> End Conversation</>}
          {status === 'error' && <><Mic className="w-5 h-5" /> Retry</>}
        </button>

        {status === 'connected' && (
          <button
            onClick={toggleMute}
            className={`p-3 rounded-xl transition-all ${
              isMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        )}
      </div>

      {status === 'connected' && (
        <div className="mt-4 flex items-center gap-2 text-sm text-emerald-600">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span>Connected - speak now</span>
        </div>
      )}

      {errorMessage && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
          <p className="text-sm text-red-600">{errorMessage}</p>
        </div>
      )}
    </div>
  )
}

export default ElevenLabsConversational