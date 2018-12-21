import { append, echo } from '../ssh'

export default {
  match(line) {
    if (['append', 'echo'].includes(this.argv[0])) {
      return line.trim().match(
        new RegExp(`^${this.argv[0]}\\s+(.+?):$`)
      )
    }
  },
  line(line) {
    if (this.firstLine) {
      this.params.filePath = this.match[1]
      this.params.fileContents = []
    } else if (!/^\s+/.test(line)) {
      return true
    } else {
      this.params.fileContents.push(line)
    }
  },
  command() {
    const match = this.params.fileContents[0].match(/^\s+/)
    const indentation = match ? match[0].length : 0
    const dedented = this.params.fileContents.map(line => line.slice(indentation))
    return ({ append, echo })[this.argv[0]]({
      filePath: this.params.filePath,
      fileContents: dedented.join('\n')
    })
  }
}
