// Minimal static server for the stalefish demo
// Usage: node stalefish/example/server.mjs [port]

import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const projectRoot = path.resolve(path.join(path.dirname(url.fileURLToPath(import.meta.url)), '..', '..'))
const port = Number(process.env.PORT) || Number(process.argv[2]) || 5174

const mime = (filePath) => {
  const ext = path.extname(filePath).toLowerCase()
  switch (ext) {
    case '.html': return 'text/html; charset=utf-8'
    case '.mjs':
    case '.js': return 'text/javascript; charset=utf-8'
    case '.css': return 'text/css; charset=utf-8'
    case '.json': return 'application/json; charset=utf-8'
    case '.svg': return 'image/svg+xml; charset=utf-8'
    case '.ico': return 'image/x-icon'
    case '.png': return 'image/png'
    case '.jpg':
    case '.jpeg': return 'image/jpeg'
    case '.gif': return 'image/gif'
    default: return 'application/octet-stream'
  }
}

function safeJoin (base, requestedPath) {
  const fullPath = path.join(base, requestedPath)
  const normalized = path.normalize(fullPath)
  if (!normalized.startsWith(base)) return null
  return normalized
}

const server = http.createServer((req, res) => {
  try {
    const u = new URL(req.url, `http://${req.headers.host}`)
    let pathname = u.pathname

    // Redirect root to the demo index
    if (pathname === '/' || pathname === '') {
      pathname = '/stalefish/example/index.html'
    }

    // Map to project root files
    const fsPath = safeJoin(projectRoot, pathname.replace(/^\//, ''))
    if (!fsPath) {
      res.writeHead(400)
      res.end('Bad request')
      return
    }

    fs.stat(fsPath, (err, stat) => {
      if (err) {
        res.writeHead(404)
        res.end('Not found')
        return
      }
      const fileToSend = stat.isDirectory() ? path.join(fsPath, 'index.html') : fsPath
      fs.readFile(fileToSend, (err2, data) => {
        if (err2) {
          res.writeHead(500)
          res.end('Error reading file')
          return
        }
        res.writeHead(200, { 'Content-Type': mime(fileToSend), 'Cache-Control': 'no-cache' })
        res.end(data)
      })
    })
  } catch (e) {
    res.writeHead(500)
    res.end('Server error')
  }
})

server.listen(port, () => {
  console.log(`stalefish demo server running at http://localhost:${port}/`)
  console.log('Root redirects to /stalefish/example/')
})
