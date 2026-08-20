const SUPER_ADMIN_ONLY_PATHS = ['/businesses', '/settings']

export default defineNuxtRouteMiddleware((to) => {
  if (to.path === '/login' || to.path === '/bootstrap') return

  const { loggedIn, user } = useUserSession()

  if (!loggedIn.value) {
    return navigateTo('/login')
  }

  if (user.value?.businessId && SUPER_ADMIN_ONLY_PATHS.some(path => to.path.startsWith(path))) {
    return navigateTo('/')
  }
})
