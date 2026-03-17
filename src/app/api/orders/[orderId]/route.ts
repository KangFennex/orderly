import { NextResponse } from 'next/server'
import { updateOrderInDatabase } from '@/server/orders/mutations'
import type { Order } from '@/app/types/orders'

type UpdateOrderRequest = {
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

type RouteParams = {
    params: Promise<{
        orderId: string
    }>
}

export async function PATCH(request: Request, { params }: RouteParams) {
    try {
        const { orderId } = await params
        const body = (await request.json()) as UpdateOrderRequest

        if (!orderId) {
            return NextResponse.json({ error: 'Missing orderId.' }, { status: 400 })
        }

        const allowedStatuses: Order['status'][] = ['pending', 'picking', 'shipped', 'backorder', 'cancelled']

        if (body.status && !allowedStatuses.includes(body.status)) {
            return NextResponse.json({ error: 'Invalid status value.' }, { status: 400 })
        }

        const updatePayload: {
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
        } = {}

        if ('oa_number' in body) {
            updatePayload.oa_number = body.oa_number?.trim() || null
        }

        if ('account_name' in body) {
            updatePayload.account_name = body.account_name?.trim() || null
        }

        if ('client_po' in body) {
            updatePayload.client_po = body.client_po?.trim() || null
        }

        if ('order_date' in body) {
            updatePayload.order_date = body.order_date || null
        }

        if ('req_pick_date' in body) {
            updatePayload.req_pick_date = body.req_pick_date || null
        }

        if ('req_ship_date' in body) {
            updatePayload.req_ship_date = body.req_ship_date || null
        }

        if ('req_del_date' in body) {
            updatePayload.req_del_date = body.req_del_date || null
        }

        if ('wh_pick_date' in body) {
            updatePayload.wh_pick_date = body.wh_pick_date || null
        }

        if ('wh_ship_date' in body) {
            updatePayload.wh_ship_date = body.wh_ship_date || null
        }

        if ('wh_del_date' in body) {
            updatePayload.wh_del_date = body.wh_del_date || null
        }

        if ('status' in body && body.status) {
            updatePayload.status = body.status
        }

        if (Object.keys(updatePayload).length === 0) {
            return NextResponse.json({ error: 'No valid fields provided to update.' }, { status: 400 })
        }

        const order = await updateOrderInDatabase(orderId, updatePayload)

        return NextResponse.json({ order }, { status: 200 })
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown server error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
