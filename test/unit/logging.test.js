import { writeFileSync, readFileSync } from 'fs'
import { spawnSync } from 'child_process'
import { resolve } from 'path'

const logs = [
  'global',
  'local',
  'ssh',
  'server1',
  'server2'
].reduce((obj, log) => {
  const logPath = `../fixtures/logs/${log}-log.log`.split('/')
  return { ...obj, [log]: resolve(__dirname, ...logPath) }
}, {})

const opts = { cwd: resolve(__dirname, '../fixtures') }
const fabulaBin = resolve(__dirname, '../../bin/fabula.js')
const spawnFabula = (...args) => spawnSync(fabulaBin, args, opts)

function extractLogs(stdout, stderr) {
  stdout = stdout.split(/\n/)
  stderr = stderr.split(/\n/)
  return {
    global: stdout,
    local: stdout.filter(line => line.match(/\[local\]/)),
    ssh: stdout.filter(line => line.match(/\[server\d\]/)),
    server1: stdout.filter(line => line.match(/\[server1\]/)),
    server2:  stdout.filter(line => line.match(/\[server2\]/)),
  }
}

describe('test logging', () => {
  test('all logs', async () => {
    await Promise.all(
      Object.keys(logs).map((log) => new Promise((resolve) => {
        writeFileSync(logs[log], '')
        resolve()
      }))
    )
    const { stdout, stderr } = spawnFabula('all', 'logging')
    const output = extractLogs(
      stdout.toString().trim(),
      stderr.toString().trim()
    )
    const compareLogs = (raw, msg) => {
      raw.split(/\n/).forEach((line, i) => {
        expect(msg[i]).toContain(line)
      })
    }
    for (const log in logs) { 
      compareLogs(readFileSync(logs[log]).toString().trim(), output[log])
    }
  })
})
