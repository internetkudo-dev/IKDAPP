export function useCurrentUser() {
    const user = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        photo: 'https://i.pravatar.cc/300',
        is_verified: true,
    };
    return {
        user,
        name: user.name,
        email: user.email,
        isLoading: false,
        isError: false,
        refetch: () => Promise.resolve(),
    };
}
