import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import PrivacyView from '@/views/PrivacyView.vue'

const DEFAULT_TITLE = '모든시스템즈 | 반응형 홈페이지·모바일 웹 제작'
const DEFAULT_DESCRIPTION =
  '모든시스템즈 · 반응형 홈페이지·모바일 웹 제작·운영·유지보수.'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        title: DEFAULT_TITLE,
        description: DEFAULT_DESCRIPTION,
      },
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: PrivacyView,
      meta: {
        title: '개인정보처리방침 | 모든시스템즈',
        description: '모든시스템즈 개인정보 수집·이용 및 처리방침 안내.',
      },
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

router.afterEach((to) => {
  const title = typeof to.meta.title === 'string' ? to.meta.title : DEFAULT_TITLE
  document.title = title

  const description =
    typeof to.meta.description === 'string'
      ? to.meta.description
      : DEFAULT_DESCRIPTION
  let descTag = document.querySelector('meta[name="description"]')
  if (!descTag) {
    descTag = document.createElement('meta')
    descTag.setAttribute('name', 'description')
    document.head.appendChild(descTag)
  }
  descTag.setAttribute('content', description)
})

export default router
