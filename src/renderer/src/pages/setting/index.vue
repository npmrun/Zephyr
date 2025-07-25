<script setup lang="ts">
  import Simplebar from "simplebar-vue"
  const settingStore = useApiSetting()
</script>

<template>
  <div h-full flex>
    <Simplebar w="100px" border-r="#E5E5E5 solid 1px">
      <div py-2 hover:bg-gray-100 cursor-pointer text-center text-sm>基础设置</div>
      <div py-2 hover:bg-gray-100 cursor-pointer text-center text-sm>更新设置</div>
    </Simplebar>
    <div flex="1" w="0">
      <div class="form">
        <div class="form-item" :class="{ ['not-save']: settingStore.diffKeys.includes('storagePath') }">
          <div class="form-item__label">存储地址</div>
          <div class="form-item__value">
            <div class="input-wrapper">
              <input v-model="settingStore.config['storagePath']" class="input" readonly type="text" placeholder="请输入存储地址" />
            </div>
          </div>
        </div>
        <div class="form-item" :class="{ ['not-save']: settingStore.diffKeys.includes('common.theme') }">
          <div class="form-item__label">主题</div>
          <div class="form-item__value">
            <div class="radio-group">
              <div
                class="radio"
                :class="{ active: settingStore.config['common.theme'] === 'auto' }"
                @click="settingStore.config['common.theme'] = 'auto'"
              >
                Auto
              </div>
              <div
                class="radio"
                :class="{ active: settingStore.config['common.theme'] === 'light' }"
                @click="settingStore.config['common.theme'] = 'light'"
              >
                亮色
              </div>
              <div
                class="radio"
                :class="{ active: settingStore.config['common.theme'] === 'dark' }"
                @click="settingStore.config['common.theme'] = 'dark'"
              >
                暗色
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="!settingStore.isSame" text-center>
        <button class="submit" :disabled="settingStore.isSaving" @click="settingStore.save()">保存</button>
        <button :disabled="settingStore.isSaving" @click="settingStore.reset()">重置</button>
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
        width: 300px;
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
  // .input-wrapper {
  //   .input {
  //     width: 100%;
  //     padding: 8px;
  //     border: 1px solid #ccc;
  //     border-radius: 4px;
  //   }
  // }
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
