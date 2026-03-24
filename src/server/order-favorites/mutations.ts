import { supabaseServerClient } from '@/app/lib/supabase/server'
import type { OrderFavoriteRecord } from './queries'

export async function upsertOrderFavorite(orderId: string): Promise<OrderFavoriteRecord> {
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
        throw new Error(`Failed to save order favorite to Supabase: ${error.message}`)
    }

    return data as OrderFavoriteRecord
}

export async function deleteOrderFavorite(orderId: string): Promise<void> {
    const { error } = await supabaseServerClient
        .from('order_favorites')
        .delete()
        .eq('order_id', orderId)

    if (error) {
        throw new Error(`Failed to remove order favorite from Supabase: ${error.message}`)
    }
}
