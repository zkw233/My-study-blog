<template>
  <RouterView></RouterView>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<!-- 这里的样式会作用到本组件模板内的元素。
     RouterView 渲染出的 Login 根节点带的是 Login 自己的 data-v 属性，
     所以不要在这里写针对 .card 的样式，会命中不到。 -->
<style>
/* App 只做路由出口，页面级样式统一在 src/styles/global.css */
</style>
