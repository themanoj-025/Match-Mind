/**
 * Store Tests — MatchMind
 *
 * Tests for the Zustand store, especially the chat message cap
 * implemented in Phase 1.6 to prevent unbounded memory growth.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import useStore from './useStore'

describe('useStore — Chat Message Cap', () => {
  beforeEach(() => {
    // Reset store before each test
    useStore.setState({
      chatMessages: {},
    })
  })

  it('adds chat messages to a room', () => {
    const message = {
      id: 'msg-1',
      roomId: 'room:test',
      userId: 'user-1',
      text: 'Hello',
      type: 'text' as const,
      createdAt: new Date().toISOString(),
    }

    useStore.getState().addChatMessage('room:test', message)

    const messages = useStore.getState().chatMessages['room:test']
    expect(messages).toHaveLength(1)
    expect(messages[0].text).toBe('Hello')
  })

  it('cap never exceeds 500 messages per room (FIFO eviction)', () => {
    const roomId = 'room:test'

    // Push 1000 messages
    for (let i = 0; i < 1000; i++) {
      useStore.getState().addChatMessage(roomId, {
        id: `msg-${i}`,
        roomId,
        userId: 'user-1',
        text: `Message ${i}`,
        type: 'text' as const,
        createdAt: new Date(i).toISOString(),
      })
    }

    const messages = useStore.getState().chatMessages[roomId]
    // Must never exceed 500
    expect(messages.length).toBeLessThanOrEqual(500)
    // Should have exactly 500
    expect(messages.length).toBe(500)

    // Oldest messages should be evicted (FIFO)
    // Message 0 should be gone, message 999 should exist
    const ids = messages.map((m: { id: string }) => m.id)
    expect(ids).not.toContain('msg-0')
    expect(ids).toContain('msg-999')

    // First message in the array should be msg-500 (0-indexed: 500th message)
    expect(ids[0]).toBe('msg-500')
  })

  it('handles multiple rooms independently', () => {
    const roomA = 'room:a'
    const roomB = 'room:b'

    // Fill room A to cap
    for (let i = 0; i < 500; i++) {
      useStore.getState().addChatMessage(roomA, {
        id: `a-msg-${i}`,
        roomId: roomA,
        userId: 'user-1',
        text: `Room A message ${i}`,
        type: 'text' as const,
        createdAt: new Date(i).toISOString(),
      })
    }

    // Add a few messages to room B
    for (let i = 0; i < 10; i++) {
      useStore.getState().addChatMessage(roomB, {
        id: `b-msg-${i}`,
        roomId: roomB,
        userId: 'user-1',
        text: `Room B message ${i}`,
        type: 'text' as const,
        createdAt: new Date(i).toISOString(),
      })
    }

    expect(useStore.getState().chatMessages[roomA]).toHaveLength(500)
    expect(useStore.getState().chatMessages[roomB]).toHaveLength(10)

    // Room B should NOT be affected by Room A's cap
    const bIds = useStore.getState().chatMessages[roomB].map((m: { id: string }) => m.id)
    expect(bIds).toContain('b-msg-0')
  })

  it('evicts oldest messages first when cap is reached', () => {
    const roomId = 'room:test'

    // Fill to 500
    for (let i = 0; i < 500; i++) {
      useStore.getState().addChatMessage(roomId, {
        id: `msg-${i}`,
        roomId,
        userId: 'user-1',
        text: `Message ${i}`,
        type: 'text' as const,
        createdAt: new Date(i).toISOString(),
      })
    }

    // Push 10 more — old messages should be evicted
    for (let i = 500; i < 510; i++) {
      useStore.getState().addChatMessage(roomId, {
        id: `msg-${i}`,
        roomId,
        userId: 'user-1',
        text: `Message ${i}`,
        type: 'text' as const,
        createdAt: new Date(i).toISOString(),
      })
    }

    const messages = useStore.getState().chatMessages[roomId]
    expect(messages).toHaveLength(500)

    // msg-0 through msg-9 should be evicted
    const ids = messages.map((m: { id: string }) => m.id)
    expect(ids[0]).toBe('msg-10')
    expect(ids[499]).toBe('msg-509')
  })
})
