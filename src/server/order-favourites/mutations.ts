import { supabaseServerClient } from '@/app/lib/supabase/server'
import type { OrderFavouriteRecord } from './queries'

export async function upsertOrderFavourite(orderId: string): Promise<OrderFavouriteRecord> {
    const { data, error } = await supabaseServerClient
        .from('order_favorites')
        .upsert(
            {
                order_id: orderId,
            },
            {
                onConflict: 'order_id',
            },
        )
        .select('order_id')
        .single()

    if (error) {
        throw new Error(`Failed to save order favourite to Supabase: ${error.message}`)
    }

    return data as OrderFavouriteRecord
}

export async function deleteOrderFavourite(orderId: string): Promise<void> {
    const { error } = await supabaseServerClient
        .from('order_favorites')
        .delete()
        .eq('order_id', orderId)

    if (error) {
        throw new Error(`Failed to remove order favourite from Supabase: ${error.message}`)
    }
}
