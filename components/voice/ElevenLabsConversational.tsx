'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Mic, MicOff, Loader2, PhoneOff, Volume2, AlertCircle, X } from 'lucide-react'

// Agent ID from environment
const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || ''

interface ConversationMetadata {
  user_id?: string
  project_id?: string
  context?: string
}

interface ElevenLabsConversationalProps {
  metadata?: ConversationMetadata
  onConversationEnd?: (result: any) => void
  onFieldExtracted?: (field: string, value: any) => void
  onError?: (error: Error) => void
  className?: string
}

export function ElevenLabsConversational({
  metadata = {},
  onConversationEnd,
  onFieldExtracted,
  onError,
  className = '',
}: ElevenLabsConversationalProps) {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error' | 'permission_denied'>('idle')
  const [isMuted, setIsMuted] = useState(false)
  const [transcript, setTranscript] = useState<Array<{ role: string; text: string }>>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const conversationRef = useRef<WebSocket | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  const startConversation = useCallback(async () => {
    if (!AGENT_ID) {
      setErrorMessage('Voice agent not configured. Please check environment variables.')
      onError?.(new Error('Agent ID not configured'))
      setStatus('error')
      return
    }

    setStatus('connecting')
    setTranscript([])
    setErrorMessage(null)

    try {
      // First, explicitly request microphone permission
      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach(track => track.stop())
      } catch (micError) {
        console.error('Microphone permission denied:', micError)
        setStatus('permission_denied')
        setErrorMessage('Microphone access is required for voice conversations.')
        return
      }

      // Get signed URL from our backend
      const response = await fetch('/api/voice/elevenlabs-connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: AGENT_ID,
          metadata,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to get conversation URL')
      }

      const { signedUrl } = await response.json()

      // Connect via WebSocket
      const ws = new WebSocket(signedUrl)
      conversationRef.current = ws

      ws.onopen = () => {
        setStatus('connected')
        // Send initial metadata
        ws.send(JSON.stringify({
          type: 'conversation_initiation_client_data',
          custom_llm_extra_body: {
            metadata,
          },
        }))
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          switch (data.type) {
            case 'agent_response':
              setTranscript(prev => [...prev, { role: 'agent', text: data.text }])
              break
            case 'user_transcript':
              if (data.text) {
                setTranscript(prev => [...prev, { role: 'user', text: data.text }])
              }
              break
            case 'extracted_data':
              // Handle extracted fields from conversation
              if (data.fields && onFieldExtracted) {
                Object.entries(data.fields).forEach(([field, value]) => {
                  onFieldExtracted(field, value)
                })
              }
              break
            case 'conversation_ended':
              setStatus('idle')
              onConversationEnd?.(data)
              break
            case 'error':
              setStatus('error')
              setErrorMessage(data.message || 'An error occurred')
              onError?.(new Error(data.message))
              break
          }
        } catch (parseError) {
          console.error('Failed to parse message:', parseError)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setStatus('error')
        setErrorMessage('Connection error. Please check your internet and try again.')
        onError?.(new Error('WebSocket error'))
      }

      ws.onclose = (event) => {
        if (status === 'connected') {
          setStatus('idle')
        }
        if (event.code !== 1000 && event.code !== 1001) {
          console.warn('WebSocket closed unexpectedly:', event.code, event.reason)
        }
      }

    } catch (error) {
      console.error('Conversation start error:', error)
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Failed to start conversation')
      onError?.(error instanceof Error ? error : new Error('Unknown error'))
    }
  }, [metadata, onConversationEnd, onFieldExtracted, onError, status])

  const endConversation = useCallback(() => {
    if (conversationRef.current) {
      conversationRef.current.close()
      conversationRef.current = null
    }
    setStatus('idle')
  }, [])

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev)
  }, [])

  const retryPermission = useCallback(() => {
    setStatus('idle')
    setErrorMessage(null)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (conversationRef.current) {
        conversationRef.current.close()
      }
    }
  }, [])

  const statusColors = {
    idle: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
    connecting: 'bg-amber-100 text-amber-700',
    connected: 'bg-emerald-500 text-white',
    error: 'bg-red-100 text-red-700 hover:bg-red-200',
    permission_denied: 'bg-red-100 text-red-700',
  }

  // Permission denied state
  if (status === 'permission_denied') {
    return (
      <div className={`${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">Microphone Access Required</p>
              <p className="text-red-600 text-sm mt-1">
                {errorMessage || 'Please allow microphone access to use the voice assistant.'}
              </p>
              <div className="mt-3 space-y-1 text-sm text-red-700">
                <p><strong>Mobile:</strong> Settings → Site Settings → Microphone → Allow</p>
                <p><strong>Desktop:</strong> Click the lock icon in the address bar</p>
              </div>
              <button
                onClick={retryPermission}
                className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-3">
        {/* Main control button */}
        <button
          onClick={status === 'connected' ? endConversation : startConversation}
          disabled={status === 'connecting'}
          className={`
            flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all
            ${statusColors[status]}
            ${status === 'connecting' ? 'cursor-wait' : 'cursor-pointer'}
          `}
        >
          {status === 'idle' && (
            <>
              <Mic className="w-5 h-5" />
              <span>Start Voice Assistant</span>
            </>
          )}
          {status === 'connecting' && (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Connecting...</span>
            </>
          )}
          {status === 'connected' && (
            <>
              <PhoneOff className="w-5 h-5" />
              <span>End Conversation</span>
            </>
          )}
          {status === 'error' && (
            <>
              <Mic className="w-5 h-5" />
              <span>Retry Connection</span>
            </>
          )}
        </button>

        {/* Mute button when connected */}
        {status === 'connected' && (
          <button
            onClick={toggleMute}
            className={`p-3 rounded-xl transition-all ${
              isMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Status indicator */}
      {status === 'connected' && (
        <div className="mt-4 flex items-center gap-2 text-sm text-emerald-600">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span>Listening... speak now</span>
        </div>
      )}

      {/* Live transcript */}
      {transcript.length > 0 && (
        <div className="mt-4 max-h-60 overflow-y-auto space-y-2 text-sm">
          {transcript.slice(-6).map((msg, i) => (
            <div
              key={i}
              className={`p-2 rounded-lg ${
                msg.role === 'agent'
                  ? 'bg-violet-50 text-violet-900'
                  : 'bg-gray-50 text-gray-900'
              }`}
            >
              <span className="font-medium text-xs uppercase">
                {msg.role === 'agent' ? '🤖 LaunchReady' : '👤 You'}:
              </span>
              <p className="mt-1">{msg.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Error message */}
      {status === 'error' && errorMessage && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{errorMessage}</p>
        </div>
      )}
    </div>
  )
}

// Modal wrapper for voice assistant
export function VoiceAssistantModal({
  isOpen,
  onClose,
  metadata,
  onFieldExtracted,
}: {
  isOpen: boolean
  onClose: () => void
  metadata?: ConversationMetadata
  onFieldExtracted?: (field: string, value: any) => void
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">🎙️ Voice Assistant</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <ElevenLabsConversational
          metadata={metadata}
          onFieldExtracted={onFieldExtracted}
          onConversationEnd={onClose}
        />
      </div>
    </div>
  )
}

export default ElevenLabsConversational
