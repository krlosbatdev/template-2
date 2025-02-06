export interface VINFormData {
    vin: string;
    year: string;
    make: string;
    model: string;
    color: string;
}

export interface VIN extends VINFormData {
    id: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
} 