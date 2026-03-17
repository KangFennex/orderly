import { NextResponse } from 'next/server'
import { updateOrderStatusInDatabase } from '@/server/orders/mutations'
import type { Order } from '@/app/types/orders'

type UpdateOrderStatusRequest = {
    status: Order['status']
}

type RouteParams = {
    params: Promise<{
        orderId: string
    }>
}

export async function PATCH(request: Request, { params }: RouteParams) {
    try {
        const { orderId } = await params
        const body = (await request.json()) as UpdateOrderStatusRequest

        if (!orderId || !body.status) {
            return NextResponse.json({ error: 'Missing orderId or status.' }, { status: 400 })
        }

        const allowedStatuses: Order['status'][] = ['pending', 'picking', 'shipped', 'backorder', 'cancelled']

        if (!allowedStatuses.includes(body.status)) {
            return NextResponse.json({ error: 'Invalid status value.' }, { status: 400 })
        }

        const order = await updateOrderStatusInDatabase(orderId, body.status)
        return NextResponse.json({ order }, { status: 200 })
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown server error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
