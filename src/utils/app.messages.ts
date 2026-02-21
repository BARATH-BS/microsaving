export const APP_MESSAGES = {
    TRANSACTIONS: {
        PARSE: {
            INVALID_BODY: 'Request body must be an array of expenses',
            AMOUNT_RANGE: 'Amount must be between 0 and 500,000',
            DATE_FORMAT: 'Date must be a valid datetime string',
            REQUIRED_DATE: 'Date is required',
            REQUIRED_AMOUNT: 'Amount is required'
        },
        VALIDATOR: {
            NEGATIVE_AMOUNT: 'Negative amounts are not allowed',
            EXCEEDS_WAGE: 'Amount exceeds the maximum allowed investment based on wage',
        }
    }
}

