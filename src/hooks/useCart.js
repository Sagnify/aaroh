import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export function useCart() {
  const [cartCount, setCartCount] = useState(0)
  const { data: session } = useSession()

  const fetchCartCount = async () => {
    if (!session?.user) {
      setCartCount(0)
      return
    }

    try {
      const response = await fetch('/api/shop/cart')
      const data = await response.json()
      setCartCount(data.cart?.items?.length || 0)
    } catch (error) {
      console.error('Error fetching cart count:', error)
      setCartCount(0)
    }
  }

  useEffect(() => {
    fetchCartCount()
  }, [session])

  return { cartCount, refreshCart: fetchCartCount }
}