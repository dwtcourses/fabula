import { append, echo } from '../ssh'

export default {
  match(line) {
    const argv = [...this.argv]
    if (argv[0] === 'local') {
      this.op = `${argv.shift()}Local`
      this.local = true
    } else {
      this.op = argv[0]
    }
    if (['append', 'echo'].includes(argv[0])) {
      return line.trim().match(
        new RegExp(`^${argv[0]}\\s+(.+?):$`)
      )
    }
  },
  line(line) {
    if (this.firstLine) {
      this.params.filePath = this.match[1]
      this.params.fileContents = []
      return true
    } else if (!/^\s+/.test(line)) {
      return false
    } else {
      this.params.fileContents.push(line)
      return true
    }
  },
  command() {
    const match = this.params.fileContents[0].match(/^\s+/)
    const indentation = match ? match[0].length : 0
    const dedented = this.params.fileContents.map(line => line.slice(indentation))
    if (this.local) {
      return ({ appendLocal, echoLocal })[this.op]({
        filePath: this.params.filePath,
        fileContents: dedented.join('\n')
      })
    } else {
      return ({ append, echo })[this.op]({
        filePath: this.params.filePath,
        fileContents: dedented.join('\n')
      })
    }
  }
}
