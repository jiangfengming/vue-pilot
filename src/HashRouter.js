import HashHistory from 'spa-history/HashHistory'
import Base from './Base'

export default class extends Base {
  constructor(args) {
    super(args)

    this._history = new HashHistory({
      beforeChange: this._beforeChange.bind(this),
      change: this._change.bind(this)
    })
  }
}
