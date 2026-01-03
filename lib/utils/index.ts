import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency
export function formatCurrency(amount: number, currency = 'AUD'): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format date
export function formatDate(date: string | Date, format: 'short' | 'long' | 'relative' = 'short'): string {
  const d = new Date(date)
  
  if (format === 'relative') {
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }
  
  return d.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: format === 'long' ? 'long' : 'short',
    year: 'numeric',
  })
}

// Calculate days remaining
export function daysRemaining(targetDate: string | Date): number {
  const target = new Date(targetDate)
  const now = new Date()
  return Math.floor((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

// Get urgency level based on days remaining
export function getUrgencyLevel(days: number): 'critical' | 'urgent' | 'warning' | 'ok' | 'expired' {
  if (days < 0) return 'expired'
  if (days < 30) return 'critical'
  if (days < 60) return 'urgent'
  if (days < 90) return 'warning'
  return 'ok'
}

// Get status color classes
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    registered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    secured: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    not_started: 'bg-red-100 text-red-800 border-red-200',
    available: 'bg-red-100 text-red-800 border-red-200',
    urgent: 'bg-red-100 text-red-800 border-red-200',
    expired: 'bg-gray-100 text-gray-600 border-gray-200',
    na: 'bg-gray-100 text-gray-500 border-gray-200',
  }
  return colors[status] || colors.na
}

// Truncate text
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

// Parse numbers from speech (e.g., "2 million" -> 2000000)
export function parseSpokenNumber(text: string): number | null {
  const normalized = text.toLowerCase().trim()
  
  // Handle millions
  const millionMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(million|mil|m)/i)
  if (millionMatch) {
    return parseFloat(millionMatch[1]) * 1000000
  }
  
  // Handle thousands
  const thousandMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(thousand|k|grand)/i)
  if (thousandMatch) {
    return parseFloat(thousandMatch[1]) * 1000
  }
  
  // Handle plain numbers
  const plainMatch = normalized.match(/(\d+(?:,\d{3})*(?:\.\d+)?)/i)
  if (plainMatch) {
    return parseFloat(plainMatch[1].replace(/,/g, ''))
  }
  
  return null
}

// Generate a hash for file integrity
export async function generateFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Validate email
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Generate random ID
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}
