type ApiErrorBody = {
    error?: string
}

export async function getApiErrorMessage(response: Response, fallbackMessage: string) {
    const errorBody = (await response.json().catch(() => null)) as ApiErrorBody | null
    const errorMessage = errorBody?.error?.trim()

    if (errorMessage) {
        return errorMessage
    }

    return fallbackMessage
}
