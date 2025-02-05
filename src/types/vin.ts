export interface VIN {
    vin: string;
    savedAt: string;
    year?: string;
    make?: string;
    model?: string;
    color?: string;
}

export interface VINFormData {
    vin: string;
    year: string;
    make: string;
    model: string;
    color: string;
} 