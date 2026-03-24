import { supabaseServerClient } from '@/app/lib/supabase/server'

export type OrderNoteRecord = {
    order_id: string
    note: string
}

export async function getOrderNotesByOrderIds(orderIds: string[]): Promise<OrderNoteRecord[]> {
    if (orderIds.length === 0) {
        return []
    }

    const { data, error } = await supabaseServerClient
        .from('order_notes')
        .select('order_id, note')
        .in('order_id', orderIds)

    if (error) {
        throw new Error(`Failed to fetch order notes from Supabase: ${error.message}`)
    }

    return (data ?? []) as OrderNoteRecord[]
}
