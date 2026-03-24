import { supabaseServerClient } from '@/app/lib/supabase/server'

export type OrderFavoriteRecord = {
    order_id: string
}

export async function getOrderFavoritesByOrderIds(orderIds: string[]): Promise<OrderFavoriteRecord[]> {
    if (orderIds.length === 0) {
        return []
    }

    const { data, error } = await supabaseServerClient
        .from('order_favorites')
        .select('order_id')
        .in('order_id', orderIds)

    if (error) {
        throw new Error(`Failed to fetch order favorites from Supabase: ${error.message}`)
    }

    return (data ?? []) as OrderFavoriteRecord[]
}
