interface TempFunction {
  name: string
  args: any[]
}

interface Listener {
  event: string
  callback: Function
}

interface DoxWebSocketConfig {
  maxRetries: number
  retryAfter: number
}

class App {
  private listeners: Listener[] = []

  private functions: TempFunction[] = []

  private maxRetries = 20

  private totalRetry = 0

  private retryAfter = 5000

  private url: string

  private id?: string

  private roomId: string | undefined

  private websocket: WebSocket | undefined

  constructor(url: string, config?: DoxWebSocketConfig) {
    this.url = url
    if (config?.maxRetries) {
      this.maxRetries = config.maxRetries
    }
    if (config?.retryAfter) {
      this.retryAfter = config.retryAfter
    }
    this.connect()
  }

  connect() {
    const functionsToRun = this.functions
    this.listeners = []
    this.functions = []

    this.websocket = new WebSocket(this.url)
    this.websocket.addEventListener('message', (msg) => {
      const res = JSON.parse(msg.data)
      const { event, sender, message, room } = res
      const matchEvent = this.listeners.find((l) => l.event === event)
      if(event == 'connected') {
        this.id = message.id;
      }
      if (matchEvent) {
        matchEvent.callback(message, sender, room)
      }
      const allEvent = this.listeners.find((l) => l.event === '*')
      if (allEvent) {
        allEvent.callback(res)
      }
    })
    functionsToRun.forEach((fun) => {
      (this[fun.name as keyof App] as Function)(...fun.args)
    })
  }

  retry() {
    if (this.totalRetry === this.maxRetries) {
      return
    }
    setTimeout(() => {
      this.totalRetry += 1
      this.connect()
    }, this.retryAfter)
  }

  onOpen(callback: () => {}) {
    this.websocket?.addEventListener('open', callback)
  }

  onError(callback: () => {}) {
    const self = this
    this.functions.push({ name: 'onError', args: [callback] })
    this.websocket?.addEventListener('error', () => {
      callback()
      self.retry()
    })
  }

  onConnected(callback: () => {}) {
    this.functions.push({ name: 'onConnected', args: [callback] })
    this.listeners.push({ event: 'connected', callback })
  }

  onClose(callback: () => {}) {
    this.functions.push({ name: 'onClose', args: [callback] })
    this.websocket?.addEventListener('close', callback)
  }

  on(event: string, callback: (data: string) => {}) {
    this.functions.push({ name: 'on', args: [event, callback] })
    this.listeners.push({ event, callback })
  }

  emit(event: string, message: any) {
    this.websocket?.send(JSON.stringify({ event, message, room: this.roomId }))
  }

  joinRoom(roomId: string) {
    this.roomId = roomId
    this.emit('joinRoom', roomId)
  }
}

declare global {
  interface Window {
    DoxWebSocket: (url: string) => App
  }
}

const DoxWebSocket = (url: string, config? : DoxWebSocketConfig) => {
  return new App(url, config);
}

window.DoxWebSocket = DoxWebSocket

export { DoxWebSocketConfig }
export default DoxWebSocket
