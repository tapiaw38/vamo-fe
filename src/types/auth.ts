export type AuthUser = {
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    roles?: string[];
};
export type UserProfile = AuthUser & {
    phone?: string;
    residence_locality_id?: string;
    locality_name?: string;
    province_id?: string;
    province_name?: string;
};
export type AuthSession = { data: AuthUser; token: string; refresh_token?: string };
export type LoginInput = { email: string; password: string };
export type RegisterInput = {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    residence_locality_id?: string;
    wants_to_be_driver?: boolean;
};
