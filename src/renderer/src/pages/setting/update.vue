<script setup lang="ts">
</script>

<template>
  <div h-full flex>dasd</div>
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
