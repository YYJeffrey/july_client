// components/hole-item/index.js
Component({
  externalClasses: ['hole-item-class'],
  properties: {
    hole: Object
  },
  data: {

  },
  methods: {
    /**
     * 跳转树洞详情页
     */
    gotoHoleDetail() {
      wx.navigateTo({
        url: `/pages/hole-detail/index?holeId=${this.data.hole.id}`
      })
    }
  }
})
