const http = require('http')

const server = http.createServer((req, res) => {
  if (req.url === '/api/test' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ message: 'HTTP server hoạt động!', timestamp: new Date().toISOString() }))
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Not found' }))
  }
})

const port = 3003
server.listen(port, () => {
  console.log(`🚀 HTTP server chạy trên http://localhost:${port}`)
  console.log('📊 API endpoints:')
  console.log('  GET  /api/test')
})