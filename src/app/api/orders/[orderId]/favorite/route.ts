import { NextResponse } from 'next/server'
import { deleteOrderFavorite, upsertOrderFavorite } from '@/server/order-favorites/mutations'

type UpdateOrderFavoriteRequest = {
    is_favorite?: boolean
}

type RouteParams = {
    params: Promise<{
        orderId: string
    }>
}

export async function PATCH(request: Request, { params }: RouteParams) {
    try {
        const { orderId } = await params
        const body = (await request.json()) as UpdateOrderFavoriteRequest

        if (!orderId) {
            return NextResponse.json({ error: 'Missing orderId.' }, { status: 400 })
        }

        if (typeof body.is_favorite !== 'boolean') {
            return NextResponse.json({ error: 'Field "is_favorite" must be a boolean.' }, { status: 400 })
        }

        if (body.is_favorite) {
            const favorite = await upsertOrderFavorite(orderId)
            return NextResponse.json({ favorite }, { status: 200 })
        }

        await deleteOrderFavorite(orderId)
        return NextResponse.json({ favorite: null }, { status: 200 })
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown server error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
