<template>
  <div>
    <code-editor title="c-select" :template="code" />
  </div>
</template>

<script type="text/babel">
import code from './code'

export default {
  name: 'ExampleCSelect',
  data() {
    return {
      code
    }
  }
}
</script>
