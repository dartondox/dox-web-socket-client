interface TempFunction {
  name: string;
  args: any[];
}

interface Listener {
  event: string;
  callback: Function;
}

class App {
  private listeners: Listener[] = []

  private functions: TempFunction[]= []

  private maxRetries = 20

  private totalRetry = 0

  private url: string

  private roomId: string | undefined

  private websocket: WebSocket | undefined

  constructor(url: string) {
    this.url = url
    this.connect()
  }

  connect() {
    const functionsToRun = this.functions
    this.listeners = []
    this.functions = []

    this.websocket = new WebSocket(this.url)
    this.websocket.addEventListener('message', (msg) => {
      const res = JSON.parse(msg.data)
      const { event } = res
      const matchEvent = this.listeners.find((l) => l.event === event)
      if (matchEvent) {
        matchEvent.callback(res.message)
      }
      const allEvent = this.listeners.find((l) => l.event === '*')
      if (allEvent) {
        allEvent.callback(res)
      }
    })
    functionsToRun.forEach((fun) => {
      const funcToCall = this[fun.name as keyof App] as Function;
      funcToCall(...fun.args)
    })
  }

  retry() {
    if (this.totalRetry === this.maxRetries) {
      return
    }
    setTimeout(() => {
      this.totalRetry += 1
      this.connect()
    }, 5000)
  }

  onOpen(callback : () => {}) {
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

  onClose(callback: () => {}) {
    this.functions.push({ name: 'onClose', args: [callback] })
    this.websocket?.addEventListener('close', callback)
  }

  on(event : string, callback: (data : string) => {}) {
    this.functions.push({ name: 'on', args: [event, callback] })
    this.listeners.push({ event, callback })
  }

  emit(event:string, message: any) {
    if (!this.roomId) {
      console.warn('You need to join the room to emit message')
    }
    this.websocket?.send(JSON.stringify({ event, message }))
  }

  joinRoom(roomId: string) {
    this.roomId = roomId
    this.emit('joinRoom', roomId)
  }
}

declare global {
  interface Window {
    DoxWebSocket: (url: string) => App;
  }
}

const DoxWebSocket = (url: string) => {
  return new App(url);
}

window.DoxWebSocket = DoxWebSocket;

export default DoxWebSocket
