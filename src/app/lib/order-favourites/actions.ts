import { getApiErrorMessage } from '@/app/lib/http/errors'

type OrderFavouriteResponse = {
    order_id: string
}

export async function fetchFavouriteOrderIdsByOrderIds(orderIds: string[]): Promise<string[]> {
    if (orderIds.length === 0) {
        return []
    }

    const response = await fetch(`/api/orders/favourites?orderIds=${encodeURIComponent(orderIds.join(','))}`)

    if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Unable to load favourites.'))
    }

    const json = (await response.json()) as { favourites?: OrderFavouriteResponse[] }
    const favourites = json.favourites ?? []

    return favourites
        .map((entry) => entry.order_id)
        .filter((orderId) => orderId.length > 0)
}

export async function setOrderFavourite(orderId: string, isFavourite: boolean): Promise<boolean> {
    const response = await fetch(`/api/orders/${orderId}/favourite`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_favourite: isFavourite }),
    })

    if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Unable to update favourite.'))
    }

    const json = (await response.json()) as { favourite?: OrderFavouriteResponse | null }
    return Boolean(json.favourite)
}
