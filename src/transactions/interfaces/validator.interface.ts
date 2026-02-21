export interface ValidTransaction {
    date: string;
    amount: number;
    ceiling: number;
    remanent: number;
}

export interface InvalidTransaction extends ValidTransaction {
    message: string;
}

export interface ValidatorResult {
    valid: ValidTransaction[];
    invalid: InvalidTransaction[];
    duplicates: ValidTransaction[];
}
