export const hasFavoriteOrderId = (favoriteOrderIds: string[], orderId: string) => {
    return favoriteOrderIds.includes(orderId)
}

export const upsertFavoriteOrderId = (
    favoriteOrderIds: string[],
    orderId: string,
    isFavorite: boolean,
) => {
    if (isFavorite) {
        if (favoriteOrderIds.includes(orderId)) {
            return favoriteOrderIds
        }

        return [...favoriteOrderIds, orderId]
    }

    return favoriteOrderIds.filter((id) => id !== orderId)
}

export const addPendingFavoriteOrderId = (pendingFavoriteOrderIds: string[], orderId: string) => {
    if (pendingFavoriteOrderIds.includes(orderId)) {
        return pendingFavoriteOrderIds
    }

    return [...pendingFavoriteOrderIds, orderId]
}

export const removePendingFavoriteOrderId = (pendingFavoriteOrderIds: string[], orderId: string) => {
    return pendingFavoriteOrderIds.filter((id) => id !== orderId)
}
