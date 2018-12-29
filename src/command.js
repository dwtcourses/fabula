
export default class Command {
  constructor(cmd, line, env) {
    this.cmd = { ...cmd }
    this.name = this.cmd.name
    this.params = {}
    this._env = env
    this.argv = line.split(/\s+/)
    this.local = this.argv[0] === 'local'
    this.source = [line]
    this.firstLine = true
  }
  get env() {
    if (this.local) {
      return {
        ...this.settings.env.local,
        ...this._env
      }
    } else {
      return {
        ...this.settings.env.ssh,
        ...this._env
      }
    }
  }
  handleLine(line) {
    if (!this.cmd.line) {
      if (this.firstLine) {
        this.firstLine = false
      }
      return false
    }
    const continueCommand = this.cmd.line.call(this, line)
    if (!this.firstLine && continueCommand) {
      this.source.push(line)
    }
    if (this.firstLine) {
      this.firstLine = false
    }
    return continueCommand
  }
  run(conn) {
    return this.cmd.command.call(this, conn)
  }
}
