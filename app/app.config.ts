export default defineAppConfig({
  ui: {
    colors: {
      primary: 'orange',
      neutral: 'slate'
    },
    card: {
      slots: {
        root: 'rounded-2xl ring-1 ring-default shadow-sm'
      }
    },
    button: {
      slots: {
        base: 'rounded-xl font-medium'
      }
    },
    badge: {
      slots: {
        base: 'rounded-lg'
      }
    }
  }
})
