declare module '#auth-utils' {
  interface User {
    id: number
    name: string
    email: string
    businessId: number | null
    businessName: string | null
  }
}

export {}
