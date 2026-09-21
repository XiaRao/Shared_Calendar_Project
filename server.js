import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// dist 目录（与 server.js 同级）
const DIST_DIR = path.join(__dirname, 'dist')
const PORT = Number(process.env.PORT || process.env.DEPLOY_RUN_PORT || 5000)
const HOST = '0.0.0.0'

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  return MIME_TYPES[ext] || 'application/octet-stream'
}

function sendFile(res, filePath, statusCode = 200) {
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
      res.end('Not Found')
      return
    }

    const mimeType = getMimeType(filePath)
    res.writeHead(statusCode, {
      'Content-Type': mimeType,
      'Content-Length': stats.size,
      'Cache-Control': filePath.endsWith('.html') ? 'no-cache' : 'public, max-age=31536000, immutable',
    })

    const stream = fs.createReadStream(filePath)
    stream.pipe(res)
    stream.on('error', () => {
      res.destroy()
    })
  })
}

const server = http.createServer((req, res) => {
  // 健康检查
  if (req.url === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('ok')
    return
  }

  let urlPath = decodeURIComponent(req.url.split('?')[0])

  // 安全：防止路径遍历
  if (urlPath.includes('..')) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Bad Request')
    return
  }

  let filePath = path.join(DIST_DIR, urlPath)

  // 如果路径以 / 结尾，返回 index.html
  if (urlPath.endsWith('/')) {
    filePath = path.join(filePath, 'index.html')
  }

  // 检查文件是否存在
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // SPA 回退：返回 index.html
      const indexPath = path.join(DIST_DIR, 'index.html')
      sendFile(res, indexPath)
      return
    }
    sendFile(res, filePath)
  })
})

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`)
  console.log(`Serving files from: ${DIST_DIR}`)
})

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})
