import PathHistory from 'spa-history/PathHistory'
import Base from './Base'

export default class extends Base {
  constructor(args) {
    super()

    this._history = new PathHistory({
      base: args.base,
      beforeChange: this._beforeChange,
      change: this._change
    })

    this._init(args)
  }
}
