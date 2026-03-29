import { getApiErrorMessage } from '@/app/lib/http/errors'

type OrderFavoriteResponse = {
    order_id: string
}

export async function fetchFavoriteOrderIdsByOrderIds(orderIds: string[]): Promise<string[]> {
    if (orderIds.length === 0) {
        return []
    }

    const response = await fetch(`/api/orders/favorites?orderIds=${encodeURIComponent(orderIds.join(','))}`)

    if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Unable to load favorites.'))
    }

    const json = (await response.json()) as { favorites?: OrderFavoriteResponse[] }
    const favorites = json.favorites ?? []

    return favorites
        .map((entry) => entry.order_id)
        .filter((orderId) => orderId.length > 0)
}

export async function setOrderFavorite(orderId: string, isFavorite: boolean): Promise<boolean> {
    const response = await fetch(`/api/orders/${orderId}/favorite`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_favorite: isFavorite }),
    })

    if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Unable to update favorite.'))
    }

    const json = (await response.json()) as { favorite?: OrderFavoriteResponse | null }
    return Boolean(json.favorite)
}
