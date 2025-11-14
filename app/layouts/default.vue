<template>
  <UHeader title="Inside Doll" to="/main">
    <template #right>
      <UColorModeButton />
    </template>
  </UHeader>
  <UContainer>
    <slot />
  </UContainer>
</template>
