// language=Vue
export default
`<template>
  <div>
    <c-select
      v-model="value"
      :action="$test_api.getDataByPage"
      label-key="name"
      value-key="id"
    />
    <c-select
      v-model="value2"
      :action="$test_api.getArrayData"
      :filterable="false"
      auto-fetch
    />
  </div>
</template>

<script>

export default {
  data () {
    return {
      value: '',
      value2: ''
    }
  },
  computed:{},
  watch:{},
  methods: {
    fetchData() {
      return new Promise((resolve, reject) => {
        resolve([
          { id: 1, name: 1 },
          { id: 2, name: 2 },
          { id: 3, name: 3 }
        ])
      })
    }
  },
  mounted () {
  }
}
</script>

<style>
</style>
`
