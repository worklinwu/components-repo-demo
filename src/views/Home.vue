<template>
  <div id="app">
    <split :gutter-size="1" direction="horizontal">
      <split-area :size="splits.left" class="split-pane-left">
        <el-menu
          :default-active="currentMenuItemIndex"
          class="menu-main">
          <el-menu-item
            :index="index.toString()"
            :key="index"
            @click="handleMenuItemClick(item, index)"
            v-for="(item, index) in menuData"
          >
            <span slot="title">{{ item.name }}</span>
          </el-menu-item>
        </el-menu>
      </split-area>
      <split-area :size="splits.right" class="split-pane-right">
        <div style="position: relative; width: 100%; height: 100%;">
          <code-editor
            :key="currentMenuItem.name"
            :template="currentMenuItem.code || '123'"
            :title="currentMenuItem.name"
            v-if="currentMenuItem"
          />
        </div>
      </split-area>
    </split>
  </div>
</template>

<script>
function toHump(name) {
  return name.charAt(0).toUpperCase() + name.slice(1).replace(/[\_\-](\w)/g, function (all, letter) {
    return letter.toUpperCase();
  });
}

const componentConfigs = {}
const components = require.context('../../packages/', true, /index\.js$/)
components.keys().forEach(path => {
  componentConfigs[components(path).default.name] = {
    name: components(path).default.name
  }
})

const codes = require.context('./examples', true, /code\.js$/)
codes.keys().forEach(path => {
  const componentName = toHump(path.match('\.\/(.*?)\/')[1])
  componentConfigs[componentName].code = codes(path).default
})

export default {
  name: 'Home',
  data() {
    return {
      splits: {
        left: 200 / window.innerWidth * 100,
        right: 100 - (200 / window.innerWidth * 100)
      },
      menuData: Object.values(componentConfigs),
      currentMenuItem: null,
      currentMenuItemIndex: '',
    }
  },
  methods: {
    handleMenuItemClick(menuItem, index) {
      this.currentMenuItem = menuItem
      this.currentMenuItemIndex = index.toString()
    }
  }
}
</script>

<style lang="scss">
  .menu-main {
    height: 100%;
    border-right: none !important;
  }
</style>
