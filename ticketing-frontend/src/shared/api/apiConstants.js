export const apiPaths = {
    concerts: '/api/concerts',
    seats: (concertId) => `/api/concerts/${concertId}/seats`,
    cartItems: '/api/items',
    tickets: '/api/tickets',
}
