import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, Send, MessageSquare, Loader2 } from 'lucide-react'
import { io as socketIO, Socket } from 'socket.io-client'
import UserAvatar from '../components/UserAvatar'
import TierBadge from '../components/TierBadge'
import EmptyState from '../components/EmptyState'
import useStore from '../store/useStore'
import { useConversations, useMessages, useSendMessage } from '../hooks/useApi'

// Add missing auth token function
const getToken = () => localStorage.getItem('mm_token')

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'

// ─── Helpers ──────────────────────────────────────────

function formatTime(dateStr: string | Date) {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)

  if (minutes < 1) return 'Now'
  if (minutes < 60) return `${minutes}m`
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h`
  if (minutes < 43200) return `${Math.floor(minutes / 1440)}d`

  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getDMRoomId(a: string, b: string) {
  return `dm:${[a, b].sort().join(':')}`
}

// ─── Conversation Item ────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ConversationItem({ conversation, isActive, onSelect }: any) {
  const { otherUser, lastMessage, unreadCount } = conversation

  return (
    <button
      onClick={() => onSelect(conversation)}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--mm-bg-hover)] ${
        isActive ? 'bg-[var(--mm-bg-hover)] border-l-2 border-[var(--mm-accent-green)]' : ''
      }`}
    >
      <UserAvatar
        src={otherUser?.avatar}
        name={otherUser?.displayName || otherUser?.username}
        tier={otherUser?.tier}
        size="md"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="body font-semibold text-[var(--mm-text-primary)] truncate">
            {otherUser?.displayName || otherUser?.username || 'Unknown'}
          </span>
          <span className="caption text-[var(--mm-text-muted)] shrink-0">
            {lastMessage?.createdAt ? formatTime(lastMessage.createdAt) : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="caption text-[var(--mm-text-muted)] truncate">
            {lastMessage?.isOwn && <span className="text-[var(--mm-text-secondary)]">You: </span>}
            {lastMessage?.text || (lastMessage?.gifUrl ? '📷 GIF' : '')}
          </span>
          {unreadCount > 0 && (
            <span className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-[var(--mm-accent-green)] text-[10px] font-bold text-[var(--mm-bg-primary)]">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

// ─── Message Bubble ───────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MessageBubble({ message, isOwn }: any) {
  // Format full timestamp for hover tooltip
  const fullTime = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2 group`}>
      <div
        className={`max-w-[75%] px-3 py-2 rounded-[var(--radius-md)] ${
          isOwn
            ? 'bg-[var(--mm-accent-green)]/10 border border-[var(--mm-accent-green)]/20 rounded-br-sm'
            : 'bg-[var(--mm-bg-tertiary)] border border-[var(--border-subtle)] rounded-bl-sm'
        }`}
      >
        {message.type === 'gif' && message.gifUrl ? (
          <img src={message.gifUrl} alt="GIF" className="max-w-full rounded-[var(--radius-sm)]" loading="lazy" />
        ) : (
          <p className="body text-[var(--mm-text-primary)] break-words whitespace-pre-wrap">{message.text}</p>
        )}
        <div className={`flex items-center gap-1 mt-0.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span
            className="text-[10px] text-[var(--mm-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity"
            title={fullTime}
          >
            {message.createdAt ? formatTime(message.createdAt) : ''}
          </span>
          {isOwn && message.isRead && (
            <span className="text-[10px] text-[var(--mm-accent-blue)] opacity-0 group-hover:opacity-100 transition-opacity">
              ✓✓
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Typing Indicator ─────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TypingIndicator({ users, currentUserId }: any) {
  if (users.length === 0) return null
  const otherTyping = users.filter((u: string) => u !== currentUserId)
  if (otherTyping.length === 0) return null

  return (
    <div className="flex items-center gap-2 px-4 py-1.5">
      <div className="flex items-center gap-0.5">
        <span
          className="w-1.5 h-1.5 rounded-full bg-[var(--mm-text-muted)] animate-bounce"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full bg-[var(--mm-text-muted)] animate-bounce"
          style={{ animationDelay: '150ms' }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full bg-[var(--mm-text-muted)] animate-bounce"
          style={{ animationDelay: '300ms' }}
        />
      </div>
      <span className="caption text-[var(--mm-text-muted)] italic">Typing...</span>
    </div>
  )
}

// ─── Main MessagesPage ────────────────────────────────

export default function MessagesPage() {
  const navigate = useNavigate()
  const user = useStore((s) => s.user)
  const isMobile = useStore((s) => s.isMobile)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [conversations, setConversations] = useState<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [activeConv, setActiveConv] = useState<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [messages, setMessages] = useState<any[]>([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [showMobileThread, setShowMobileThread] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<any>(null)
  const lastTypingEmitRef = useRef(0)
  const socketRef = useRef<Socket | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // ─── Socket connection ────────────────────────────
  const { data: conversationsData = [], isLoading: convsLoading, refetch: fetchConversations } = useConversations()
  const { data: messagesData = { messages: [] }, isLoading: msgsLoading } = useMessages(activeConv?.otherUserId)
  const sendMessageMutation = useSendMessage()

  useEffect(() => {
    const token = getToken()
    if (!token) return

    const wsUrl = API.replace('http', 'ws')
    const socket = socketIO(wsUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', () => {
      console.log('[DM] Socket connected')
    })

    // Listen for incoming DM messages
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socket.on('DM_MESSAGE', ({ message, roomId, fromUserId }: any) => {
      if (activeConv && roomId === getDMRoomId(user?.id || '', activeConv.otherUserId)) {
        setMessages((prev) => [...prev, { ...message, user: message.user || { id: fromUserId } }])
      }
      // Refresh conversations list
      fetchConversations()
    })

    // Listen for typing indicators
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socket.on('DM_TYPING', ({ roomId, userId }: any) => {
      if (!activeConv) return
      const convRoomId = getDMRoomId(user?.id || '', activeConv.otherUserId)
      if (roomId === convRoomId && userId !== user?.id) {
        setTypingUsers((prev) => (prev.includes(userId) ? prev : [...prev, userId]))
      }
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socket.on('DM_STOP_TYPING', ({ roomId, userId }: any) => {
      setTypingUsers((prev) => prev.filter((u) => u !== userId))
    })

    socketRef.current = socket

    // Join global room for notifications
    socket.emit('JOIN_ROOM', { roomId: 'global' })

    return () => {
      if (socketRef.current) {
        if (activeConv) {
          socketRef.current.emit('LEAVE_DM', {
            roomId: getDMRoomId(user?.id || '', activeConv.otherUserId),
          })
        }
        socketRef.current.disconnect()
      }
    }
  }, [user?.id, activeConv, fetchConversations])

  // Join/leave DM room when active conversation changes
  useEffect(() => {
    if (!socketRef.current || !user?.id) return

    if (activeConv?.otherUserId) {
      const roomId = getDMRoomId(user.id, activeConv.otherUserId)
      socketRef.current.emit('JOIN_DM', { roomId })
    }

    return () => {
      if (activeConv?.otherUserId && socketRef.current?.connected) {
        socketRef.current.emit('LEAVE_DM', {
          roomId: getDMRoomId(user.id, activeConv.otherUserId),
        })
      }
    }
  }, [activeConv?.otherUserId, user?.id])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ─── Use React Query hooks ────────────────────────

  // Sync conversations from React Query
  useEffect(() => {
    if (conversationsData) {
      setConversations(conversationsData as any[])
    }
    setLoading(convsLoading)
  }, [conversationsData, convsLoading])

  // Sync messages from React Query
  useEffect(() => {
    if (messagesData && (messagesData as any).messages) {
      setMessages((messagesData as any).messages)
    }
    setLoadingMessages(msgsLoading)
  }, [messagesData, msgsLoading])

  // ─── Select conversation ──────────────────────────

  const handleSelectConversation = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (conv: any) => {
      setActiveConv(conv)
      setMessages([])
      setTypingUsers([])
      if (isMobile) setShowMobileThread(true)

      // Mark messages as read via API
      const token = getToken()
      fetch(`${API}/api/messages/read/${conv.otherUserId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {})

      // Update unread count locally
      setConversations((prev) => prev.map((c) => (c.roomId === conv.roomId ? { ...c, unreadCount: 0 } : c)))
    },
    [isMobile],
  )

  // ─── Send message ─────────────────────────────────

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || !activeConv || sending) return

    setSending(true)
    const text = inputText.trim()
    setInputText('')

    try {
      const message = await sendMessageMutation.mutateAsync({
        userId: activeConv.otherUserId,
        text,
      })

      // Optimistically add to messages
      setMessages((prev) => [...prev, message])
    } catch (err) {
      // Restore input on error
      setInputText(text)
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }, [inputText, activeConv, sending, sendMessageMutation])

  // ─── Typing indicator logic ───────────────────────

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value)

    if (!socketRef.current?.connected || !activeConv?.otherUserId || !user?.id) return

    const roomId = getDMRoomId(user.id, activeConv.otherUserId)
    const now = Date.now()

    // Throttle typing events to once per second
    if (now - lastTypingEmitRef.current > 1000) {
      socketRef.current.emit('DM_TYPING', { roomId })
      lastTypingEmitRef.current = now
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)

    // Set timeout to stop typing after 2s of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('DM_STOP_TYPING', { roomId })
    }, 2000)
  }

  // Handle enter to send
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // ─── Back to conversation list (mobile) ───────────

  const handleBackToList = () => {
    setShowMobileThread(false)
  }

  // ─── Filter conversations ─────────────────────────

  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery) return true
    const name = (c.otherUser?.displayName || c.otherUser?.username || '').toLowerCase()
    return name.includes(searchQuery.toLowerCase())
  })

  // ─── Render ───────────────────────────────────────

  // Show conversation list if: desktop always, or mobile when thread isn't open
  const showList = !isMobile || (isMobile && !showMobileThread)
  const showThread = !isMobile || (isMobile && showMobileThread)

  return (
    <div className="h-[calc(100vh-64px-48px-56px)] flex">
      {/* ─── Left Panel: Conversation List ─────────────── */}
      {showList && (
        <div
          className={`flex flex-col border-r border-[var(--border-subtle)] ${
            isMobile ? 'w-full' : 'w-[360px] shrink-0'
          }`}
        >
          {/* Header */}
          <div className="px-4 py-4 border-b border-[var(--border-subtle)]">
            <h2 className="heading-2 text-[var(--mm-text-primary)]">Messages</h2>
          </div>

          {/* Search */}
          <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mm-text-muted)]" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-md)] body text-[var(--mm-text-primary)] placeholder:text-[var(--mm-text-muted)] border border-[var(--border-subtle)] focus:outline-none focus:border-[var(--border-focus)] transition-colors"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={20} className="animate-spin text-[var(--mm-text-muted)]" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="px-4 py-12">
                <EmptyState
                  title="No messages yet"
                  description={
                    searchQuery
                      ? 'No conversations match your search'
                      : 'Start a conversation with someone from the leaderboard or their profile'
                  }
                />
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <ConversationItem
                  key={conv.roomId}
                  conversation={conv}
                  isActive={activeConv?.roomId === conv.roomId}
                  onSelect={handleSelectConversation}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* ─── Right Panel: Message Thread ──────────────── */}
      {showThread && (
        <div className="flex-1 flex flex-col min-w-0">
          {activeConv ? (
            <>
              {/* Thread Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--mm-bg-secondary)]">
                {isMobile && (
                  <button
                    onClick={handleBackToList}
                    className="p-1 rounded-[var(--radius-sm)] hover:bg-[var(--mm-bg-hover)] text-[var(--mm-text-secondary)] transition-colors"
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft size={20} />
                  </button>
                )}
                <UserAvatar
                  src={activeConv.otherUser?.avatar}
                  name={activeConv.otherUser?.displayName || activeConv.otherUser?.username}
                  tier={activeConv.otherUser?.tier}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="body font-semibold text-[var(--mm-text-primary)] truncate">
                      {activeConv.otherUser?.displayName || activeConv.otherUser?.username}
                    </span>
                    {activeConv.otherUser?.tier && <TierBadge tier={activeConv.otherUser.tier} size="sm" />}
                    {activeConv.otherUser?.isPro && (
                      <span
                        className="caption px-1.5 py-0.5 rounded-[var(--radius-sm)] text-[var(--mm-accent-purple)] border border-[var(--border-pro)] font-medium"
                        style={{ fontSize: '10px' }}
                      >
                        PRO
                      </span>
                    )}
                  </div>
                  <span className="caption text-[var(--mm-text-muted)]">
                    @{activeConv.otherUser?.username || 'unknown'}
                  </span>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto px-4 py-4">
                {loadingMessages ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 size={20} className="animate-spin text-[var(--mm-text-muted)]" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageSquare size={36} className="text-[var(--mm-text-muted)] mb-3" />
                    <p className="body text-[var(--mm-text-secondary)]">
                      Start a conversation with{' '}
                      <span className="text-[var(--mm-text-primary)] font-semibold">
                        {activeConv.otherUser?.displayName || activeConv.otherUser?.username}
                      </span>
                    </p>
                    <p className="caption text-[var(--mm-text-muted)] mt-1">
                      Messages are end-to-end encrypted (no one else can read them)
                    </p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => (
                      <MessageBubble key={msg.id} message={msg} isOwn={msg.userId === user?.id} />
                    ))}
                    <TypingIndicator users={typingUsers} currentUserId={user?.id} />
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input Area */}
              <div className="px-4 py-3 border-t border-[var(--border-subtle)] bg-[var(--mm-bg-secondary)]">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Type a message..."
                    value={inputText}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    disabled={sending}
                    maxLength={1000}
                    className="flex-1 px-4 py-2.5 bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-md)] body text-[var(--mm-text-primary)] placeholder:text-[var(--mm-text-muted)] border border-[var(--border-subtle)] focus:outline-none focus:border-[var(--border-focus)] transition-colors disabled:opacity-50"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputText.trim() || sending}
                    className="p-2.5 rounded-[var(--radius-md)] bg-[var(--mm-accent-green)] text-[var(--mm-bg-primary)] hover:bg-[var(--mm-accent-green-dim)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Send message"
                  >
                    {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            // No conversation selected
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center px-8">
                <MessageSquare size={48} className="text-[var(--mm-text-muted)] mx-auto mb-4" />
                <h3 className="heading-3 text-[var(--mm-text-primary)] mb-2">Your Messages</h3>
                <p className="body text-[var(--mm-text-secondary)] max-w-sm">
                  Select a conversation from the left or visit a user's profile to send them a message
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
