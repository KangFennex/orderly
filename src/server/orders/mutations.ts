import { supabaseServerClient } from '@/app/lib/supabase/server'
import type { Order } from '@/app/types/orders'

type CreateOrderInput = {
    oa_number: string | null
    account_code: string
    account_name: string | null
    client_po: string | null
    order_date: string | null
    req_pick_date: string | null
    req_ship_date: string | null
    req_del_date: string | null
    wh_pick_date: string | null
    wh_ship_date: string | null
    wh_del_date: string | null
    status: Order['status']
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
    const { data, error } = await supabaseServerClient
        .from('orders')
        .insert(input)
        .select(
            'id, oa_number, account_code, account_name, client_po, order_date, req_pick_date, req_ship_date, req_del_date, wh_pick_date, wh_ship_date, wh_del_date, status, created_at',
        )
        .single()

    if (error) {
        throw new Error(`Failed to create order in Supabase: ${error.message}`)
    }

    return data as Order
}

export async function updateOrderStatusInDatabase(orderId: string, status: Order['status']): Promise<Order> {
    const { data, error } = await supabaseServerClient
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select(
            'id, oa_number, account_code, account_name, client_po, order_date, req_pick_date, req_ship_date, req_del_date, wh_pick_date, wh_ship_date, wh_del_date, status, created_at',
        )
        .single()

    if (error) {
        throw new Error(`Failed to update order status in Supabase: ${error.message}`)
    }

    return data as Order
}

type UpdateOrderInput = {
    oa_number?: string | null
    account_name?: string | null
    client_po?: string | null
    order_date?: string | null
    req_pick_date?: string | null
    req_ship_date?: string | null
    req_del_date?: string | null
    wh_pick_date?: string | null
    wh_ship_date?: string | null
    wh_del_date?: string | null
    status?: Order['status']
}

export async function updateOrderInDatabase(orderId: string, input: UpdateOrderInput): Promise<Order> {
    const { data, error } = await supabaseServerClient
        .from('orders')
        .update(input)
        .eq('id', orderId)
        .select(
            'id, oa_number, account_code, account_name, client_po, order_date, req_pick_date, req_ship_date, req_del_date, wh_pick_date, wh_ship_date, wh_del_date, status, created_at',
        )
        .single()

    if (error) {
        throw new Error(`Failed to update order in Supabase: ${error.message}`)
    }

    return data as Order
}
