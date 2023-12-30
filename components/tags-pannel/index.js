// components/tags-pannel/index.js
Component({
  properties: {
    labels: Array,
    // 激活的标签ID
    activeLabelId: {
      type: String,
      value: '-1'
    },
    // 是否下拉弹窗
    showPopup: {
      type: Boolean,
      value: false
    }
  },
  data: {

  },
  methods: {
    /**
     * 切换弹窗显影状态
     */
    togglePopup() {
      this.setData({
        showPopup: !this.data.showPopup
      })
    },
    /**
     * 点击标签事件
     */
    onTagTap(event) {
      const activeLabelId = event.target.dataset.labelId
      this.setData({
        activeLabelId: activeLabelId
      })
      this.triggerEvent('tagtap', { 'activeLabelId': activeLabelId })
    }
  }
})
