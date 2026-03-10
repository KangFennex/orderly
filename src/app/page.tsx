import { OrdersPageClient } from '@/app/orders-page-client'
import { supabaseServerClient } from '@/app/lib/supabase/server'
import type { Order } from '@/app/types/orders'

async function fetchOrdersFromSupabase(): Promise<Order[]> {
  const { data, error } = await supabaseServerClient
    .from('orders')
    .select(
      'id, oa_number, account_code, account_name, client_po, order_date, req_pick_date, req_ship_date, req_del_date, wh_pick_date, wh_ship_date, wh_del_date, status, created_at',
    )
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch orders from Supabase: ${error.message}`)
  }

  return (data ?? []) as Order[]
}

export default async function Home() {
  const orders = await fetchOrdersFromSupabase()

  return <OrdersPageClient initialOrders={orders} />
}
