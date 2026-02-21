export interface FilterValidTransaction {
    date: string;
    amount: number;
    ceiling: number;
    remanent: number;
    inKPeriod: boolean;
}

export interface FilterInvalidTransaction {
    date: string;
    amount: number;
    message: string;
}

export interface FilterResult {
    valid: FilterValidTransaction[];
    invalid: FilterInvalidTransaction[];
}
