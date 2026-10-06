export const apiPaths = {
    concerts: '/api/concerts',
    seats: (concertId) => `/api/seats/${concertId}`,
    cartItems: '/api/items',
    tickets: '/api/tickets',
}
