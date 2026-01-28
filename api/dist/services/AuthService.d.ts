import { IUser, UserRole } from '../models/User';
export interface CreateUserData {
    email: string;
    password: string;
    name: string;
    role?: UserRole;
}
export declare class AuthService {
    createUser(userData: CreateUserData): Promise<IUser>;
    getUserById(id: string): Promise<IUser | null>;
    getUserByEmail(email: string): Promise<IUser | null>;
    updateUser(id: string, updates: Partial<IUser>): Promise<IUser | null>;
    getAllUsers(filters?: {
        role?: UserRole;
        isActive?: boolean;
    }): Promise<IUser[]>;
    deleteUser(id: string): Promise<boolean>;
    recordFailedLogin(id: string): Promise<void>;
    recordSuccessfulLogin(id: string): Promise<void>;
    isAccountLocked(user: IUser): boolean;
}
//# sourceMappingURL=AuthService.d.ts.map