<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

/** Public assets under Vite `base` (e.g. /mdsys/ on GitHub Pages). */
function asset(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
}

const menuOpen = ref(false)
const scrolled = ref(false)
const ready = ref(false)
const heroWord = ref(0)

const contact = {
  company: '모든시스템즈',
  email: 'allsys2687@gmail.com',
  address: '부산광역시 연제구 고분로112번길 23, 현대아파트 102동 109호',
}

const navLinks = [
  { label: '서비스', href: '#services' },
  { label: '포트폴리오', href: '#template-list' },
  { label: '과정', href: '#process' },
  { label: '회사', href: '#company' },
]

const menuGroups = [
  {
    title: '서비스',
    links: [
      { label: '반응형 모바일 웹', href: '#services' },
      { label: '홈페이지 제작·운영', href: '#services' },
      { label: '관리자 페이지', href: '#services' },
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
    title: '과정',
    links: [{ label: '제작 과정', href: '#process' }],
  },
  {
    title: '회사',
    links: [
      { label: '사업자 정보', href: '#company' },
      { label: '상담 문의', href: 'mailto:allsys2687@gmail.com' },
    ],
  },
]

/** hero rotating words */
const heroWords = ['기업을', '매장을', '브랜드를']

const marqueeImgs = Array.from(
  { length: 12 },
  (_, i) => `https://static-v2.imweb.me/io/home/ai-marquee-img-${i + 1}.png`,
)

const templates = [
  { name: '기업 소개', tag: '반응형 웹', img: 'https://static-v2.imweb.me/io/home/business-template-1.png' },
  { name: '쇼핑몰', tag: '모바일 커머스', img: 'https://static-v2.imweb.me/io/home/shopping-template-1.png' },
  { name: '예약·문의', tag: '서비스 사이트', img: 'https://static-v2.imweb.me/io/home/reservation-template-1.png' },
  { name: '포트폴리오', tag: '에이전시', img: 'https://static-v2.imweb.me/io/home/portfolio-template-1.png' },
  { name: '커뮤니티', tag: '회원·게시판', img: 'https://static-v2.imweb.me/io/home/community-template-1.png' },
  { name: '브랜드 스토어', tag: '반응형 웹', img: 'https://static-v2.imweb.me/io/home/shopping-template-2.png' },
  { name: '비즈니스', tag: '기업 홈페이지', img: 'https://static-v2.imweb.me/io/home/business-template-2.png' },
  { name: '미디어', tag: '블로그·뉴스', img: 'https://static-v2.imweb.me/io/home/blog-template-1.png' },
  { name: '이벤트', tag: '랜딩 페이지', img: 'https://static-v2.imweb.me/io/home/event-template-1.png' },
  { name: '카탈로그', tag: '제품 소개', img: 'https://static-v2.imweb.me/io/home/business-template-3.png' },
  { name: '제품 소개', tag: '모바일 웹', img: 'https://static-v2.imweb.me/io/home/shopping-template-3.png' },
  { name: '브랜드', tag: '반응형 웹', img: 'https://static-v2.imweb.me/io/home/portfolio-template-2.png' },
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
    title: '과정',
    links: ['상담·요구사항', '견적·일정', '제작·구축', '검수·오픈'],
  },
  {
    title: '회사',
    links: ['사업자 정보', '상담 문의'],
  },
]

let menuCloseTimer = 0
let heroTimer = 0

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
  if (event.key === 'Escape') closeMenu()
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
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  document.removeEventListener('keydown', onKeydown)
  window.clearTimeout(menuCloseTimer)
  window.clearInterval(heroTimer)
  document.body.classList.remove('menu-open')
})
</script>

<template>
  <div class="page" :class="{ ready, 'menu-open': menuOpen }">
    <!-- ===== KEEP: header ===== -->
    <header class="nav on-hero" :class="{ 'is-down': scrolled }">
      <a class="brand" href="#top" @click="closeMenu" aria-label="모든시스템즈">
        moden<span class="brand-dot">.</span><span class="brand-sub">systems</span>
      </a>

      <nav class="nav-links" aria-label="주요 메뉴">
        <a v-for="item in navLinks" :key="item.href" :href="item.href">{{ item.label }}</a>
      </nav>

      <div class="nav-actions">
        <div class="nav-asks">
          <a
            class="btn-ask"
            :href="`mailto:${contact.email}`"
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
                <a :href="`mailto:${contact.email}`" @click="closeMenu"
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
        <div class="hero-copy">
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
            <a class="btn-start" :href="`mailto:${contact.email}`">상담 문의</a>
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
      <section id="template-list" class="templates">
        <div class="tpl-inner">
          <div class="tpl-head">
            <h2>이런 사이트를<br />만듭니다</h2>
            <p>기업 소개, 예약·문의, 쇼핑, 포트폴리오 등<br />업종에 맞는 반응형 홈페이지를 제작합니다</p>
          </div>
        </div>

        <div class="tpl-marquee">
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

        <div class="tpl-cta">
          <a class="btn-start" :href="`mailto:${contact.email}`">프로젝트 문의하기</a>
        </div>
      </section>

      <!-- FOCUS AREAS -->
      <section class="sec brands">
        <div class="sec-head light">
          <h2>우리가<br />잘하는 일</h2>
          <a class="more" href="#services">서비스 보기</a>
        </div>
        <div class="brand-grid">
          <article v-for="b in brands" :key="b.name" class="brand-card">
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
      <section id="services" class="easy">
        <div class="easy-rail">
          <h2 class="easy-title">
            서비스<br />안내
          </h2>
          <div class="easy-scroller">
            <article v-for="f in easyFeatures" :key="f.title" class="easy-card">
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
      <section id="process" class="sec process">
        <div class="sec-head light">
          <h2>진행 과정</h2>
          <p>문의부터 오픈까지<br />함께 진행합니다</p>
        </div>
        <ol class="process-list">
          <li v-for="p in processSteps" :key="p.step">
            <em>{{ p.step }}</em>
            <strong>{{ p.title }}</strong>
            <span>{{ p.desc }}</span>
          </li>
        </ol>
      </section>

      <!-- ABOUT -->
      <section id="systems" class="about">
        <div class="about-inner">
          <div class="about-copy">
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
            <li v-for="a in aboutPoints" :key="a.label">
              <em>{{ a.label }}</em>
              <strong>{{ a.value }}</strong>
            </li>
          </ul>
        </div>
      </section>

      <!-- CTA -->
      <section class="cta">
        <h2>홈페이지·반응형 웹이 필요하시면<br />편하게 문의해 주세요</h2>
        <a class="btn-start" :href="`mailto:${contact.email}`">상담 문의</a>
      </section>
    </main>

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
}
.page.ready {
  opacity: 1;
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
  background: #fff;
  border-bottom: 1px solid #eee;
  transition: box-shadow 0.25s ease;
}
.nav.is-down {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
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
}
.brand-dot {
  color: #fee500;
  margin-left: 1px;
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
    gap: 36px;
    height: 90px;
    align-items: center;
  }
  .nav-links a {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 8px;
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
  transition: background 0.35s ease;
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
.nav-toggle .line {
  display: block;
  width: 28px;
  height: 3px;
  margin: 2px 0;
  background: #111;
  transform-origin: center;
  transition:
    transform 0.35s ease,
    width 0.35s ease,
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
  --ring-z: -56vw;
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
  margin: 0 auto;
  padding: 40px 36px 32px;
  text-align: center;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.45);
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(6px);
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
  transform: translateY(18px);
  transition:
    opacity 0.45s ease,
    transform 0.45s ease;
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
  top: 48%;
  width: 100%;
  height: clamp(180px, 28vw, 340px);
  perspective: 880px;
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
  width: clamp(220px, 28vw, 400px);
  height: clamp(140px, 18vw, 260px);
  border-radius: 14px;
  border: 2px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
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
    transform 0.25s ease;
}
.btn-ghost:hover {
  background: #f9fafb;
  border-color: #191919;
  transform: translateY(-2px);
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
  transition: transform 0.3s ease;
}
.tpl-card:hover {
  transform: translateY(-6px);
}
.tpl-thumb {
  height: min(58vw, 400px);
  border-radius: 16px;
  background: #f3f4f6 center / cover no-repeat;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.04);
  transition:
    transform 0.35s ease,
    box-shadow 0.35s ease;
}
.tpl-card:hover .tpl-thumb {
  transform: scale(1.02);
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
.tpl-card:hover .tpl-name {
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
    transform 0.25s ease;
}
.btn-start:hover {
  background: #fee500;
  color: #191919;
  transform: translateY(-2px);
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
  margin: 0 auto;
  display: grid;
  gap: 16px;
}
.brand-card {
  background: #fff;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
  color: #15181e;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}
.brand-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.1);
}
.brand-thumb {
  height: 220px;
  background: #ddd center / cover no-repeat;
  transition: transform 0.4s ease;
}
.brand-card:hover .brand-thumb {
  transform: scale(1.04);
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
.brand-card:hover h3 {
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
    transform 0.25s ease,
    background 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease;
}
.process-list li:hover {
  transform: translateY(-4px);
  background: #fff;
  border-color: #fee500;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.06);
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
.process-list li:hover em {
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
  padding-bottom: 12px;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}
.easy-card {
  scroll-snap-align: start;
  transition: transform 0.3s ease;
}
.easy-card:hover {
  transform: translateY(-6px);
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
.easy-card:hover .easy-frame {
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.12);
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
  transition: transform 0.4s ease;
}
.easy-card:hover .easy-img {
  transform: scale(1.03);
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
    transform 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease;
}
.about-points li:hover {
  transform: translateY(-4px);
  border-color: #fee500;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.06);
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
    color 0.2s ease;
}
.footer-social a:hover {
  background: #fee500;
  border-color: #fee500;
  color: #191919;
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
    --ring-z: -72vw;
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
