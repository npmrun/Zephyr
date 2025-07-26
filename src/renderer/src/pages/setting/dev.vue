<script setup lang="ts">
  const settingStore = useApiSetting()
</script>

<template>
  <div h-full>
    <div class="form">
      <div class="form-item" :class="{ ['not-save']: settingStore.diffKeys.includes('dev:debug') }">
        <div class="form-item__label">存储地址</div>
        <div class="form-item__value">
          <div class="select">
            <select v-model="settingStore.config['dev:debug']">
              <option :value="0">开启调试模式</option>
              <option :value="2">关闭调试模式</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .form {
    padding: 20px;
    .form-item {
      display: flex;
      align-items: center;
      + .form-item {
        margin-top: 15px;
      }
      .form-item__label {
        width: 100px;
        font-weight: bold;
        flex-basis: 100px;
      }
      .form-item__value {
        width: 600px;
      }
    }
  }
</style>
