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
    // @ts-ignore
    useStore
      .getState()
      .addChatMessage('room1', {
        id: '1',
        user: { id: '1', name: 'test', avatar: null },
        text: 'Hello',
        createdAt: '10:00',
      })
    let state = useStore.getState()
    expect(state.chatMessages['room1']?.length).toBe(1)
    expect(state.chatMessages['room1']?.[0].text).toBe('Hello')

    // Add another
    // @ts-ignore
    useStore
      .getState()
      .addChatMessage('room1', {
        id: '2',
        user: { id: '1', name: 'test', avatar: null },
        text: 'World',
        createdAt: '10:01',
      })
    state = useStore.getState()
    expect(state.chatMessages['room1']?.length).toBe(2)
    expect(state.chatMessages['room1']?.map((m: any) => m.id)).toEqual(['1', '2'])
  })

  it('cap never exceeds 500 messages per room (FIFO eviction)', () => {
    const roomId = 'room:test'

    // Push 1000 messages
    for (let i = 0; i < 1000; i++) {
      // @ts-ignore
      useStore.getState().addChatMessage(roomId, {
        id: `msg-${i}`,
        user: { id: '1', name: 'test', avatar: null },
        text: `Message ${i}`,
        type: 'text' as any,
        createdAt: new Date(i).toISOString(),
      })
    }

    const messages = useStore.getState().chatMessages[roomId]
    // Must never exceed 500
    expect(messages?.length).toBeLessThanOrEqual(500)
    // Should have exactly 500
    expect(messages?.length).toBe(500)

    // Oldest messages should be evicted (FIFO)
    // Message 0 should be gone, message 999 should exist
    const ids = messages?.map((m: any) => m.id)
    expect(ids).not.toContain('msg-0')
    expect(ids).toContain('msg-999')

    // First message in the array should be msg-500 (0-indexed: 500th message)
    expect(ids?.[0]).toBe('msg-500')
  })

  it('handles multiple rooms independently', () => {
    const roomA = 'room:a'
    const roomB = 'room:b'

    // Fill room A to cap
    for (let i = 0; i < 500; i++) {
      // @ts-ignore
      useStore.getState().addChatMessage(roomA, {
        id: `a-msg-${i}`,
        user: { id: '1', name: 'test', avatar: null },
        text: `Room A message ${i}`,
        type: 'text' as any,
        createdAt: new Date(i).toISOString(),
      })
    }

    // Add a few messages to room B
    for (let i = 0; i < 10; i++) {
      // @ts-ignore
      useStore.getState().addChatMessage(roomB, {
        id: `b-msg-${i}`,
        user: { id: '1', name: 'test', avatar: null },
        text: `Room B message ${i}`,
        type: 'text' as any,
        createdAt: new Date(i).toISOString(),
      })
    }

    expect(useStore.getState().chatMessages[roomA]).toHaveLength(500)
    expect(useStore.getState().chatMessages[roomB]).toHaveLength(10)

    // Room B should NOT be affected by Room A's cap
    const bIds = useStore.getState().chatMessages[roomB]?.map((m: any) => m.id)
    expect(bIds).toContain('b-msg-0')
  })

  it('evicts old messages over 500 limit', () => {
    for (let i = 0; i < 505; i++) {
      // @ts-ignore
      useStore
        .getState()
        .addChatMessage('room-limit', {
          id: String(i),
          user: { id: '1', name: 'test', avatar: null },
          text: `Msg ${i}`,
          createdAt: '10:00',
        })
    }

    const state = useStore.getState()
    expect(state.chatMessages['room-limit']?.length).toBe(500)
    // The first 5 should be evicted
    expect(state.chatMessages['room-limit']?.map((m: any) => m.id)).not.toContain('0')
    expect(state.chatMessages['room-limit']?.map((m: any) => m.id)).toContain('504')
  })
})
