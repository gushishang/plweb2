<template>
  <div id="app">
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component
          :is="Component"
          v-if="$route.meta.keepAlive"
          :key="$route.fullPath"
        />
      </keep-alive>
      <component
        :is="Component"
        v-if="!$route.meta.keepAlive"
        :key="$route.fullPath"
      />
    </router-view>
  </div>
</template>

<script setup lang="ts"></script>

<style>
html,
body {
  height: 100vh !important;
  height: 100dvh !important;
}

#app {
  height: 100vh !important;
  height: 100dvh !important;
  touch-action: none;
}
</style>
