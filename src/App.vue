<template>
  <div class="global-container">
    <ElContainer style="height: 100%;">
      <ElHeader style="padding: 0px;">
        <ElMenu
          class="el-menu-horizontal-demo"
          background-color="#293246"
          style="height: 100%;"
          text-color="#fff"
          active-text-color="#fff"
          :collapse="false"
          :default-active="'1'"
          :router="true"
          mode="horizontal"
        >
        <!--theme #7e9cff-->
          <!--begin logo-->
          <ElMenuItem>
            <div>
              <span style="color:#fff;">地铁维保人员图谱</span>
            </div>
          </ElMenuItem>
          <!--end logo-->
          <ElMenuItem route="/graph" index="1">
            <ElIcon><DataAnalysis/></ElIcon>
            <span>图谱数据查询</span>
          </ElMenuItem>
          <ElMenuItem route="/person" index="2">
            <ElIcon><DataAnalysis/></ElIcon>
            <span>人员能力展示</span>
          </ElMenuItem>
          <ElMenuItem route="/embedding" index="3">
            <ElIcon><DataAnalysis/></ElIcon>
            <span>数据预处理</span>
          </ElMenuItem>
        </ElMenu>
      </ElHeader>
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
