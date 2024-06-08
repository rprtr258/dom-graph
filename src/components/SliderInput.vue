<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps(["name", "min", "max", "step"]);
const step = props.step || 1;
const value = defineModel<number>('value');
const min2 = defineModel<number|null>('min2');
const max2 = defineModel<number|null>('max2');
const min_val = computed(() => Math.max(min2.value ?? +props.min, +props.min)+step);
const max_val = computed(() => Math.min(max2.value ?? +props.max, +props.max)-step);
function upd(new_value: number) {
  value.value = new_value;
  if (typeof max2.value === "number" && value.value > max2.value) {
    value.value = max2.value;
  }
  if (typeof min2.value === "number" && value.value < min2.value) {
    value.value = min2.value;
  }
}
</script>
<template>
<p>
  {{name}}
  <input
    type="range"
    :min="min_val"
    :max="max_val"
    :step
    :value
    @input="event => upd(Number((event.target as HTMLInputElement).value))"
  >
  {{value}}
</p>
<div style="width: 1em;"></div>
</template>