<script lang="ts" setup></script>

<template>
    <div h-full flex flex-col>
        <NavBar></NavBar>
        <div flex-1 h-0 overflow="auto">
            <RouterView></RouterView>
        </div>
    </div>
</template>
