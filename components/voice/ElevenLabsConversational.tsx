'use client'

import { useState, useCallback, useRef } from 'react'
import { Conversation } from '@11labs/client'
import { Mic, MicOff, Loader2, PhoneOff, AlertCircle, CheckCircle2 } from 'lucide-react'

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
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'saving' | 'saved' | 'error'>('idle')
  const [isMuted, setIsMuted] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [transcript, setTranscript] = useState<string[]>([])
  const transcriptRef = useRef<string[]>([])

  // Save conversation results to our API
  const saveConversationResults = useCallback(async (conversationTranscript: string[]) => {
    const projectId = metadata?.project_id
    if (!projectId) {
      console.log('No project ID, skipping save')
      setStatus('idle')
      return
    }

    if (conversationTranscript.length === 0) {
      console.log('No transcript, skipping save')
      setStatus('idle')
      return
    }

    setStatus('saving')

    try {
      const response = await fetch('/api/voice/save-discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          transcript: conversationTranscript.join('\n'),
          metadata: {
            agent_id: AGENT_ID,
            timestamp: new Date().toISOString(),
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save discovery results')
      }

      const result = await response.json()
      console.log('Discovery saved:', result)
      setStatus('saved')
      
      // Redirect to project page after short delay
      setTimeout(() => {
        window.location.href = `/dashboard/projects/${projectId}`
      }, 2000)

    } catch (error) {
      console.error('Save error:', error)
      setErrorMessage('Failed to save results. Please try again.')
      setStatus('error')
    }
  }, [metadata])

  const startConversation = useCallback(async () => {
    if (!AGENT_ID) {
      setErrorMessage('Voice agent not configured. Please set NEXT_PUBLIC_ELEVENLABS_AGENT_ID.')
      setStatus('error')
      return
    }

    setStatus('connecting')
    setErrorMessage(null)
    setTranscript([])
    transcriptRef.current = []

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
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to connect to voice service')
      }

      const { signedUrl } = await response.json()

      // Start the conversation using ElevenLabs SDK
      const conv = await Conversation.startSession({
        signedUrl,
        onConnect: () => {
          setStatus('connected')
        },
        onDisconnect: () => {
          // Save results when conversation ends
          const currentTranscript = transcriptRef.current
          if (currentTranscript.length > 0) {
            saveConversationResults(currentTranscript)
          } else {
            setStatus('idle')
          }
          setConversation(null)
          onConversationEnd?.({ transcript: currentTranscript })
        },
        onError: (error) => {
          console.error('Conversation error:', error)
          const message = typeof error === 'string' ? error : 'Connection error'
          setErrorMessage(message)
          setStatus('error')
          onError?.(new Error(message))
        },
        onModeChange: ({ mode }) => {
          console.log('Mode:', mode)
        },
        onMessage: (message: any) => {
          // Capture transcript as conversation progresses
          const source = message.source || message.role
          const text = message.message || message.content || ''
          
          if ((source === 'user' || source === 'agent' || source === 'assistant') && text) {
            const speaker = source === 'user' ? 'You' : 'Sarah'
            const newLine = `${speaker}: ${text}`
            transcriptRef.current = [...transcriptRef.current, newLine]
            setTranscript(prev => [...prev, newLine])
          }
        },
      })

      setConversation(conv)
    } catch (error) {
      console.error('Start error:', error)
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Failed to start voice assistant')
      onError?.(error instanceof Error ? error : new Error('Unknown error'))
    }
  }, [metadata, onConversationEnd, onError, saveConversationResults])

  const endConversation = useCallback(async () => {
    if (conversation) {
      await conversation.endSession()
      setConversation(null)
    }
    // Save will happen in onDisconnect callback
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
          disabled={status === 'connecting' || status === 'saving' || status === 'saved'}
          className={`
            flex items-center gap-2 px-6 py-4 rounded-xl font-medium transition-all text-lg
            ${status === 'idle' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white' : ''}
            ${status === 'connecting' ? 'bg-amber-100 text-amber-700 cursor-wait' : ''}
            ${status === 'connected' ? 'bg-red-500 hover:bg-red-600 text-white' : ''}
            ${status === 'saving' ? 'bg-blue-100 text-blue-700 cursor-wait' : ''}
            ${status === 'saved' ? 'bg-emerald-100 text-emerald-700' : ''}
            ${status === 'error' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : ''}
          `}
        >
          {status === 'idle' && <><Mic className="w-5 h-5" /> Start Voice Assistant</>}
          {status === 'connecting' && <><Loader2 className="w-5 h-5 animate-spin" /> Connecting...</>}
          {status === 'connected' && <><PhoneOff className="w-5 h-5" /> End Conversation</>}
          {status === 'saving' && <><Loader2 className="w-5 h-5 animate-spin" /> Saving results...</>}
          {status === 'saved' && <><CheckCircle2 className="w-5 h-5" /> Saved! Redirecting...</>}
          {status === 'error' && <><Mic className="w-5 h-5" /> Try Again</>}
        </button>

        {status === 'connected' && (
          <button
            onClick={toggleMute}
            className={`p-4 rounded-xl transition-all ${
              isMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        )}
      </div>

      {status === 'connected' && (
        <div className="mt-4">
          <div className="flex items-center gap-2 text-sm text-emerald-600 mb-4">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span>Connected - Sarah is listening</span>
          </div>
          
          {/* Live transcript */}
          {transcript.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl max-h-48 overflow-y-auto">
              <p className="text-xs text-gray-500 mb-2 font-medium">Conversation:</p>
              {transcript.slice(-6).map((line, i) => (
                <p key={i} className={`text-sm mb-1 ${
                  line.startsWith('Sarah:') ? 'text-violet-700' : 'text-gray-700'
                }`}>
                  {line}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {status === 'saved' && (
        <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <p className="text-sm text-emerald-700 font-medium">
              Discovery complete! Your IP checklist has been updated.
            </p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-700 font-medium">Something went wrong</p>
            <p className="text-sm text-red-600">{errorMessage}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ElevenLabsConversational
