import { OrdersPageClient } from '@/app/orders-page-client'
import { getOrders } from '@/server/orders/queries'

export default async function Home() {
  const orders = await getOrders()

  return <OrdersPageClient initialOrders={orders} />
}
