import { NextResponse } from 'next/server'
import { getOrderFavouritesByOrderIds } from '@/server/order-favourites/queries'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const orderIdsParam = searchParams.get('orderIds') ?? ''

        const orderIds = orderIdsParam
            .split(',')
            .map((id) => id.trim())
            .filter((id) => id.length > 0)

        if (orderIds.length === 0) {
            return NextResponse.json({ favourites: [] }, { status: 200 })
        }

        const favourites = await getOrderFavouritesByOrderIds(orderIds)

        return NextResponse.json({ favourites }, { status: 200 })
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown server error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
