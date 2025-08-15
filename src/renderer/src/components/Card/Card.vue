<template>
  <div class="w-[calc((100%-4*20px)/5)] <lg:w-[calc((100%-2*20px)/3)]" shadow>
    <div p-2 text-lg font-bold>MarkdownUtils</div>
    <div p-2 pt-0 text-sm>这是一个导航站</div>
    <div flex gap="10px" px-4 py-2 tex border-t="1px solid #E5E5E5">
      <div cursor="pointer" text-sm leading-1 py-2 px-3 border="1px solid #E5E5E5" rounded @click="$router.push('browser')">查看</div>
      <div cursor="pointer" text-sm leading-1 py-2 px-3 border="1px solid #E5E5E5" rounded>访问</div>
    </div>
  </div>
</template>
