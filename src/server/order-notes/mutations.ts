import { supabaseServerClient } from '@/app/lib/supabase/server'
import type { OrderNoteRecord } from './queries'

export async function upsertOrderNote(orderId: string, note: string): Promise<OrderNoteRecord> {
    const { data, error } = await supabaseServerClient
        .from('order_notes')
        .upsert(
            {
                order_id: orderId,
                note,
                updated_at: new Date().toISOString(),
            },
            {
                onConflict: 'order_id',
            },
        )
        .select('order_id, note')
        .single()

    if (error) {
        throw new Error(`Failed to save order note to Supabase: ${error.message}`)
    }

    return data as OrderNoteRecord
}
