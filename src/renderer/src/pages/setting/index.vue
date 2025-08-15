<script setup lang="ts">
  const SettingStore = useApiSetting()
  const ApiPlatForm = useApiPlatForm()
</script>

<template>
  <div h-full>
    <div class="form">
      <div class="form-item" :class="{ ['not-save']: SettingStore.diffKeys.includes('storagePath') }">
        <div class="form-item__label">存储地址</div>
        <div class="form-item__value" flex gap="10px" items-center>
          <div class="input-wrapper">
            <input v-model="SettingStore.config['storagePath']" class="input" readonly type="text" placeholder="请输入存储地址" />
          </div>
          <button class="button" @click="ApiPlatForm.power.openDir(SettingStore.config['storagePath'])">打开</button>
        </div>
      </div>
      <div class="form-item" :class="{ ['not-save']: SettingStore.diffKeys.includes('common.theme') }">
        <div class="form-item__label">主题</div>
        <div class="form-item__value">
          <div class="radio-group">
            <div
              class="radio"
              :class="{ active: SettingStore.config['common.theme'] === 'auto' }"
              @click="SettingStore.config['common.theme'] = 'auto'"
            >
              Auto
            </div>
            <div
              class="radio"
              :class="{ active: SettingStore.config['common.theme'] === 'light' }"
              @click="SettingStore.config['common.theme'] = 'light'"
            >
              亮色
            </div>
            <div
              class="radio"
              :class="{ active: SettingStore.config['common.theme'] === 'dark' }"
              @click="SettingStore.config['common.theme'] = 'dark'"
            >
              暗色
            </div>
          </div>
        </div>
      </div>
      <div class="form-item" :class="{ ['not-save']: SettingStore.diffKeys.includes('language') }">
        <div class="form-item__label">语言</div>
        <div class="form-item__value">
          <div class="radio-group">
            <div
              class="radio"
              :class="{ active: SettingStore.config['language'] === 'zh' }"
              @click="SettingStore.config['language'] = 'zh'"
            >
              中文
            </div>
            <div
              class="radio"
              :class="{ active: SettingStore.config['language'] === 'en' }"
              @click="SettingStore.config['language'] = 'en'"
            >
              English
            </div>
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
  .submit {
    margin: 20px;
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    &:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
  }
  .input-wrapper {
    width: 400px;
    transition: width 0.3s ease;
    &:focus-within {
      width: 600px;
    }
  }
  .radio-group {
    display: inline-flex;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    .radio {
      flex: 1;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 10px;
      &:hover {
        background-color: #f0f0f0;
      }
      &.active {
        background-color: #e0e0e0;
        font-weight: bold;
      }
      + .radio {
        border-left: 1px solid #ccc;
      }
    }
  }
</style>
