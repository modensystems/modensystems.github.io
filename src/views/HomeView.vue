<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

/** Public assets under Vite `base` (e.g. /mdsys/ on GitHub Pages). */
function asset(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
}

const menuOpen = ref(false)
const consultOpen = ref(false)
const scrolled = ref(false)
const ready = ref(false)
const heroWord = ref(0)
const palsOn = ref(false)
const palsFollowing = ref(false)
const palsRoot = ref<HTMLElement | null>(null)
const brandDotRef = ref<HTMLElement | null>(null)

const consultForm = ref({
  phone: '',
  method: 'sms' as 'sms' | 'call',
  site: '',
  reference: '',
})
const consultSending = ref(false)
const consultStatus = ref<'idle' | 'err'>('idle')

const PAL_KINDS = [
  'star',
  'heart',
  'spark',
  'circle',
  'moon',
  'bolt',
  'diamond',
  'triangle',
  'clover',
  'ring',
] as const
type PalKind = (typeof PAL_KINDS)[number]
const PAL_MAX = PAL_KINDS.length

const PAL_SIZES: Record<PalKind, number> = {
  star: 28,
  heart: 24,
  spark: 22,
  circle: 22,
  moon: 24,
  bolt: 22,
  diamond: 24,
  triangle: 24,
  clover: 26,
  ring: 24,
}

const PAL_PATHS: Record<PalKind, string> = {
  star: 'M12 2.4l2.7 6.2 6.7.7-5 4.5 1.4 6.6L12 17.4 6.2 20.4l1.4-6.6-5-4.5 6.7-.7L12 2.4z',
  heart:
    'M12 20.4S3.6 14.8 3.6 9.7A4.4 4.4 0 0 1 12 7.2a4.4 4.4 0 0 1 8.4 2.5c0 5.1-8.4 10.7-8.4 10.7z',
  spark: 'M12 1.5l1.5 7.2L21 10l-7.5 1.3L12 18.5l-1.5-7.2L3 10l7.5-1.3L12 1.5z',
  circle: 'M12 3.2a8.8 8.8 0 1 0 0 17.6 8.8 8.8 0 0 0 0-17.6z',
  moon: 'M15.4 2.2A8.8 8.8 0 1 0 21.8 14 7.2 7.2 0 0 1 15.4 2.2z',
  bolt: 'M13.2 2.4 5.4 13.2h5.1l-1.5 8.4 9-12h-5.4l1.6-7.2z',
  diamond: 'M12 2.8 20.5 12 12 21.2 3.5 12 12 2.8z',
  triangle: 'M12 3.2 21.2 20.2H2.8L12 3.2z',
  clover:
    'M12 2.8c-1.8 0-3.2 1.8-3.2 3.6 0 1.1.5 2.1 1.3 2.8C8.8 8.4 7 7.8 5.6 8.8S4.2 12 6.2 13c-2 .6-2.8 2.6-1.8 4s3.2 1.4 4.4.2c-.2 1.8.8 3.6 2.6 3.6H12v2.4h0V21c1.8 0 2.8-1.8 2.6-3.6 1.2 1.2 3 .8 4.4-.2s.2-3.4-1.8-4c2-1 2.4-3.2 1-4.2s-3.2-.4-4.5.4c.8-.7 1.3-1.7 1.3-2.8 0-1.8-1.4-3.6-3.2-3.6H12z',
  ring: 'M12 4.2a7.8 7.8 0 1 0 0 15.6 7.8 7.8 0 0 0 0-15.6zm0 2.8a5 5 0 1 1 0 10 5 5 0 0 1 0-10z',
}

const cursorPals = PAL_KINDS.map((kind, i) => ({
  id: `pal-${kind}`,
  kind,
  size: PAL_SIZES[kind],
  followLag: 0.035 + i * 0.006,
  path: PAL_PATHS[kind],
}))

const mouse = { x: 0, y: 0, active: false }
const CATCH_RADIUS = 54
const DOT_CYCLE_MS = 1700
const DOT_PEAK_MS = 680 // 40% of bob-dot keyframes

type PalState = {
  alive: boolean
  caught: boolean
  x: number
  y: number
  vx: number
  vy: number
  rot: number
  vr: number
  scale: number
  opacity: number
  bornAt: number
}

const palState: PalState[] = cursorPals.map(() => ({
  alive: false,
  caught: false,
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  rot: 0,
  vr: 0,
  scale: 0,
  opacity: 0,
  bornAt: 0,
}))

let palsRaf = 0
let palsReduceMotion = false
let palNodes: HTMLElement[] = []
let spawnedCount = 0
let nextSpawnAt = 0
let lastTick = 0
let dotAnimStart = 0

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function getDotOrigin() {
  const el = brandDotRef.value
  if (!el) {
    return { x: 96, y: 36 }
  }
  // spawn from the top of the (possibly scaled) brand-dot
  const rect = el.getBoundingClientRect()
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + Math.max(2, rect.height * 0.12),
  }
}

function syncDotAnimation(now: number) {
  const el = brandDotRef.value
  if (!el) return
  el.style.animation = 'none'
  void el.offsetWidth
  el.style.animation = ''
  dotAnimStart = now
}

function spawnPal(index: number, now: number) {
  const origin = getDotOrigin()
  const state = palState[index]
  state.alive = true
  state.caught = false
  state.x = origin.x
  state.y = origin.y
  // shoot mostly upward from the enlarged dot, then arc out
  state.vx = rand(-2.8, 2.8)
  state.vy = rand(-10.5, -7.2)
  state.rot = rand(-30, 30)
  state.vr = rand(-6, 6)
  state.scale = 0.06
  state.opacity = 0
  state.bornAt = now

  const node = palNodes[index]
  if (node) {
    node.style.visibility = 'visible'
    node.style.opacity = '0'
    node.style.transform = `translate3d(${origin.x}px, ${origin.y}px, 0) translate(-50%, -50%) scale(0.06)`
  }
}

const contact = {
  company: '모든시스템즈',
  email: 'allsys2687@gmail.com',
  address: '부산광역시 연제구 고분로112번길 23, 현대아파트 102동 109호',
}

const navLinks = [
  { label: '서비스', href: '#works' },
  { label: '포트폴리오', href: '#template-list' },
  { label: '안내', href: '#services' },
  { label: 'ABOUT', href: '#systems' },
]

const menuGroups = [
  {
    title: '서비스',
    links: [
      { label: '우리가 잘하는 일', href: '#works' },
      { label: '반응형 모바일 웹', href: '#works' },
      { label: '홈페이지 제작·운영', href: '#works' },
    ],
  },
  {
    title: '제작',
    links: [
      { label: '기업·매장 홈페이지', href: '#template-list' },
      { label: '예약·문의 페이지', href: '#template-list' },
      { label: '랜딩·소개 페이지', href: '#template-list' },
    ],
  },
  {
    title: '안내',
    links: [
      { label: '반응형 모바일 웹', href: '#services' },
      { label: '홈페이지 제작·운영', href: '#services' },
      { label: '운영·유지보수', href: '#services' },
      { label: '진행 과정', href: '#process' },
    ],
  },
  {
    title: 'ABOUT',
    links: [
      { label: '회사 소개', href: '#systems' },
      { label: '상담 문의', href: 'mailto:allsys2687@gmail.com' },
    ],
  },
]

/** hero rotating words */
const heroWords = ['기업을', '매장을', '브랜드를']

const marqueeImgs = Array.from({ length: 12 }, (_, i) =>
  asset(`examples/hero-${String(i + 1).padStart(2, '0')}.jpg`),
)

const templates = [
  { name: '로그인', tag: 'LAB AUTOLINK', img: asset('examples/site-01.jpg') },
  { name: '파트너 등록', tag: 'LAB AUTOLINK', img: asset('examples/site-02.jpg') },
  { name: '랜딩 히어로', tag: '진단검사 분석', img: asset('examples/site-03.jpg') },
  { name: '병원·파트너', tag: '서비스 소개', img: asset('examples/site-04.jpg') },
  { name: '솔루션 단계', tag: '수익 분석', img: asset('examples/site-05.jpg') },
  { name: '왜 지금인가', tag: '분리지급 대응', img: asset('examples/site-06.jpg') },
  { name: '작동 방식', tag: '분석 플로우', img: asset('examples/site-07.jpg') },
  { name: '리포트', tag: '모니터링', img: asset('examples/site-08.jpg') },
  { name: '비교 포인트', tag: '견적 차별화', img: asset('examples/site-09.jpg') },
  { name: '요금 안내', tag: '베타 무료', img: asset('examples/site-10.jpg') },
  { name: '수익 시나리오', tag: '3가지 비교', img: asset('examples/site-11.jpg') },
  { name: '분석 앱', tag: '반응형 웹', img: asset('examples/site-12.jpg') },
]

const templateLoop = computed(() => [...templates, ...templates])

const brands = [
  {
    title: '스마트폰에서도 잘 보이는 반응형 홈페이지',
    name: '기업·매장 사이트',
    cat: '반응형 모바일 웹',
    img: asset('work/responsive.jpg'),
  },
  {
    title: '콘텐츠·문의·예약을 한곳에서 관리',
    name: '운영 어드민',
    cat: '관리자·백오피스',
    img: asset('work/admin.jpg'),
  },
  {
    title: '오픈 이후 수정·운영까지 함께',
    name: '유지보수',
    cat: '홈페이지 운영',
    img: asset('work/care.jpg'),
  },
]

const easyFeatures = [
  {
    title: '반응형 모바일 웹',
    lines: ['PC·태블릿·스마트폰에서', '자연스럽게 보이는 사이트 제작'],
    tone: 'design',
    img: asset('service/responsive.jpg'),
  },
  {
    title: '홈페이지 제작·운영',
    lines: ['기획부터 디자인·개발·오픈까지', '이후 수정·유지보수까지 함께'],
    tone: 'ops',
    img: asset('service/build.jpg'),
  },
  {
    title: '운영·유지보수',
    lines: ['콘텐츠 수정과 페이지 추가,', '오픈 이후 운영까지 함께합니다'],
    tone: 'mkt',
    img: asset('service/care.jpg'),
  },
]

const processSteps = [
  { step: '01', title: '상담·요구사항', desc: '업종, 목적, 예산, 일정을 확인합니다.' },
  { step: '02', title: '견적·일정', desc: '범위에 맞는 견적과 진행 일정을 안내합니다.' },
  { step: '03', title: '제작·구축', desc: '모바일 우선 디자인과 반응형 개발을 진행합니다.' },
  { step: '04', title: '검수·오픈', desc: '검수 후 오픈하고, 필요 시 운영을 이어갑니다.' },
]

const aboutPoints = [
  { label: '주력', value: '반응형 모바일 웹' },
  { label: '범위', value: '기획 · 디자인 · 개발 · 운영' },
  { label: '방식', value: '맞춤 제작' },
]

const footerCols = [
  {
    title: '서비스',
    links: ['반응형 모바일 웹', '홈페이지 제작·운영', '관리자 페이지'],
  },
  {
    title: '제작',
    links: ['기업·매장 홈페이지', '예약·문의 페이지', '랜딩·소개 페이지', '포트폴리오'],
  },
  {
    title: '안내',
    links: ['상담·요구사항', '견적·일정', '제작·구축', '검수·오픈'],
  },
  {
    title: 'ABOUT',
    links: ['회사 소개', '상담 문의'],
  },
]

let menuCloseTimer = 0
let heroTimer = 0
let revealObserver: IntersectionObserver | null = null
let autoHoverObserver: IntersectionObserver | null = null
let autoHoverTimer = 0
const activeAutoSections = new Set<HTMLElement>()
const autoHoverIndex = new WeakMap<HTMLElement, number>()

function clearSectionAutoHover(section: HTMLElement) {
  section.querySelectorAll('.is-auto-hover').forEach((el) => el.classList.remove('is-auto-hover'))
}

function tickAutoHover() {
  activeAutoSections.forEach((section) => {
    const sel = section.dataset.autoHover
    if (!sel) return
    const items = Array.from(section.querySelectorAll<HTMLElement>(sel))
    if (!items.length) return
    const prev = autoHoverIndex.get(section) ?? -1
    items.forEach((el) => el.classList.remove('is-auto-hover'))
    const next = (prev + 1) % items.length
    items[next].classList.add('is-auto-hover')
    autoHoverIndex.set(section, next)
  })
}

function onPointerMove(event: PointerEvent) {
  mouse.x = event.clientX
  mouse.y = event.clientY
  mouse.active = true

  // catch the nearest uncaught pal under the cursor (one at a time)
  let best = -1
  let bestDist = CATCH_RADIUS * CATCH_RADIUS
  palState.forEach((state, i) => {
    if (!state.alive || state.caught) return
    const dx = state.x - mouse.x
    const dy = state.y - mouse.y
    const d2 = dx * dx + dy * dy
    if (d2 < bestDist) {
      bestDist = d2
      best = i
    }
  })
  if (best >= 0) {
    palState[best].caught = true
    palState[best].vx = 0
    palState[best].vy = 0
  }
}

function onPointerLeave() {
  mouse.active = false
  palState.forEach((state) => {
    if (!state.caught) return
    state.caught = false
    state.vx = rand(-2.4, 2.4)
    state.vy = rand(-2.8, -1.2)
  })
}

function tickPals(now: number) {
  const dt = Math.min(34, now - (lastTick || now)) / 16.67
  lastTick = now
  const t = now / 1000

  // spawn one icon at each logo-dot pulse peak
  if (spawnedCount < PAL_MAX && now >= nextSpawnAt) {
    spawnPal(spawnedCount, now)
    spawnedCount += 1
    nextSpawnAt = dotAnimStart + DOT_PEAK_MS + spawnedCount * DOT_CYCLE_MS
    if (!palsOn.value) palsOn.value = true
  }

  const anyCaught = palState.some((s) => s.caught)
  if (palsFollowing.value !== anyCaught) palsFollowing.value = anyCaught

  const pad = 28
  const maxX = window.innerWidth - pad
  const maxY = window.innerHeight - pad
  const minY = pad + 8
  let followSlot = 0
  const caughtTotal = palState.filter((s) => s.caught).length

  cursorPals.forEach((pal, i) => {
    const state = palState[i]
    const node = palNodes[i]
    if (!node) return

    // not spawned yet — stay fully hidden
    if (!state.alive) {
      node.style.visibility = 'hidden'
      node.style.opacity = '0'
      node.style.transform = 'translate3d(-9999px, -9999px, 0) scale(0)'
      return
    }

    const age = now - state.bornAt
    const launching = age < 480
    if (launching) {
      const p = Math.min(1, age / 480)
      state.opacity = Math.min(1, p * 1.35)
      // bounce pop while flying up
      const pop = Math.sin(p * Math.PI)
      state.scale = 0.08 + pop * 1.12
    } else {
      state.opacity += (1 - state.opacity) * 0.14
    }

    if (state.caught && mouse.active) {
      const slot = followSlot
      followSlot += 1
      const angle = t * 0.9 + slot * ((Math.PI * 2) / Math.max(1, caughtTotal))
      const radius = 18 + (slot % 4) * 8
      const tx = mouse.x + Math.cos(angle) * radius
      const ty = mouse.y + Math.sin(angle) * radius - 4
      const lag = pal.followLag
      state.x += (tx - state.x) * Math.min(0.35, lag * 3)
      state.y += (ty - state.y) * Math.min(0.35, lag * 3)
      state.rot += (Math.sin(t * 1.2 + i) * 5 - state.rot) * 0.08
      state.scale += (1 - state.scale) * 0.14
    } else {
      // lighter gravity while launching upward, then normal bounce
      state.vy += (launching ? 0.028 : 0.055) * dt
      state.x += state.vx * dt
      state.y += state.vy * dt
      state.rot += state.vr * dt

      if (state.x < pad) {
        state.x = pad
        state.vx = Math.abs(state.vx) * rand(0.86, 1.05)
      } else if (state.x > maxX) {
        state.x = maxX
        state.vx = -Math.abs(state.vx) * rand(0.86, 1.05)
      }
      if (state.y < minY) {
        state.y = minY
        state.vy = Math.abs(state.vy) * rand(0.86, 1.08)
      } else if (state.y > maxY) {
        state.y = maxY
        state.vy = -Math.abs(state.vy) * rand(0.9, 1.12)
        state.vx += rand(-0.4, 0.4)
      }

      if (!launching) {
        const speed = Math.hypot(state.vx, state.vy)
        if (speed < 1.6) {
          const boost = rand(1.8, 3.2) / Math.max(0.2, speed)
          state.vx *= boost
          state.vy *= boost
        } else if (speed > 8.5) {
          state.vx *= 0.96
          state.vy *= 0.96
        }
        state.scale += (1 + Math.sin(t * 5 + i) * 0.07 - state.scale) * 0.1
      }
    }

    node.style.visibility = 'visible'
    node.style.opacity = String(Math.max(0, Math.min(1, state.opacity)))
    node.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) translate(-50%, -50%) rotate(${state.rot}deg) scale(${Math.max(0.05, state.scale)})`
    node.classList.toggle('is-follow', state.caught)
  })

  palsRaf = window.requestAnimationFrame(tickPals)
}

function setMenuOpen(open: boolean) {
  window.clearTimeout(menuCloseTimer)
  if (open) {
    menuOpen.value = true
    document.body.classList.add('menu-open')
    return
  }
  menuOpen.value = false
  menuCloseTimer = window.setTimeout(() => {
    document.body.classList.remove('menu-open')
  }, 600)
}

function toggleMenu() {
  setMenuOpen(!menuOpen.value)
}

function closeMenu() {
  setMenuOpen(false)
}

function openConsult(event?: Event) {
  event?.preventDefault()
  closeMenu()
  consultStatus.value = 'idle'
  consultOpen.value = true
  document.body.classList.add('consult-open')
}

function closeConsult() {
  consultOpen.value = false
  document.body.classList.remove('consult-open')
  consultSending.value = false
}

async function submitConsult(event?: Event) {
  event?.preventDefault()
  if (consultSending.value) return

  const phone = consultForm.value.phone.trim()
  if (!phone) {
    window.alert('휴대폰 번호를 입력해 주세요.')
    return
  }

  const methodLabel = consultForm.value.method === 'call' ? '전화' : '문자'
  consultSending.value = true
  consultStatus.value = 'idle'

  try {
    const res = await fetch(`https://formsubmit.co/ajax/${contact.email}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        _subject: `[상담문의] ${contact.company} 홈페이지 문의`,
        _template: 'table',
        _captcha: 'false',
        휴대폰번호: phone,
        연락방법: methodLabel,
        만들고싶은사이트: consultForm.value.site.trim() || '-',
        참고사이트: consultForm.value.reference.trim() || '-',
        출처: typeof window !== 'undefined' ? window.location.href : 'mdsys',
      }),
    })

    if (!res.ok) throw new Error(`submit failed: ${res.status}`)
    consultForm.value = { phone: '', method: 'sms', site: '', reference: '' }
    closeConsult()
  } catch {
    consultStatus.value = 'err'
  } finally {
    consultSending.value = false
  }
}

function onFullMenuClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  if (!target) return
  if (target.closest('a')) {
    closeMenu()
    return
  }
  if (!target.closest('.full-menu-bg')) closeMenu()
}

function onAskHover(event: MouseEvent) {
  const button = event.currentTarget as HTMLElement | null
  const blob = button?.querySelector(':scope > span:not(.btn-ask-arrow)') as HTMLElement | null
  if (!button || !blob) return
  const rect = button.getBoundingClientRect()
  blob.style.top = `${event.clientY - rect.top}px`
  blob.style.left = `${event.clientX - rect.left}px`
}

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape') return
  if (consultOpen.value) {
    closeConsult()
    return
  }
  closeMenu()
}

watch(menuOpen, (open) => {
  if (open) document.body.classList.add('menu-open')
})

function onScroll() {
  scrolled.value = window.scrollY > 16
}

onMounted(() => {
  requestAnimationFrame(() => {
    ready.value = true
  })
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  document.addEventListener('keydown', onKeydown)
  heroTimer = window.setInterval(() => {
    heroWord.value = (heroWord.value + 1) % heroWords.length
  }, 2800)

  palsReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  if (!palsReduceMotion && finePointer) {
    mouse.x = window.innerWidth * 0.4
    mouse.y = 120
    palNodes = palsRoot.value
      ? Array.from(palsRoot.value.querySelectorAll<HTMLElement>('.cursor-pal'))
      : []
    spawnedCount = 0
    lastTick = performance.now()
    syncDotAnimation(lastTick)
    nextSpawnAt = dotAnimStart + DOT_PEAK_MS
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerleave', onPointerLeave)
    document.documentElement.addEventListener('mouseleave', onPointerLeave)
    palsRaf = window.requestAnimationFrame(tickPals)
  }

  const revealEls = document.querySelectorAll('.bounce-in')
  if (palsReduceMotion) {
    revealEls.forEach((el) => el.classList.add('is-in'))
  } else {
    revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('is-in')
          revealObserver?.unobserve(entry.target)
        }
      },
      { threshold: 0.14, rootMargin: '0px 0px -6% 0px' },
    )
    revealEls.forEach((el) => revealObserver?.observe(el))
  }

  if (!palsReduceMotion) {
    const autoSections = document.querySelectorAll<HTMLElement>('[data-auto-hover]')
    autoHoverObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const section = entry.target as HTMLElement
          if (entry.isIntersecting) {
            activeAutoSections.add(section)
          } else {
            activeAutoSections.delete(section)
            clearSectionAutoHover(section)
            autoHoverIndex.delete(section)
          }
        }
      },
      { threshold: 0.28, rootMargin: '-10% 0px -10% 0px' },
    )
    autoSections.forEach((section) => autoHoverObserver?.observe(section))
    autoHoverTimer = window.setInterval(tickAutoHover, 1500)
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  document.removeEventListener('keydown', onKeydown)
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerleave', onPointerLeave)
  document.documentElement.removeEventListener('mouseleave', onPointerLeave)
  window.cancelAnimationFrame(palsRaf)
  window.clearTimeout(menuCloseTimer)
  window.clearInterval(heroTimer)
  window.clearInterval(autoHoverTimer)
  revealObserver?.disconnect()
  autoHoverObserver?.disconnect()
  document.body.classList.remove('menu-open')
  document.body.classList.remove('consult-open')
})
</script>

<template>
  <div class="page" :class="{ ready, 'menu-open': menuOpen }">
    <div
      ref="palsRoot"
      class="cursor-pals"
      :class="{ on: palsOn && !menuOpen, follow: palsFollowing }"
      aria-hidden="true"
    >
      <div
        v-for="pal in cursorPals"
        :key="pal.id"
        class="cursor-pal"
        :class="`is-${pal.kind}`"
        :style="{ width: `${pal.size}px`, height: `${pal.size}px` }"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path :d="pal.path" />
        </svg>
      </div>
    </div>

    <!-- ===== KEEP: header ===== -->
    <header class="nav on-hero" :class="{ 'is-down': scrolled }">
      <a class="brand" href="#top" @click="closeMenu" aria-label="모든시스템즈">
        moden<span ref="brandDotRef" class="brand-dot">.</span
        ><span class="brand-sub">systems</span>
      </a>

      <nav class="nav-links" aria-label="주요 메뉴">
        <a v-for="item in navLinks" :key="item.href" :href="item.href">{{ item.label }}</a>
      </nav>

      <div class="nav-actions">
        <div class="nav-asks">
          <a
            class="btn-ask"
            href="#consult"
            @click="openConsult"
            @mouseenter="onAskHover"
            @mouseout="onAskHover"
          >
            <em>무료 상담 문의 <span class="btn-ask-arrow" aria-hidden="true">→</span></em>
            <span />
          </a>
        </div>
        <span class="nav-toggle-slot" aria-hidden="true" />
      </div>
    </header>

    <button
      class="nav-toggle"
      type="button"
      :class="{ 'is-open': menuOpen }"
      :aria-expanded="menuOpen"
      aria-controls="fullMenu"
      aria-label="메뉴"
      @click="toggleMenu"
    >
      <span class="line line-a" />
      <span class="line line-b" />
      <span class="line line-c" />
    </button>

    <div
      id="fullMenu"
      class="full-menu"
      :class="{ 'is-open': menuOpen }"
      :aria-hidden="!menuOpen"
      @click="onFullMenuClick"
    >
      <div class="full-menu-bg">
        <div class="full-menu-panel">
          <div class="full-menu-body">
            <aside class="full-menu-left">
              <a class="full-menu-brand" href="#top" @click="closeMenu"
                >moden<span class="brand-dot">.</span><span class="brand-sub">systems</span></a
              >
              <div class="full-menu-meta effect-y">
                <strong>Email</strong>
                <p>
                  <a :href="`mailto:${contact.email}`">{{ contact.email }}</a>
                </p>
              </div>
              <div class="full-menu-meta effect-y">
                <strong>Business</strong>
                <p>반응형 모바일 웹 제작 전문 · 홈페이지 · 관리자 · 운영</p>
              </div>
              <div class="full-menu-meta effect-y last">
                <a href="#consult" @click="openConsult"
                  >무료 상담 문의 <span aria-hidden="true">→</span></a
                >
              </div>
            </aside>
            <nav class="full-menu-right" aria-label="전체 메뉴">
              <ul>
                <li v-for="group in menuGroups" :key="group.title">
                  <h2>{{ group.title }}</h2>
                  <ul>
                    <li v-for="link in group.links" :key="link.label">
                      <a :href="link.href" @click="closeMenu">{{ link.label }}</a>
                    </li>
                  </ul>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== IMWEB MAIN (rewritten) ===== -->
    <main id="top">
      <!-- HERO -->
      <section class="hero" aria-label="회사 소개">
        <div class="hero-copy hero-pop">
          <p class="hero-kicker">반응형 모바일 웹 제작 전문</p>
          <h1 class="hero-title">
            <span class="hero-rotator" aria-live="polite">
              <span
                v-for="(w, i) in heroWords"
                :key="w"
                class="hero-word"
                :class="{ on: i === heroWord }"
                >{{ w }}</span
              >
            </span>
            <span>위한</span>
            <span>홈페이지</span>
          </h1>
          <p class="hero-sub">
            모든시스템즈는 스마트폰에서도 잘 보이는<br />
            반응형 웹·홈페이지를 기획부터 제작·운영까지 맡는 제작사입니다.
          </p>
          <div class="hero-actions">
            <a class="btn-start" href="#consult" @click="openConsult">상담 문의</a>
            <a class="btn-ghost" href="#services">서비스 보기</a>
          </div>
        </div>

        <div class="hero-ring" aria-hidden="true">
          <div class="hero-ring-inner">
            <div
              v-for="(src, i) in marqueeImgs"
              :key="src"
              class="hero-ring-card"
              :style="{
                backgroundImage: `url(${src})`,
                transform: `rotateY(${i * 30}deg) translateZ(var(--ring-z))`,
              }"
            />
          </div>
        </div>
      </section>

      <!-- WORK TYPES -->
      <section id="template-list" class="templates" data-auto-hover=".tpl-card">
        <div class="tpl-inner">
          <div class="tpl-head bounce-in">
            <h2>이런 사이트를<br />만듭니다</h2>
            <p>기업 소개, 예약·문의, 쇼핑, 포트폴리오 등<br />업종에 맞는 반응형 홈페이지를 제작합니다</p>
          </div>
        </div>

        <div class="tpl-marquee bounce-in" style="--bounce-delay: 80ms">
          <div class="tpl-track">
            <article v-for="(t, i) in templateLoop" :key="`${t.name}-${i}`" class="tpl-card">
              <div class="tpl-thumb" :style="{ backgroundImage: `url(${t.img})` }" />
              <p class="tpl-meta">
                <span class="tpl-name">{{ t.name }}</span>
                <span class="tpl-tag">{{ t.tag }}</span>
              </p>
            </article>
          </div>
        </div>

        <div class="tpl-cta bounce-in" style="--bounce-delay: 140ms">
          <a class="btn-start" href="#consult" @click="openConsult">프로젝트 문의하기</a>
        </div>
      </section>

      <!-- FOCUS AREAS -->
      <section id="works" class="sec brands" data-auto-hover=".brand-card">
        <div class="sec-head light bounce-in">
          <h2>우리가<br />잘하는 일</h2>
          <a class="more" href="#services">서비스 보기</a>
        </div>
        <div class="brand-grid">
          <article
            v-for="(b, i) in brands"
            :key="b.name"
            class="brand-card bounce-in"
            :style="{ '--bounce-delay': `${80 + i * 90}ms` }"
          >
            <div class="brand-thumb" :style="{ backgroundImage: `url(${b.img})` }" />
            <h3>{{ b.title }}</h3>
            <p>
              <b>{{ b.name }}</b>
              {{ b.cat }}
            </p>
          </article>
        </div>
      </section>

      <!-- SERVICES -->
      <section id="services" class="easy" data-auto-hover=".easy-card">
        <div class="easy-rail">
          <h2 class="easy-title bounce-in">
            서비스<br />안내
          </h2>
          <div class="easy-scroller">
            <article
              v-for="(f, i) in easyFeatures"
              :key="f.title"
              class="easy-card bounce-in"
              :style="{ '--bounce-delay': `${100 + i * 100}ms` }"
            >
              <div class="easy-frame" :class="f.tone">
                <img class="easy-img" :src="f.img" :alt="f.title" />
              </div>
              <h3>{{ f.title }}</h3>
              <p v-for="line in f.lines" :key="line">{{ line }}</p>
            </article>
          </div>
        </div>
      </section>

      <!-- PROCESS -->
      <section id="process" class="sec process" data-auto-hover=".process-list > li">
        <div class="sec-head light bounce-in">
          <h2>진행 과정</h2>
          <p>문의부터 오픈까지<br />함께 진행합니다</p>
        </div>
        <ol class="process-list">
          <li
            v-for="(p, i) in processSteps"
            :key="p.step"
            class="bounce-in"
            :style="{ '--bounce-delay': `${70 + i * 80}ms` }"
          >
            <em>{{ p.step }}</em>
            <strong>{{ p.title }}</strong>
            <span>{{ p.desc }}</span>
          </li>
        </ol>
      </section>

      <!-- ABOUT -->
      <section id="systems" class="about" data-auto-hover=".about-points > li">
        <div class="about-inner">
          <div class="about-copy bounce-in">
            <p class="about-kicker">About</p>
            <h2>
              반응형 모바일 웹을 전문으로 하는<br />웹 제작사, 모든시스템즈
            </h2>
            <p>
              반응형 모바일 웹을 중심으로 홈페이지 제작·운영과
              관리자 페이지, 오픈 이후 수정·유지보수를 함께합니다.
            </p>
            <a class="btn-start" :href="`mailto:${contact.email}`">이메일로 문의하기</a>
          </div>
          <ul class="about-points">
            <li
              v-for="(a, i) in aboutPoints"
              :key="a.label"
              class="bounce-in"
              :style="{ '--bounce-delay': `${90 + i * 90}ms` }"
            >
              <em>{{ a.label }}</em>
              <strong>{{ a.value }}</strong>
            </li>
          </ul>
        </div>
      </section>

      <!-- CTA -->
      <section class="cta bounce-in">
        <h2>홈페이지·반응형 웹이 필요하시면<br />편하게 문의해 주세요</h2>
        <a class="btn-start" href="#consult" @click="openConsult">상담 문의</a>
      </section>
    </main>

    <div
      v-if="consultOpen"
      class="consult-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="consultTitle"
      @click.self="closeConsult"
    >
      <div class="consult-modal">
        <button class="consult-close" type="button" aria-label="닫기" @click="closeConsult">
          ×
        </button>
        <h2 id="consultTitle">무료 상담, 어떻게 받으실래요?</h2>
        <form class="consult-pane consult-form" @submit="submitConsult">
          <h3>번호만 남기면 먼저 연락드려요</h3>
          <label class="consult-field">
            <span>휴대폰 번호</span>
            <input
              v-model="consultForm.phone"
              type="tel"
              name="phone"
              placeholder="010-0000-0000"
              autocomplete="tel"
              required
              :disabled="consultSending"
            />
          </label>
          <fieldset class="consult-field">
            <legend>연락 받으실 방법</legend>
            <div class="consult-methods">
              <label :class="{ on: consultForm.method === 'sms' }">
                <input
                  v-model="consultForm.method"
                  type="radio"
                  name="method"
                  value="sms"
                  :disabled="consultSending"
                />
                문자
              </label>
              <label :class="{ on: consultForm.method === 'call' }">
                <input
                  v-model="consultForm.method"
                  type="radio"
                  name="method"
                  value="call"
                  :disabled="consultSending"
                />
                전화
              </label>
            </div>
          </fieldset>
          <label class="consult-field">
            <span>만들고 싶은 사이트 (선택)</span>
            <textarea
              v-model="consultForm.site"
              name="site"
              rows="2"
              placeholder="예: 시공 사례를 보여 주는 인테리어 업체 홈페이지"
              :disabled="consultSending"
            />
          </label>
          <label class="consult-field">
            <span>참고할 사이트 (있으면)</span>
            <input
              v-model="consultForm.reference"
              type="text"
              name="reference"
              placeholder="주소나 이름, 예: www.example.co.kr"
              :disabled="consultSending"
            />
          </label>
          <button class="consult-submit" type="submit" :disabled="consultSending">
            {{ consultSending ? '보내는 중…' : '동의하고 연락 받기' }}
          </button>
          <p v-if="consultStatus === 'err'" class="consult-error">
            전송에 실패했어요. 잠시 후 다시 시도해 주세요.
          </p>
          <p class="consult-note">상담은 무료예요.</p>
        </form>
      </div>
    </div>

    <footer id="company" class="footer">
      <div class="footer-inner">
        <div class="footer-nav">
          <div v-for="col in footerCols" :key="col.title" class="footer-col">
            <strong>{{ col.title }}</strong>
            <ul>
              <li v-for="link in col.links" :key="link">
                <a href="#top">{{ link }}</a>
              </li>
            </ul>
          </div>
          <div class="footer-social" aria-label="문의">
            <a :href="`mailto:${contact.email}`" aria-label="이메일">✉</a>
          </div>
        </div>

        <div class="footer-bottom">
          <div class="footer-legal">
            <p>
              상호명 : {{ contact.company }} · 이메일 :
              <a :href="`mailto:${contact.email}`">{{ contact.email }}</a>
              · 주소 : {{ contact.address }}
            </p>
            <p>
              반응형 모바일 웹 페이지 제작 전문 · 홈페이지 제작·운영 · 유지보수
            </p>
          </div>
          <div class="footer-mark">
            <p class="footer-slogan">Web Studio</p>
            <p class="footer-made">
              Made by <span class="heart" aria-hidden="true">♥</span> {{ contact.company }}
            </p>
          </div>
        </div>

        <p class="footer-copy">
          © {{ new Date().getFullYear() }} {{ contact.company }}. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.page {
  opacity: 0;
  transition: opacity 0.4s ease;
  background: #fff;
  color: #15181e;
  --ease-bounce: cubic-bezier(0.34, 1.45, 0.64, 1);
  --ease-pop: cubic-bezier(0.22, 1.7, 0.36, 1);
}
#works,
#services,
#process,
#systems,
#template-list,
#company {
  scroll-margin-top: 96px;
}
.page.ready {
  opacity: 1;
}

.bounce-in {
  opacity: 0;
  transform: translateY(28px) scale(0.94);
  transition:
    opacity 0.5s var(--ease-bounce),
    transform 0.7s var(--ease-bounce);
  transition-delay: var(--bounce-delay, 0ms);
  will-change: transform, opacity;
}
.bounce-in.is-in {
  opacity: 1;
  transform: none;
}

.cursor-pals {
  position: fixed;
  inset: 0;
  /* above header so icons pop out of the logo dot visibly */
  z-index: 35;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.35s ease;
}
.cursor-pals.on {
  opacity: 1;
}
.cursor-pal {
  position: fixed;
  top: 0;
  left: 0;
  display: grid;
  place-items: center;
  visibility: hidden;
  opacity: 0;
  will-change: transform, opacity;
  filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.12));
  transition: filter 0.3s ease;
  pointer-events: none;
}
.cursor-pals.follow .cursor-pal {
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}
.cursor-pal.svg,
.cursor-pal svg {
  width: 100%;
  height: 100%;
  display: block;
}
.cursor-pal.is-star {
  color: #fee500;
}
.cursor-pal.is-heart {
  color: #ff5a7a;
}
.cursor-pal.is-spark {
  color: #ff8a3d;
}
.cursor-pal.is-circle {
  color: #3b82f6;
}
.cursor-pal.is-moon {
  color: #8b5cf6;
}
.cursor-pal.is-bolt {
  color: #06b6d4;
}
.cursor-pal.is-diamond {
  color: #22c55e;
}
.cursor-pal.is-triangle {
  color: #f43f5e;
}
.cursor-pal.is-clover {
  color: #16a34a;
}
.cursor-pal.is-ring {
  color: #f59e0b;
}
.cursor-pal.is-follow {
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.08));
}
@media (hover: none), (pointer: coarse) {
  .cursor-pals {
    display: none;
  }
}

/* ——— HEADER (imweb: white) ——— */
.nav {
  position: fixed;
  inset: 0 0 auto;
  z-index: 30;
  height: 90px;
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 0 clamp(16px, 5vw, 48px);
  background: rgba(255, 255, 255, 0.42);
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(14px) saturate(1.2);
  -webkit-backdrop-filter: blur(14px) saturate(1.2);
  transition:
    background 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease;
}
.nav.is-down {
  background: rgba(255, 255, 255, 0.62);
  border-bottom-color: rgba(0, 0, 0, 0.06);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.brand {
  display: inline-flex;
  align-items: baseline;
  font-family: Poppins, sans-serif;
  font-weight: 700;
  font-size: 32px;
  letter-spacing: -0.04em;
  color: #191919;
  text-decoration: none;
  line-height: 1;
  flex: none;
  transform-origin: left center;
  transition: transform 0.45s var(--ease-bounce);
}
.brand:hover {
  transform: scale(1.06) rotate(-1deg);
}
.brand-dot {
  display: inline-block;
  color: #fee500;
  margin-left: 1px;
  transform-origin: center bottom;
  animation: bob-dot 1.7s var(--ease-bounce) infinite;
}
@keyframes bob-dot {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  18% {
    transform: translateY(0) scale(1.1, 0.9);
  }
  40% {
    transform: translateY(-8px) scale(0.94, 1.22);
  }
  58% {
    transform: translateY(0) scale(1.05, 0.95);
  }
  75% {
    transform: translateY(-3px) scale(0.98, 1.08);
  }
}
.brand-sub {
  margin-left: 6px;
  font-family: Poppins, sans-serif;
  font-size: 0.42em;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: #191919;
  line-height: 1;
  transform: translateY(-0.15em);
}

.nav-links {
  display: none;
}
@media (min-width: 1100px) {
  .nav-links {
    display: flex;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    gap: 64px;
    height: 90px;
    align-items: center;
  }
  .nav-links a {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 4px;
    height: 100%;
    font-size: 18px;
    font-weight: 600;
    color: #222;
    transition: color 0.2s ease;
  }
  .nav-links a::after {
    content: '';
    width: 6px;
    height: 6px;
    border-right: 1.5px solid currentColor;
    border-bottom: 1.5px solid currentColor;
    transform: rotate(45deg);
    margin-top: -4px;
    transition:
      transform 0.25s,
      margin-top 0.25s,
      border-color 0.2s ease;
  }
  .nav-links a:hover {
    color: #000;
  }
  .nav-links a:hover::after {
    margin-top: 2px;
    transform: rotate(225deg);
    border-color: #fee500;
  }
  .nav-links a::before {
    content: '';
    position: absolute;
    left: 8px;
    right: 22px;
    bottom: 28px;
    height: 3px;
    border-radius: 2px;
    background: #fee500;
    transform: scaleX(0);
    transform-origin: left center;
    transition: transform 0.25s ease;
  }
  .nav-links a:hover::before {
    transform: scaleX(1);
  }
}

.nav-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 20px;
}
.nav-toggle-slot {
  width: 36px;
  height: 40px;
}

.btn-ask {
  position: relative;
  z-index: 0;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding: 0 18px;
  border-radius: 999px;
  border: 0;
  outline: none;
  box-shadow: none;
  background: #111;
  color: #fff;
  transition:
    background 0.35s ease,
    transform 0.4s var(--ease-bounce);
}
.btn-ask:hover {
  transform: translateY(-2px) scale(1.04);
}
.btn-ask:active {
  transform: translateY(0) scale(0.94);
}
.btn-ask em {
  position: relative;
  z-index: 1;
  font-style: normal;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  transition: color 0.35s;
}
.btn-ask > span:not(.btn-ask-arrow) {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: #fee500;
  transform: translate(-50%, -50%);
  transition:
    width 0.45s,
    height 0.45s;
  z-index: 0;
  pointer-events: none;
}
.btn-ask:hover {
  background: #fee500;
  border: 0;
  outline: none;
  box-shadow: none;
  transform: translateY(-2px) scale(1.04);
}
.btn-ask:hover em {
  color: #191919;
}
.btn-ask:hover > span:not(.btn-ask-arrow) {
  width: 360px;
  height: 360px;
}
.btn-ask-arrow {
  margin-left: 6px;
}

.nav-toggle {
  position: fixed;
  top: 25px;
  right: clamp(16px, 5vw, 48px);
  z-index: 60;
  width: 36px;
  height: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  padding: 0;
  margin: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  box-sizing: border-box;
}
.nav-toggle:hover .line-a {
  width: 28px;
}
.nav-toggle:hover .line-c {
  width: 28px;
}
.nav-toggle .line {
  display: block;
  width: 28px;
  height: 3px;
  margin: 2px 0;
  background: #111;
  transform-origin: center;
  transition:
    transform 0.4s var(--ease-bounce),
    width 0.4s var(--ease-bounce),
    opacity 0.35s ease,
    background 0.35s ease;
}
.nav-toggle .line-a {
  width: 14px;
  background: #fee500;
}
.nav-toggle .line-c {
  width: 20px;
}
.nav-toggle.is-open .line {
  width: 28px !important;
  background: #111 !important;
}
.nav-toggle.is-open .line-a {
  background: #fee500 !important;
  transform: translateY(7px) rotate(45deg);
}
.nav-toggle.is-open .line-b {
  opacity: 0;
}
.nav-toggle.is-open .line-c {
  transform: translateY(-7px) rotate(-45deg);
}

:global(body.menu-open) {
  overflow: hidden;
}
.page.menu-open .nav {
  pointer-events: none;
}
.page.menu-open .nav-toggle {
  pointer-events: auto;
}

.full-menu {
  position: fixed;
  inset: 0;
  z-index: 45;
  visibility: hidden;
  pointer-events: none;
  transition: visibility 0s linear 0.55s;
}
.full-menu.is-open {
  visibility: visible;
  pointer-events: auto;
  transition: visibility 0s;
}
.full-menu-bg {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 0;
  background: #f7f7f7;
  overflow: hidden;
  transition: width 0.55s ease;
}
.full-menu.is-open .full-menu-bg {
  width: 100%;
}
.full-menu-bg::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 34%;
  background: #fee500;
}
.full-menu-panel {
  position: relative;
  z-index: 1;
  width: 100vw;
  height: 100%;
  overflow: auto;
}
.full-menu-body {
  display: flex;
  min-height: 100%;
  padding: 80px 0 48px;
  opacity: 0;
  transition: opacity 0.4s ease 0.15s;
}
.full-menu.is-open .full-menu-body {
  opacity: 1;
}
.full-menu-left {
  width: 34%;
  padding: 24px 6%;
  color: #191919;
}
.full-menu-brand {
  display: inline-flex;
  align-items: baseline;
  margin-bottom: 48px;
  font-family: Poppins, sans-serif;
  font-weight: 700;
  font-size: 32px;
  letter-spacing: -0.04em;
  color: #191919;
  text-decoration: none;
}
.full-menu-brand .brand-dot {
  color: #191919;
}
.full-menu-brand .brand-sub {
  color: #191919;
}
.full-menu-meta + .full-menu-meta {
  margin-top: 28px;
}
.full-menu-meta strong {
  display: block;
  font-size: 16px;
}
.full-menu-meta p {
  margin: 10px 0 0;
  opacity: 0.85;
  line-height: 1.6;
}
.full-menu-meta a {
  color: inherit;
}
.full-menu-meta.last {
  margin-top: 48px;
}
.full-menu-meta.last a {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 18px;
  border-radius: 999px;
  background: #191919;
  color: #fee500;
  font-weight: 700;
}
.full-menu-left .effect-y {
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity 0.55s,
    transform 0.55s;
}
.full-menu.is-open .full-menu-left .effect-y {
  opacity: 1;
  transform: none;
}
.full-menu.is-open .full-menu-left .effect-y:nth-child(2) {
  transition-delay: 0.15s;
}
.full-menu.is-open .full-menu-left .effect-y:nth-child(3) {
  transition-delay: 0.28s;
}
.full-menu.is-open .full-menu-left .effect-y:nth-child(4) {
  transition-delay: 0.4s;
}
.full-menu-right {
  width: 66%;
  padding: 24px 6%;
  color: #111;
}
.full-menu-right > ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 36px;
}
.full-menu-right > ul > li {
  position: relative;
  padding-left: 160px;
  opacity: 0;
  transform: translateX(24px);
  transition:
    opacity 0.55s,
    transform 0.55s;
}
.full-menu.is-open .full-menu-right > ul > li {
  opacity: 1;
  transform: none;
}
.full-menu.is-open .full-menu-right > ul > li:nth-child(1) {
  transition-delay: 0.25s;
}
.full-menu.is-open .full-menu-right > ul > li:nth-child(2) {
  transition-delay: 0.35s;
}
.full-menu.is-open .full-menu-right > ul > li:nth-child(3) {
  transition-delay: 0.45s;
}
.full-menu.is-open .full-menu-right > ul > li:nth-child(4) {
  transition-delay: 0.55s;
}
.full-menu-right h2 {
  position: absolute;
  left: 0;
  top: 0;
  margin: 0;
  font-size: 22px;
}
.full-menu-right > ul > li > ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 12px 22px;
}
.full-menu-right a {
  color: #666;
  font-size: 16px;
}
.full-menu-right a:hover {
  color: #111;
}

@media (max-width: 900px) {
  .full-menu-bg::before {
    display: none;
  }
  .full-menu-body {
    flex-direction: column;
    padding: 0;
  }
  .full-menu-left,
  .full-menu-right {
    width: 100%;
  }
  .full-menu-left {
    background: #fee500;
    padding: 90px 20px 20px;
  }
  .full-menu-right {
    padding: 20px;
  }
  .full-menu-right > ul > li {
    padding-left: 32%;
  }
  .full-menu-right h2 {
    font-size: 16px;
  }
  .full-menu-right a {
    font-size: 14px;
  }
}

/* ——— HERO (white, full-bleed marquee) ——— */
.hero {
  --ring-z: -88vw;
  position: relative;
  width: 100%;
  min-height: 100svh;
  padding: 130px 0 64px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
  background: #fff;
  color: #15181e;
  overflow: visible;
}

.hero-copy {
  position: relative;
  z-index: 3;
  width: min(100% - 40px, 760px);
  margin: auto;
  padding: 40px 36px 32px;
  text-align: center;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.45);
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(6px);
}
.hero-pop {
  opacity: 0;
  transform: translateY(24px) scale(0.92);
  transition:
    opacity 0.55s var(--ease-bounce),
    transform 0.75s var(--ease-pop);
}
.page.ready .hero-pop {
  opacity: 1;
  transform: none;
}

.hero-title {
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-size: clamp(40px, 7.2vw, 72px);
  font-weight: 700;
  letter-spacing: -0.045em;
  line-height: 1.12;
  color: #15181e;
}

.hero-rotator {
  position: relative;
  display: block;
  height: 1.12em;
  min-width: 5.2em;
  overflow: hidden;
}
.hero-word {
  position: absolute;
  inset: 0;
  opacity: 0;
  transform: translateY(22px) scale(0.86);
  transition:
    opacity 0.4s ease,
    transform 0.55s var(--ease-pop);
}
.hero-word.on {
  opacity: 1;
  transform: none;
}

.hero-sub {
  margin: 16px 0 0;
  font-size: clamp(16px, 2vw, 18px);
  line-height: 1.65;
  color: #374151;
}

/* full-bleed: left edge → right edge */
.hero-ring {
  position: absolute;
  left: 0;
  top: 58%;
  width: 100%;
  height: clamp(360px, 56vw, 680px);
  transform: translateY(-50%);
  perspective: 1200px;
  overflow-x: clip;
  overflow-y: visible;
  pointer-events: none;
  z-index: 1;
}
.hero-ring-inner {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  animation: spin-ring 60s linear infinite;
}
.hero-ring-card {
  position: absolute;
  inset: 0;
  margin: auto;
  width: clamp(440px, 56vw, 800px);
  height: clamp(280px, 36vw, 520px);
  border-radius: 18px;
  border: 2px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.14);
  background-size: cover;
  background-position: center;
  backface-visibility: hidden;
}
@keyframes spin-ring {
  to {
    transform: rotateY(360deg);
  }
}

.hero-kicker {
  position: relative;
  z-index: 2;
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #6b7280;
}
.hero-actions {
  position: relative;
  z-index: 3;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 28px;
}
.btn-ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  padding: 0 28px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  background: #fff;
  color: #191919;
  font-size: 15px;
  font-weight: 700;
  transition:
    background 0.25s ease,
    border-color 0.25s ease,
    transform 0.4s var(--ease-bounce);
}
.btn-ghost:hover {
  background: #f9fafb;
  border-color: #191919;
  transform: translateY(-4px) scale(1.04);
}
.btn-ghost:active {
  transform: translateY(0) scale(0.95);
}

/* ——— SECTIONS ——— */
.sec {
  padding: 88px 0;
}
.sec-head {
  width: min(100% - 40px, 1120px);
  margin: 0 auto 36px;
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: end;
}
.sec-head h2 {
  margin: 0;
  font-size: clamp(28px, 4vw, 44px);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1.25;
  color: #2a2e33;
}
.sec-head p,
.sec-head .more {
  margin: 0;
  text-align: right;
  font-size: 15px;
  line-height: 1.6;
  color: #888;
}
.sec-head.light h2 {
  color: #111;
}
.sec-head .more {
  text-decoration: underline;
  text-underline-offset: 3px;
}

.templates {
  background: #fff;
  color: #15181e;
  padding: 80px 0 120px;
  overflow: hidden;
}
.tpl-inner {
  width: min(100%, 1440px);
  margin: 0 auto;
  padding: 0 clamp(20px, 4vw, 40px);
}
.tpl-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 64px;
}
.tpl-head h2 {
  margin: 0;
  font-size: clamp(28px, 3.2vw, 36px);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.48;
  color: #15181e;
}
.tpl-head p {
  margin: 0;
  flex: none;
  text-align: left;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.75;
  color: #525961;
}
.tpl-marquee {
  overflow: hidden;
  padding: 24px 0 28px;
  margin: -12px 0 -16px;
}
.tpl-track {
  display: flex;
  gap: 16px;
  width: max-content;
  padding-left: clamp(20px, 4vw, 40px);
  animation: marquee 48s linear infinite;
}
.tpl-track:hover {
  animation-play-state: paused;
}
@keyframes marquee {
  to {
    transform: translateX(-50%);
  }
}
.tpl-card {
  width: min(72vw, 300px);
  flex: none;
  transition: transform 0.45s var(--ease-bounce);
}
.tpl-card:is(:hover, .is-auto-hover) {
  transform: translateY(-10px) scale(1.03) rotate(-0.6deg);
}
.tpl-thumb {
  height: min(58vw, 400px);
  border-radius: 16px;
  background: #f3f4f6 center / cover no-repeat;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.04);
  transition:
    transform 0.5s var(--ease-bounce),
    box-shadow 0.35s ease;
}
.tpl-card:is(:hover, .is-auto-hover) .tpl-thumb {
  transform: scale(1.05);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.12);
}
.tpl-meta {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin: 14px 0 0;
  font-size: 14px;
  line-height: 1.4;
  transition: color 0.25s ease;
}
.tpl-name {
  color: #6b7280;
  font-weight: 500;
  transition: color 0.25s ease;
}
.tpl-tag {
  color: #9ca3af;
  font-weight: 400;
}
.tpl-card:is(:hover, .is-auto-hover) .tpl-name {
  color: #191919;
}
.tpl-cta {
  display: flex;
  justify-content: center;
  margin-top: 56px;
}
.btn-start {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  padding: 0 28px;
  border-radius: 10px;
  border: 0;
  background: #1a1a1a;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  transition:
    background 0.25s ease,
    color 0.25s ease,
    transform 0.45s var(--ease-bounce),
    box-shadow 0.35s ease;
}
.btn-start:hover {
  background: #fee500;
  color: #191919;
  transform: translateY(-5px) scale(1.05);
  box-shadow: 0 12px 24px rgba(254, 229, 0, 0.35);
}
.btn-start:active {
  transform: translateY(0) scale(0.94);
  box-shadow: none;
}
@media (max-width: 767px) {
  .tpl-head {
    flex-direction: column;
    margin-bottom: 40px;
  }
  .templates {
    padding: 64px 0 88px;
  }
}

.brands {
  background: #f5f5f5;
  color: #15181e;
}
.brand-grid {
  width: min(100% - 40px, 1120px);
  margin: -8px auto -16px;
  display: grid;
  gap: 16px;
  padding: 20px 8px 28px;
}
.brand-card {
  background: #fff;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
  color: #15181e;
  transform-origin: center center;
  transition:
    transform 0.5s var(--ease-bounce),
    box-shadow 0.35s ease;
}
.brand-card:is(:hover, .is-auto-hover) {
  transform: translateY(-10px) scale(1.04);
  box-shadow: 0 22px 44px rgba(0, 0, 0, 0.12);
}
.brand-thumb {
  height: 220px;
  background: #ddd center / cover no-repeat;
}
.brand-card h3 {
  margin: 18px 18px 0;
  font-size: clamp(15px, 1.35vw, 17px);
  letter-spacing: -0.03em;
  line-height: 1.4;
  color: #15181e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.25s ease;
}
.brand-card:is(:hover, .is-auto-hover) h3 {
  color: #000;
}
.brand-card p {
  margin: 10px 18px 18px;
  font-size: 14px;
  color: #777;
}
.brand-card b {
  color: #111;
  margin-right: 8px;
}

/* ——— PROCESS ——— */
.process {
  background: #fff;
  color: #15181e;
}
.process-list {
  width: min(100% - 40px, 1120px);
  margin: 0 auto;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 14px;
}
.process-list li {
  display: grid;
  grid-template-columns: 48px 1fr;
  gap: 4px 16px;
  padding: 22px 20px;
  border-radius: 16px;
  background: #f7f7f7;
  border: 1px solid transparent;
  transition:
    transform 0.45s var(--ease-bounce),
    background 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.3s ease;
}
.process-list li:is(:hover, .is-auto-hover) {
  transform: translateY(-8px) scale(1.03);
  background: #fff;
  border-color: #fee500;
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.08);
}
.process-list em {
  grid-row: 1 / span 2;
  align-self: center;
  font-style: normal;
  font-size: 18px;
  font-weight: 800;
  color: #191919;
  transition: color 0.25s ease;
}
.process-list li:is(:hover, .is-auto-hover) em {
  color: #000;
}
.process-list strong {
  font-size: 17px;
}
.process-list span {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.55;
}
@media (min-width: 768px) {
  .process-list {
    grid-template-columns: repeat(4, 1fr);
  }
  .process-list li {
    grid-template-columns: 1fr;
  }
  .process-list em {
    grid-row: auto;
  }
}

/* ——— EASY FEATURES ——— */
.easy {
  background: #fff;
  color: #15181e;
  padding: 100px 0 120px;
}
.easy-rail {
  display: grid;
  grid-template-columns: minmax(200px, 280px) 1fr;
  gap: 40px;
  width: min(100%, 1440px);
  margin: 0 auto;
  padding: 0 clamp(20px, 4vw, 40px);
  align-items: start;
}
.easy-title {
  position: sticky;
  top: 120px;
  margin: 0;
  font-size: clamp(28px, 3.2vw, 36px);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.4;
  color: #15181e;
}
.easy-scroller {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(280px, 360px);
  gap: 48px;
  overflow-x: auto;
  overflow-y: hidden;
  /* overflow-x clips both axes — keep room for scale(1.05) on first/last cards */
  padding: 36px 48px 44px;
  margin: -20px -28px -20px;
  scroll-snap-type: x mandatory;
  scroll-padding-inline: 48px;
  -webkit-overflow-scrolling: touch;
}
.easy-card {
  scroll-snap-align: start;
  transform-origin: center center;
  transition: transform 0.5s var(--ease-bounce);
}
.easy-card:first-child {
  transform-origin: left center;
}
.easy-card:last-child {
  transform-origin: right center;
}
.easy-card:is(:hover, .is-auto-hover) {
  transform: translateY(-8px) scale(1.05);
}
.easy-card:first-child:is(:hover, .is-auto-hover) {
  transform: translateY(-8px) scale(1.05);
  transform-origin: left center;
}
.easy-frame {
  padding: 0;
  border-radius: 18px;
  background: #f3f4f6;
  margin-bottom: 22px;
  overflow: hidden;
  aspect-ratio: 4 / 3;
  transition: box-shadow 0.3s ease;
}
.easy-card:is(:hover, .is-auto-hover) .easy-frame {
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.14);
}
.easy-frame.design {
  background: #eceff3;
}
.easy-frame.ops {
  background: #f0ece6;
}
.easy-frame.mkt {
  background: #e8eef3;
}
.easy-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.easy-card h3 {
  margin: 0 0 10px;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.easy-card p {
  margin: 0;
  font-size: 15px;
  line-height: 1.6;
  color: #6b7280;
}

/* ——— ABOUT ——— */
.about {
  background: #f7f7f7;
  color: #15181e;
  padding: 88px 0;
}
.about-inner {
  width: min(100% - 40px, 1120px);
  margin: 0 auto;
  display: grid;
  gap: 40px;
}
.about-kicker {
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #8b919a;
}
.about-copy h2 {
  margin: 0 0 16px;
  font-size: clamp(28px, 3.6vw, 40px);
  letter-spacing: -0.035em;
  line-height: 1.3;
}
.about-copy p {
  margin: 0 0 28px;
  max-width: 36em;
  font-size: 16px;
  line-height: 1.7;
  color: #525961;
}
.about-points {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 12px;
}
.about-points li {
  padding: 20px 22px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.04);
  transition:
    transform 0.45s var(--ease-bounce),
    border-color 0.25s ease,
    box-shadow 0.3s ease;
}
.about-points li:is(:hover, .is-auto-hover) {
  transform: translateY(-8px) scale(1.04);
  border-color: #fee500;
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.08);
}
.about-points em {
  display: block;
  margin-bottom: 8px;
  font-style: normal;
  font-size: 13px;
  color: #8b919a;
}
.about-points strong {
  font-size: 18px;
  letter-spacing: -0.02em;
}

.cta {
  min-height: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
  text-align: center;
  padding: 80px 20px;
  background: #f7f7f7;
  color: #15181e;
}
.cta h2 {
  margin: 0;
  font-size: clamp(26px, 4vw, 40px);
  letter-spacing: -0.04em;
  line-height: 1.35;
}

/* ——— FOOTER ——— */
.footer {
  background: #fff;
  color: #15181e;
  border-top: 1px solid #eee;
  padding: 64px 0 48px;
}
.footer-inner {
  width: min(100%, 1440px);
  margin: 0 auto;
  padding: 0 clamp(20px, 4vw, 40px);
}
.footer-nav {
  display: grid;
  grid-template-columns: repeat(5, 1fr) auto;
  gap: 28px 20px;
  padding-bottom: 40px;
  border-bottom: 1px solid #eee;
}
.footer-col strong {
  display: block;
  margin-bottom: 16px;
  font-size: 15px;
}
.footer-col ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 10px;
}
.footer-col a {
  font-size: 14px;
  color: #6b7280;
  transition: color 0.2s ease;
}
.footer-col a:hover {
  color: #15181e;
}
.footer-social {
  display: flex;
  gap: 10px;
  align-items: start;
}
.footer-social a {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid #e5e7eb;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: #444;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    transform 0.4s var(--ease-bounce);
}
.footer-social a:hover {
  background: #fee500;
  border-color: #fee500;
  color: #191919;
  transform: translateY(-4px) scale(1.12) rotate(-8deg);
}
.footer-bottom {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  padding-top: 28px;
  align-items: end;
}
.footer-legal {
  max-width: 820px;
}
.footer-legal p {
  margin: 0 0 8px;
  font-size: 12px;
  line-height: 1.7;
  color: #9ca3af;
}
.footer-legal a {
  color: #6b7280;
  margin-right: 10px;
}
.footer-mark {
  text-align: right;
}
.footer-slogan {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #374151;
}
.footer-made {
  margin: 8px 0 0;
  font-size: 13px;
  color: #9ca3af;
}
.footer-copy {
  margin: 24px 0 0;
  padding-top: 20px;
  border-top: 1px solid #eee;
  font-size: 12px;
  color: #9ca3af;
}
.heart {
  color: #ef4444;
}

.consult-overlay {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(17, 17, 17, 0.45);
  backdrop-filter: blur(4px);
}
.consult-modal {
  position: relative;
  width: min(480px, 100%);
  max-height: min(90vh, 720px);
  overflow: auto;
  padding: 28px 28px 24px;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.22);
}
.consult-close {
  position: absolute;
  top: 14px;
  right: 16px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 24px;
  line-height: 1;
  color: #6b7280;
}
.consult-close:hover {
  background: #f3f4f6;
  color: #111;
}
.consult-modal > h2 {
  margin: 0 40px 20px 0;
  font-size: clamp(20px, 2.4vw, 26px);
  font-weight: 700;
  letter-spacing: -0.03em;
  color: #15181e;
}
.consult-pane {
  padding: 4px 0 0;
}
.consult-pane h3 {
  margin: 0 0 14px;
  font-size: 16px;
  font-weight: 700;
  color: #191919;
}
.consult-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.consult-field {
  display: grid;
  gap: 6px;
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 13px;
  font-weight: 600;
  color: #4b5563;
}
.consult-field span,
.consult-field legend {
  padding: 0;
}
.consult-field input[type='tel'],
.consult-field input[type='text'],
.consult-field textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
  font: inherit;
  font-weight: 500;
  color: #191919;
  resize: vertical;
}
.consult-field input:focus,
.consult-field textarea:focus {
  outline: 2px solid #fee500;
  border-color: #fee500;
}
.consult-methods {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.consult-methods label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
}
.consult-methods label.on {
  border-color: #191919;
  color: #191919;
}
.consult-methods input {
  accent-color: #191919;
}
.consult-submit {
  display: flex;
  width: 100%;
  margin-top: 20px;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  border-radius: 12px;
  background: #191919;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  transition:
    background 0.25s var(--ease-bounce),
    transform 0.25s var(--ease-bounce);
}
.consult-submit:hover {
  background: #fee500;
  color: #191919;
  transform: translateY(-2px);
}
.consult-note {
  margin-top: 4px !important;
  font-size: 13px !important;
  color: #9ca3af !important;
  text-align: center;
}
.consult-error {
  margin: 0 !important;
  font-size: 13px !important;
  color: #dc2626 !important;
  text-align: center;
}
.consult-submit:disabled {
  opacity: 0.7;
  cursor: wait;
  transform: none;
}

@media (min-width: 768px) {
  .brand-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 767px) {
  .brand-card h3 {
    white-space: normal;
  }
}
@media (max-width: 1100px) {
  .footer-nav {
    grid-template-columns: repeat(3, 1fr);
  }
  .footer-social {
    grid-column: 1 / -1;
  }
}
@media (max-width: 900px) {
  .easy-rail {
    grid-template-columns: 1fr;
  }
  .easy-title {
    position: static;
  }
  .about-inner {
    grid-template-columns: 1fr;
  }
}
@media (min-width: 901px) {
  .about-inner {
    grid-template-columns: 1.3fr 0.9fr;
    align-items: center;
  }
}
@media (max-width: 767px) {
  .brand {
    font-size: 26px;
  }
  .nav {
    height: 72px;
  }
  .nav-toggle {
    top: 16px;
  }
  .sec-head {
    flex-direction: column;
    align-items: flex-start;
  }
  .sec-head p,
  .sec-head .more {
    text-align: left;
  }
  .hero {
    --ring-z: -110vw;
  }
  .footer-nav {
    grid-template-columns: 1fr 1fr;
  }
  .footer-bottom {
    flex-direction: column;
    align-items: flex-start;
  }
  .footer-mark {
    text-align: left;
  }
}
</style>
