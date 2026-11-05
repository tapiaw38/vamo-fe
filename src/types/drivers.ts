export type DriverStatus = "draft" | "pending_review" | "verified" | "suspended";
export interface DriverProfile {
    id: string;
    user_id: string;
    status: DriverStatus;
    license_number: string;
    verification_notes: string;
    created_at: string;
    updated_at: string;
    is_available?: boolean;
}
export interface DriverInput {
    license_number: string;
    sensitive_metadata?: Record<string, unknown>;
    verification_notes?: string;
    submit_for_review?: boolean;
}
