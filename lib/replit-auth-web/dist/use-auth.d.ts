export interface AuthUser {
    id: string;
    username?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    profileImage?: string | null;
    bio?: string | null;
}
interface AuthState {
    user: AuthUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: () => void;
    logout: () => void;
}
export declare function useAuth(): AuthState;
export {};
//# sourceMappingURL=use-auth.d.ts.map