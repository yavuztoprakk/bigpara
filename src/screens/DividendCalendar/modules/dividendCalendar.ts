interface DividendCalendarState {
    data: any[];
    error: string | null;
    timestamp: number | null;
    loading: boolean;
}

const initialState: DividendCalendarState = {
    data: [],
    error: null,
    timestamp: null,
    loading: false
};

export default function dividendCalendarReducer(
    state = initialState,
    action: any
): DividendCalendarState {
    switch (action.type) {
        case 'DIVIDEND_CALENDAR_REQUEST':
            return {
                ...state,
                loading: true,
                error: null
            };

        case 'DIVIDEND_CALENDAR_SUCCESS':
            return {
                ...state,
                data: action.payload.data || [],
                error: null,
                timestamp: action.payload.timestamp,
                loading: false
            };

        case 'DIVIDEND_CALENDAR_ERROR':
            return {
                ...state,
                data: [],
                error: action.payload.error,
                timestamp: action.payload.timestamp,
                loading: false
            };

        case 'DIVIDEND_CALENDAR_RESET':
            return initialState;

        default:
            return state;
    }
}