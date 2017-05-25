import HashHistory from 'spa-history/HashHistory'
import Base from './Base'

export default class extends Base {
  constructor(args) {
    super()

    this._history = new HashHistory({
      beforeChange: this._beforeChange,
      change: this._change
    })

    this._init(args)
  }
}
