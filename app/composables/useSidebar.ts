/**
 * 侧边栏状态管理
 */

export const useSidebar = () => {
  const isOpen = useState('sidebarOpen', () => false)

  const toggle = () => {
    isOpen.value = !isOpen.value
  }

  const open = () => {
    isOpen.value = true
  }

  const close = () => {
    isOpen.value = false
  }

  return {
    isOpen,
    toggle,
    open,
    close,
  }
}
