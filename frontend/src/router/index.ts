import LogIn from '@/components/LogIn.vue'
import SignIn from '@/components/signin.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [{
    path: "/",
    redirect: "/signin"
  },
  {
    path: "/signin",
    component: SignIn
  },
  {
    path: "/login",
    component: LogIn
  }
],
})

export default router
