import wxutil from "../miniprogram_npm/@yyjeffrey/wxutil/index"
const defaultPage = 1
const defaultSize = 16

class Paging {
  url
  params
  page
  size
  hasMore = true
  locker = false
  accumulator = []

  constructor(url, params = {}, page = defaultPage, size = defaultSize) {
    this.url = url
    this.page = page
    this.size = size
    this.params = params
  }

  /**
   * 获取更多分页数据
   */
  async getMore() {
    if (!this.hasMore) {
      return
    }
    if (!this._getLocker()) {
      return
    }
    const data = await this._getData()
    this._releaseLocker()
    return data
  }

  /**
   * 请求获取数据
   */
  async _getData() {
    const params = this._getMergeParams()
    const res = await wxutil.request.get(this.url, params)

    if (!res || res.code !== 200) {
      return null
    }
    if (res.data.length < this.size) {
      this.hasMore = false
    }

    this.accumulator = this.accumulator.concat(res.data)
    this.page++

    return {
      hasMore: this.hasMore,
      items: res.data,
      accumulator: this.accumulator
    }
  }

  /**
   * 获取合并参数
   */
  _getMergeParams() {
    this.params = Object.assign(this.params, { page: this.page, size: this.size })
    return this.params
  }

  /**
   * 获取请求锁
   */
  _getLocker() {
    if (this.locker) {
      return false
    }
    this.locker = true
    return true
  }

  /**
   * 释放请求锁
   */
  _releaseLocker() {
    this.locker = false
  }
}

export {
  Paging
}
