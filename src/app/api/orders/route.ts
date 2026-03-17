import { NextResponse } from 'next/server'
import { createOrder } from '@/server/orders/mutations'
import type { Order } from '@/app/types/orders'

type CreateOrderRequest = {
    oa_number?: string | null
    account_code: string
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

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as CreateOrderRequest

        if (!body.account_code?.trim()) {
            return NextResponse.json({ error: 'Account Code is required.' }, { status: 400 })
        }

        const order = await createOrder({
            oa_number: body.oa_number?.trim() || null,
            account_code: body.account_code.trim(),
            account_name: body.account_name?.trim() || null,
            client_po: body.client_po?.trim() || null,
            order_date: body.order_date || null,
            req_pick_date: body.req_pick_date || null,
            req_ship_date: body.req_ship_date || null,
            req_del_date: body.req_del_date || null,
            wh_pick_date: body.wh_pick_date || null,
            wh_ship_date: body.wh_ship_date || null,
            wh_del_date: body.wh_del_date || null,
            status: body.status ?? 'pending',
        })

        return NextResponse.json({ order }, { status: 201 })
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown server error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
