import LogInView from '@/views/LogInView.vue'
import MainView from '@/views/MainView.vue'
import RecipeBookView from '@/views/RecipeBookView.vue'
import RecipeEditView from '@/views/RecipeEditView.vue'
import RecipeView from '@/views/RecipeView.vue'
import SignInView from '@/views/SignInView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: MainView,
      redirect: '/recipe-book',
      children: [
        {
          path: 'recipe-book',
          component: RecipeBookView,
        },
        {
          path: 'recipe',
          component: RecipeView,
        },
        {
          path: 'recipe/edit',
          component: RecipeEditView,
        },
      ],
    },
    {
      path: '/signin',
      component: SignInView,
    },
    {
      path: '/login',
      component: LogInView,
    },
  ],
})

export default router
