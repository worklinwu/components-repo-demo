<template>
  <el-select
    ref="selector"
    v-model="_value"
    v-loading="loading"
    class="c-select"
    :filterable="filterable"
    :placeholder="placeholder"
    :remote-method="handleRemoteMethod"
    :value-key="valueKey"
    clearable
    remote
    v-bind="$attrs"
    @focus="handleFocus">
    <slot v-bind="{ options: remoteOptions, selector: $refs.selector }">
      <el-option
        v-for="(item, index) in remoteOptions"
        :key="index"
        :label="item[labelKey]"
        :value="item[valueKey]"
      />
    </slot>
  </el-select>
</template>

<script type="text/babel">
export default {
  name: 'CSelect',
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    action: {
      type: Function
    },
    getValueAction: {
      type: Function
    },
    condition: {
      type: [Object, Array],
      default() {
        return {}
      }
    },
    options: {
      type: Array,
      default: null
    },
    value: {
      type: [String, Object, Number, Array]
    },
    labelKey: {
      type: String,
      default: 'name'
    },
    valueKey: {
      type: String,
      default: 'id'
    },
    filterable: {
      type: Boolean,
      default: true
    },
    // 自动获取数据, 否则是在 focus 事件时候获取数据
    autoFetch: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: '请选择'
    }
  },

  data() {
    return {
      loading: false,
      selectedOptionData: null,
      remoteOptions: [],
      pageInfo: {
        currentPage: 1,
        totalRecord: 0,
        totalPage: 1,
        pageSize: 10
      }
    }
  },

  computed: {
    selector() {
      return this.$refs.selector
    },
    _value: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('change', val)
      }
    }
  },

  watch: {
    value: {
      handler(val) {
        // 监听值改变, 同步获取选中的选项的完整对象
        if (val) {
          if (!this.selector.multiple) {
            this.selectedOptionData = this.getOptionData(val)
          } else {
            this.selectedOptionData = []
            val.forEach(value => {
              const data = this.getOptionData(value)
              if (data) {
                this.selectedOptionData.push(data)
              }
            })
          }
          return this.selectedOptionData
        }
      }
    },
    // 外部直接传入 options
    options: {
      handler(val) {
        if (val) {
          this.pageInfo.currentPage = 1
          this.remoteOptions = val
        }
      },
      immediate: true
    },
    condition: {
      handler(val, oldVal) {
        this.fetchData()
      },
      deep: true
    },
    // 和 selectedOptionData 效果一样, 两个方法都可以
    remoteOptions: {
      handler() {
        if (!this.selector.multiple) {
          // 如果默认值没有初始化, 当选项列表改变时候, 去选项里面查找对应的数据并初始化
          if (this.selector.selected && this.selector.selected.currentLabel === this.selector.selected.value) {
            const optionData = this.getOptionData(this.selector.selected.value)

            if (optionData) {
              this.selector.selected.currentLabel = optionData[this.labelKey]
              this.selector.selectedLabel = optionData[this.labelKey]
            }
          }
        } else {
          // TODO
        }
      }
    }
  },

  mounted() {
    if (this.value) {
      this.selector.query = ''
    }
    // 下拉加载更多数据
    if (this.filterable) {
      this._initLoadMore()
    }
    // 自动加载第一页数据
    if (this.autoFetch) {
      this.fetchData().then(() => {
        // 初始化默认值.  在没有选项的时候, 异步请求加载默认值完整对象
        this._initDefaultValue()
      })
    } else {
      this._initDefaultValue()
    }
  },

  beforeDestroy() {
  },

  methods: {
    /**
     * 获取数据
     */
    fetchData(pageIndex) {
      return new Promise((resolve, reject) => {
        // this.selector.$emit('update:loading', true)
        this.loading = true
        let _condition

        // 判断是否支持远程搜索, 如果不支持的话, 请求的参数就去掉 condition.keyword
        if (this.selector.filterable) {
          if (pageIndex) {
            this.pageInfo.currentPage = pageIndex
          }
          _condition = {
            keyword: this.selector.query,
            ...this.condition
          }
        } else {
          _condition = this.condition
        }

        this.action(_condition, this.pageInfo).then(res => {
          if (res instanceof Array) { // 返回非分页数据
            this.remoteOptions = res
            this.pageInfo.totalPage = 1
            this.pageInfo.pageSize = res.length
            this.pageInfo.totalRecord = res.length
          } else {
            if (this.pageInfo.currentPage === 1) {
              this.remoteOptions = res.records
            } else {
              this.remoteOptions = this.remoteOptions.concat(res.records)
            }
            if (this.selector.query === '' && res.totalRecord < this.pageInfo.pageSize) {
              this.pageInfo.pageSize = res.totalRecord
            }
            this.pageInfo.totalPage = res.totalPage
            this.pageInfo.totalRecord = res.totalRecord
          }
          this.$emit('fetch-end', res)
          resolve(res)
        }).catch(error => {
          reject(error)
        }).finally(() => {
          // this.selector.$emit('update:loading', false)
          this.loading = false
        })
      })
    },
    handleRemoteMethod() {
      this.fetchData(1)
    },
    /**
     * 首次获取焦点加载数据
     */
    handleFocus() {
      // fix: el-select 在开启 filterable 后, query 会被设置成当前选中的值, 不符合期望
      this.selector.query = ''
      if (this.remoteOptions.length < this.pageInfo.pageSize) {
        this.fetchData()
      }
    },
    /**
     * 获取选项完整数据
     */
    getOptionData(value) {
      const currentOptionData = this.remoteOptions.filter(item => item[this.valueKey] === value)
      return currentOptionData.length ? currentOptionData[0] : null
    },
    /**
     * 初始化下拉加载的功能
     * @private
     */
    _initLoadMore() {
      // 获取element-ui定义好的scroll盒子
      const _this = this
      const $el = this.$refs.selector.$el
      const SELECT_DOM = $el.querySelector('.el-select-dropdown .el-select-dropdown__wrap')

      SELECT_DOM.addEventListener('scroll', function() {
        /*
         * scrollHeight 获取元素内容高度(只读)
         * scrollTop 获取或者设置元素的偏移值,常用于, 计算滚动条的位置, 当一个元素的容器没有产生垂直方向的滚动条, 那它的scrollTop的值默认为0.
         * clientHeight 读取元素的可见高度(只读)
         * 如果元素滚动到底, 下面等式返回true, 没有则返回false:
         * ele.scrollHeight - ele.scrollTop === ele.clientHeight;
         */
        const CONDITION = (this.scrollHeight - this.scrollTop) <= this.clientHeight

        if (CONDITION) {
          _this.pageInfo.currentPage++
          _this.fetchData()
        }
      })
    },
    /**
     * 初始化默认值
     * @private
     */
    _initDefaultValue() {
      if (this.value && this.getValueAction) {
        // this.selector.$emit('update:loading', true)
        this.loading = true
        this.getValueAction(this.value).then(res => {
          if (res) {
            this.remoteOptions.unshift(res)
            this.selectedOptionData = res
            // this.selector.setSelected() // 设置选中的 UI, 同步显示展示的中文名称
          }
        }).catch(error => {
          console.error(error)
        }).finally(() => {
          // this.selector.$emit('update:loading', false)
          this.loading = false
        })
      }
    }
  }
}
</script>
