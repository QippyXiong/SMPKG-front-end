<template>
  <div class="global-container">
    <ElContainer style="height: 100%;">
      <ElAside>
        <ElMenu
          class="el-menu-vertical-demo"
          background-color="#293246"
          style="height: 100%;"
          text-color="#fff"
          active-text-color="#fff"
          :collapse="false"
          :default-active="'1'"
          :router="true"
        >
        <!--theme #7e9cff-->
          <!--begin logo-->
          <div style="height: 50px; line-height: 50px;">
            <span style="color:#fff;">地铁维保人员图谱</span>
          </div>
          <!--end logo-->
          <ElMenuItem route="/graph" index="1">
            <ElIcon><DataAnalysis/></ElIcon>
            <span>人员图谱查询</span>
          </ElMenuItem>
        </ElMenu>
      </ElAside>
      <ElMain style="height: 100%;">
        <ElScrollbar height="100%" view-style="height: 100%;">
          <router-view/>
        </ElScrollbar>
      </ElMain>
    </ElContainer>
  </div>
</template>

<script setup lang="ts">
import { DataAnalysis } from '@element-plus/icons-vue'
</script>

<style>
.global-container {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  position: absolute;
  left: 0px;
  top: 0px;
  right: 0px;
  bottom: 0px;
}

.el-menu-item.is-active {
  background-color: #7e9cff;
}
</style>
