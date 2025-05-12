<template>
  <div style="height: 400px; overflow-y: scroll; width: 100%" v-html="output">
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';

  import Convert from 'ansi-to-html';

  const convert = new Convert({
    fg: '#d4d4d4',
    bg: '#2d2d2d',
    newline: true,
    escapeXML: false,
    stream: false,
  });

  const props = defineProps({
    output: {
      type: String,
      default() {
        return '';
      },
    },
  });

  const output = ref(convert.toHtml(props.output));
</script>
