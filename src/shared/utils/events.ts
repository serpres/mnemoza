type EventCallback = (data?: unknown) => void

class EventEmitter {
  private events: { [key: string]: EventCallback[] } = {}

  on(event: string, callback: EventCallback) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
  }

  off(event: string, callback: EventCallback) {
    if (!this.events[event]) return
    this.events[event] = this.events[event].filter(cb => cb !== callback)
  }

  emit(event: string, data?: unknown) {
    if (!this.events[event]) return
    this.events[event].forEach(callback => callback(data))
  }
}

export const eventBus = new EventEmitter()

export const EVENTS = {
  DECK_CREATED: 'deck:created',
  DECK_UPDATED: 'deck:updated',
  DECK_DELETED: 'deck:deleted',
  CARD_CREATED: 'card:created',
  CARD_UPDATED: 'card:updated',
  CARD_DELETED: 'card:deleted',
  DECK_STATS_CHANGED: 'deck:stats:changed',
} as const
