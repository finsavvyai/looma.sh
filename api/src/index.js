import { Hono } from 'hono'

const app = new Hono()

// NEW: Root route
app.get('/', (c) => {
  return c.text('🚗 Looma Edge Relay is running')
})

// NEW: Health route
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    relay: 'looma-edge',
    timestamp: Date.now()
  })
})

// NEW: Favicon placeholder
app.get('/favicon.ico', (c) => c.body(null, 204))

// Existing ping
app.get('/ping', (c) => {
  return c.json({
    status: 'ok',
    service: 'Looma Edge Relay'
  })
})

// Relay endpoint
app.post('/relay', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  return c.json({
    status: 'received',
    echo: body
  })
})

export default app