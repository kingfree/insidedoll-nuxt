/**
 * 显示模式管理
 * 管理中文/日文/双语显示切换
 */

export const useDisplayMode = () => {
  const displayMode = useState<'ja' | 'cn' | 'both'>('displayMode', () => 'both')
  const { locale } = useI18n()
  const switchLocalePath = useSwitchLocalePath()

  const setDisplayMode = (mode: 'ja' | 'cn' | 'both') => {
    displayMode.value = mode
  }

  const toggleChinese = () => {
    if (displayMode.value === 'cn') {
      displayMode.value = 'both'
    } else {
      displayMode.value = 'cn'
      if (locale.value !== 'cn') {
        navigateTo(switchLocalePath('cn'))
      }
    }
  }

  const toggleJapanese = () => {
    if (displayMode.value === 'ja') {
      displayMode.value = 'both'
    } else {
      displayMode.value = 'ja'
      if (locale.value !== 'ja') {
        navigateTo(switchLocalePath('ja'))
      }
    }
  }

  const isBothMode = computed(() => displayMode.value === 'both')
  const isJapaneseOnly = computed(() => displayMode.value === 'ja')
  const isChineseOnly = computed(() => displayMode.value === 'cn')

  return {
    displayMode,
    setDisplayMode,
    toggleChinese,
    toggleJapanese,
    isBothMode,
    isJapaneseOnly,
    isChineseOnly,
  }
}
