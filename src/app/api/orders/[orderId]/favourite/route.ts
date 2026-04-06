import { NextResponse } from 'next/server'
import { deleteOrderFavourite, upsertOrderFavourite } from '@/server/order-favourites/mutations'

type UpdateOrderFavouriteRequest = {
    is_favourite?: boolean
}

type RouteParams = {
    params: Promise<{
        orderId: string
    }>
}

export async function PATCH(request: Request, { params }: RouteParams) {
    try {
        const { orderId } = await params
        const body = (await request.json()) as UpdateOrderFavouriteRequest

        if (!orderId) {
            return NextResponse.json({ error: 'Missing orderId.' }, { status: 400 })
        }

        if (typeof body.is_favourite !== 'boolean') {
            return NextResponse.json({ error: 'Field "is_favourite" must be a boolean.' }, { status: 400 })
        }

        if (body.is_favourite) {
            const favourite = await upsertOrderFavourite(orderId)
            return NextResponse.json({ favourite }, { status: 200 })
        }

        await deleteOrderFavourite(orderId)
        return NextResponse.json({ favourite: null }, { status: 200 })
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown server error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
