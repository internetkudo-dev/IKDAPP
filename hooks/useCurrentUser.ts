export function useCurrentUser() {
    return {
        user: {
            id: '123',
            name: 'John Doe',
            email: 'john@example.com',
            photo: 'https://i.pravatar.cc/300',
            is_verified: true,
        },
        isLoading: false,
    };
}
