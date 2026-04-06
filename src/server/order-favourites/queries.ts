import { supabaseServerClient } from '@/app/lib/supabase/server'

export type OrderFavouriteRecord = {
    order_id: string
}

export async function getOrderFavouritesByOrderIds(orderIds: string[]): Promise<OrderFavouriteRecord[]> {
    if (orderIds.length === 0) {
        return []
    }

    const { data, error } = await supabaseServerClient
        .from('order_favorites')
        .select('order_id')
        .in('order_id', orderIds)

    if (error) {
        throw new Error(`Failed to fetch order favourites from Supabase: ${error.message}`)
    }

    return (data ?? []) as OrderFavouriteRecord[]
}
