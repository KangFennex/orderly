import { NextResponse } from 'next/server'
import { upsertOrderNote } from '@/server/order-notes/mutations'

type UpdateOrderNoteRequest = {
    note?: string
}

type RouteParams = {
    params: Promise<{
        orderId: string
    }>
}

export async function PATCH(request: Request, { params }: RouteParams) {
    try {
        const { orderId } = await params
        const body = (await request.json()) as UpdateOrderNoteRequest

        if (!orderId) {
            return NextResponse.json({ error: 'Missing orderId.' }, { status: 400 })
        }

        if (typeof body.note !== 'string') {
            return NextResponse.json({ error: 'Field "note" must be a string.' }, { status: 400 })
        }

        const note = await upsertOrderNote(orderId, body.note)

        return NextResponse.json({ note }, { status: 200 })
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown server error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
