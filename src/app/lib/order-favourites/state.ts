export const hasFavouriteOrderId = (favouriteOrderIds: string[], orderId: string) => {
    return favouriteOrderIds.includes(orderId)
}

export const upsertFavouriteOrderId = (
    favouriteOrderIds: string[],
    orderId: string,
    isFavourite: boolean,
) => {
    if (isFavourite) {
        if (favouriteOrderIds.includes(orderId)) {
            return favouriteOrderIds
        }

        return [...favouriteOrderIds, orderId]
    }

    return favouriteOrderIds.filter((id) => id !== orderId)
}

export const addPendingFavouriteOrderId = (pendingFavouriteOrderIds: string[], orderId: string) => {
    if (pendingFavouriteOrderIds.includes(orderId)) {
        return pendingFavouriteOrderIds
    }

    return [...pendingFavouriteOrderIds, orderId]
}

export const removePendingFavouriteOrderId = (pendingFavouriteOrderIds: string[], orderId: string) => {
    return pendingFavouriteOrderIds.filter((id) => id !== orderId)
}
