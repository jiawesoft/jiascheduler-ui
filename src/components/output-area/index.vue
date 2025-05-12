<template>
  <a-card :style="{ width: $props.width }">
    <div class="output-area" ref="parent" :style="{ width: $props.width }">
      <a-scrollbar :style="{ height: $props.height, overflow: 'auto' }">
        <div v-html="output" ref="child"> </div>
      </a-scrollbar>
    </div>
  </a-card>
</template>

<script lang="ts" setup>
  import { onMounted, ref } from 'vue';

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
    height: {
      type: [String, Number],
      default: '300px',
    },
    width: {
      type: [String, Number],
      default: '100%',
    },
  });

  const output = ref(convert.toHtml(props.output));

  const parent: any = ref(null);
  const child: any = ref(null);

  onMounted(() => {
    if (parent.value && child.value) {
      const parentWidth = parent.value.offsetWidth;
      child.value.style.width = `${parentWidth - 30}px`;
    }
  });
</script>
