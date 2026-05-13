import { createSlice, createAsyncThunk, createSelector, PayloadAction } from "@reduxjs/toolkit";
import { calendar } from "../../../modules/FintablesClient";
import flashMessage from "../../../modules/flashMessage";
import { Option } from "../../../components/BottomSheet/Select";

// Constants
export const calendarTypeOptions: Option[] = [
  { title: "Üretici Fiyat Endeksi (Aylık)", value: "612" },
  { title: "Üretici Fiyat Endeksi (Yıllık)", value: "872" },
  { title: "Tüketici Fiyat Endeksi (Aylık)", value: "611" },
  { title: "Tüketici Fiyat Endeksi (Yıllık)", value: "871" },
  { title: "Gayrisafi Yurt İçi Hasıla Büyümesi (GSYİH)", value: "408" },
  { title: "Cari İşlemler Dengesi", value: "1240" },
  { title: "Bütçe Dengesi", value: "869" },
  { title: "İşsizlik", value: "614" },
  { title: "İmalat PMI", value: "1305" },
  { title: "Sanayi Üretimi", value: "618" },
  { title: "Tüketici Güven Endeksi", value: "615" },
];

export const periodOptions: Option[] = [
  { value: "yesterday", title: "Dün" },
  { value: "today", title: "Bugün" },
  { value: "thisWeek", title: "Bu Hafta" },
  { value: "nextWeek", title: "Gelecek Hafta" },
];

export const ratingOptions: Option[] = [
  { value: "all", title: "Tümü" },
  { value: "1", title: "★" },
  { value: "2", title: "★★" },
  { value: "3", title: "★★★" },
];

export const countryOptions: Option[] = [
  { value: "all", title: "Tümü" },
  { value: "17", title: "Almanya" },
  { value: "25", title: "Avusturalya" },
  { value: "4", title: "Birleşik Krallık" },
  { value: "32", title: "Brezilya" },
  { value: "37", title: "Çin" },
  { value: "72", title: "Euro Bölgesi" },
  { value: "10", title: "İtalya" },
  { value: "35", title: "Japonya" },
  { value: "22", title: "Fransa" },
  { value: "110", title: "Güney Afrika" },
  { value: "11", title: "Güney Kore" },
  { value: "14", title: "Hindistan" },
  { value: "39", title: "Hong Kong" },
  { value: "26", title: "İspanya" },
  { value: "12", title: "İsviçre" },
  { value: "6", title: "Kanada" },
  { value: "56", title: "Rusya" },
  { value: "36", title: "Singapur" },
  { value: "63", title: "Türkiye" },
  { value: "5", title: "ABD" },
  { value: "43", title: "Yeni Zelanda" },
];

export const defaultPeriodOption = periodOptions[1];
export const defaultCountryOption = countryOptions[0];
export const defaultRatingOption = ratingOptions[0];

export interface CalendarEvent {
  provider_event_id: string;
  provider_event_title: string;
  day: string;
  time: string;
  currency: string;
  country: string;
  importance: number;
  actual?: string;
  forecast?: string;
  previous?: string;
}

export const filteredEventsSelector = createSelector(
  (state: any) => state.calendar.list.data,
  (items) => items
);
// Async Thunk for API Call
export const load = createAsyncThunk(
  "calendar/load",
  async ({ country, period, rating }: any, { rejectWithValue, dispatch }) => {

    let params: any = {
      timeZone: "63",
      timeFilter: "timeRemain",
      currentTab: period.value,
      limitFrom: 0,
      rating: rating !== null ? rating.value : null,
    };

    let isAllSelected = Array.isArray(country)
      ? country.length === 1 && country[0].value === "all"
      : country.value === "all";

    if (isAllSelected) {
      params["country[0]"] = "all";
    } else if (Array.isArray(country)) {
      params["country[0]"] = "all"; // Still treat as "all" for the request
    } else {
      params["country[0]"] = country.value;
    }

    await calendar(params)
      .then((res) => {
        let filteredData = res.data;
        // Filter data based on selected countries only if not "all"
        if (Array.isArray(country) && !isAllSelected) {
          filteredData = filteredData.filter((item: { country: any; }) =>
            country.some((c) => c.title === item.country)
          );
        } else if (!isAllSelected) {
          filteredData = filteredData.filter(
            (item: { country: any; }) => item.country === country.title
          );
        }
        // Filter by rating if rating is not "all"
        if (rating.value !== "all") {
          filteredData = filteredData.filter(
            (item: { importance: number; }) => item.importance === parseInt(rating.value, 10)
          );
        }
        if (filteredData.length >= 1) {
          dispatch(updateData(filteredData))
        } else {
          flashMessage({
            type: "danger",
            message: "Seçili filtre için veri bulunmamaktadır!",
          });
          return rejectWithValue("No data found");

        }
      })
      .catch((e) => {
        flashMessage({
          duration: 10000,
          type: "danger",
          message: "Takvim yüklenirken bir hata oluştu.",
        });

        return rejectWithValue(e);
      });
  }
)



// Slice
const calendarSlice = createSlice({
  name: "calendar",
  initialState: {
    data: null,
    loading: false,
    filter: {
      country: defaultCountryOption,
      period: defaultPeriodOption,
      rating: defaultRatingOption,
    },
    error: null,
  },
  reducers: {
    updateData: (state: any, action: PayloadAction<boolean>) => {
      state.data = action.payload;
    },
    setFilter: (state, action) => {
      state.filter = { ...state.filter, ...action.payload };
    },
    resetCalendar: (state) => {
      state.data = null;
      state.filter = {
        country: defaultCountryOption,
        period: defaultPeriodOption,
        rating: defaultRatingOption,
      };
      state.error = null;
    },
  },
  extraReducers: (builder) => {
  },
});

export const { setFilter, updateData, resetCalendar } = calendarSlice.actions;
export default calendarSlice.reducer;
