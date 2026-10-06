export const getSeatLabel = (index, seatsPerRow = 8) => {
    const row = String.fromCharCode(65 + Math.floor(index / seatsPerRow))
    const number = (index % seatsPerRow) + 1
    return `${row}${number}`
}

const seatLabelStorageKey = 'ticketing-seat-labels'

export const rememberSeatLabel = (seatId, seatLabel) => {
    if (!seatLabel || typeof window === 'undefined') return
    const labels = JSON.parse(window.localStorage.getItem(seatLabelStorageKey) || '{}')
    labels[String(seatId)] = seatLabel
    window.localStorage.setItem(seatLabelStorageKey, JSON.stringify(labels))
}

export const getRememberedSeatLabel = (seatId) => {
    if (typeof window === 'undefined') return null
    const labels = JSON.parse(window.localStorage.getItem(seatLabelStorageKey) || '{}')
    return labels[String(seatId)] || null
}
