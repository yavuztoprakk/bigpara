import axios from "axios";

// =====================================================
// Voltran v2 Authentication API Client
// Base API: https://voltran-bff-test.demirorenmedya.com/
// Versiyon: v1
// TenantName: İlgili mecra (hurriyet, cnn, fanatik)
// Tüm istekler POST methoduyla atılır.
// =====================================================

const baseUrl = "https://voltran-bff-test.demirorenmedya.com/api/v1/";
const tenantName = "hurriyet";

// =====================================================
// GLOBAL AXIOS LOGGING INTERCEPTORS
// Tüm axios istekleri ve yanıtları konsola yazdırılır.
// Birden fazla import'ta tekrar tetiklenmemesi için guard.
// =====================================================
type AxiosWithLogFlag = typeof axios & { __voltranLogAttached?: boolean };
const axiosWithFlag = axios as AxiosWithLogFlag;
if (!axiosWithFlag.__voltranLogAttached) {
  axios.interceptors.request.use(
    (config) => {
      const method = (config.method || "GET").toUpperCase();
      const url = `${config.baseURL || ""}${config.url || ""}`;
      console.log(`[AXIOS][REQ] ${method} ${url}`, {
        headers: config.headers,
        params: config.params,
        data: config.data,
      });
      return config;
    },
    (error) => {
      console.log("[AXIOS][REQ-ERR]", error?.message, error);
      return Promise.reject(error);
    }
  );

  axios.interceptors.response.use(
    (response) => {
      const method = (response.config.method || "GET").toUpperCase();
      const url = `${response.config.baseURL || ""}${response.config.url || ""}`;
      console.log(
        `[AXIOS][RES] ${response.status} ${method} ${url}`,
        response.data
      );
      return response;
    },
    (error) => {
      const cfg = error?.config || {};
      const method = (cfg.method || "GET").toUpperCase();
      const url = `${cfg.baseURL || ""}${cfg.url || ""}`;
      const status = error?.response?.status;
      console.log(
        `[AXIOS][RES-ERR] ${status || "NO_STATUS"} ${method} ${url}`,
        {
          message: error?.message,
          data: error?.response?.data,
        }
      );
      return Promise.reject(error);
    }
  );

  axiosWithFlag.__voltranLogAttached = true;
}

// =====================================================
// INTERFACES
// =====================================================

// CheckUserExists - Request
interface CheckUserExistsRequest {
    email: string;                  // Email adresi
    phoneNumber: string;            // Telefon numarası (5554443322)
    phoneCountryCode: string;       // Ülke kodu (+90 vs.)
    tokenType: number;              // 1: Recaptcha / 2: TOTP
    token: string;                  // Recaptcha veya TOTP token
}

// CheckUserExists - Response
interface CheckUserExistsResponse {
    hasError: boolean;
    errors: string[];
    result: {
        hasUser: boolean;           // true: kullanıcı mevcut (login akışına git), false: kullanıcı yok (register akışına git)
        isFirstLogin: boolean;      // true ise "Tekrar Hoşgeldiniz" mesajı gösterilir
        profileImageUrl: string;    // Profil resmi URL'i
        userToken: string;          // İşlem takip token bilgisi (register akışında kullanılır)
        firstName: string | null;   // İsim
        lastName: string | null;    // Soyisim
        email: string | null;       // Email
        phoneNumber: string | null; // Telefon numarası
    };
}

// OTPSend - Request
interface OTPSendRequest {
    userToken: string;              // CheckUserExists'ten dönen işlem takip token'ı (zorunlu)
    email: string;                  // OTP gönderilecek email adresi (zorunlu)
    phoneNumber: string;            // Telefon numarası (opsiyonel)
    phoneCountryCode: string;       // Ülke kodu (+90 vs.) (opsiyonel)
    tokenType: number;              // 1: Recaptcha / 2: TOTP (zorunlu)
    token: string;                  // Token (zorunlu)
}

// OTPSend - Response
interface OTPSendResponse {
    hasError: boolean;
    errors: string[];
    result?: {
        userToken: string;          // İşlem takip token bilgisi
    };
}

// VerifyOTP - Request
interface VerifyOTPRequest {
    userToken: string;              // İşlem takip token bilgisi (zorunlu)
    code: string;                   // Ekrandan girilen OTP kodu (zorunlu)
    tokenType: number;              // 1: Recaptcha / 2: TOTP (zorunlu)
    token: string;                  // Token (zorunlu)
}

// VerifyOTP - Response
interface VerifyOTPResponse {
    hasError: boolean;
    errors: string[];
    result?: {
        userToken: string;          // İşlem takip token bilgisi
    };
}

// RegisterAndLogin - Request
interface RegisterAndLoginRequest {
    userName: string;               // Kullanıcı ismi (opsiyonel)
    email: string;                  // Email - telefon ile başlandıysa zorunlu
    phoneNumber: string;            // Telefon numarası (opsiyonel)
    phoneCountryCode: string;       // Telefon numarası ile verilmek zorunda (opsiyonel)
    firstName: string;              // İsim (zorunlu)
    lastName: string;               // Soyisim (zorunlu)
    userToken: string;              // İşlem takip token bilgisi (zorunlu)
    password: string;               // Şifre (zorunlu)
    allowedForInformation: boolean; // Üyelik Sözleşmesi Kullanım Koşulları onayı (zorunlu)
    allowedForKVKK: boolean;        // KVKK onayı (zorunlu)
    whichPlatformId: number;        // Platform: 1=WebMobil, 2=WebDesktop, 3=iOSApp, 4=AndroidApp (zorunlu)
    referrer: string;               // Kaynak: 4=Facebook, 7=GoogleAds, 12=MailNewsletters, 13=MailCampaigns, 16=Migration, 17=Apple (zorunlu)
    ipAddress: string;              // IP adresi (opsiyonel)
    macAddress: string;             // MAC adresi (opsiyonel)
    userNameMismatch: boolean;      // Kullanıcı adı uyuşmazlığı - farklı mecrada farklı isim/soyisim varsa true gönderilir (zorunlu)
    brandArrivalChannel: number | null; // Geliş markası - yoksa null olmalı (opsiyonel)
    tokenType: number;              // 1: Recaptcha / 2: TOTP (zorunlu)
    token: string;                  // Token (zorunlu)
}

// RegisterAndLogin - Response
// Başarılı: 200, UserNameMismatch durumu: 202
interface RegisterAndLoginResponse {
    hasError: boolean;
    errors: string[];
    result?: {
        id: string;                         // Kullanıcı voltran ID
        firstName: string;                  // İsim
        lastName: string;                   // Soyisim
        email: string;                      // Email
        message: string;                    // Mesaj
        accessToken: string;                // Bearer token (JWT)
        refreshToken: string;               // Refresh token
        refreshTokenExpireDate: string;     // Refresh token son kullanma tarihi
        newContracts: any[];                // Yeni sözleşmeler
    };
}

// UserLogin - Request
interface UserLoginRequest {
    email: string;                  // Email (email veya telefon ikisinden biri zorunlu)
    phoneNumber: string;            // Telefon numarası (5554443322)
    phoneCountryCode: string;       // Ülke kodu (+90 vs.)
    password: string;               // Şifre (zorunlu)
    brandArrivalChannel: number | null; // Geliş markası - yoksa null olmalı (opsiyonel)
    tokenType: number;              // 1: Recaptcha / 2: TOTP (zorunlu)
    token: string;                  // Token (zorunlu)
}

// UserLogin - Response
interface UserLoginResponse {
    hasError: boolean;
    errors: string[];
    result?: {
        id: string;                         // Kullanıcı voltran ID
        firstName: string;                  // İsim
        lastName: string;                   // Soyisim
        email: string;                      // Email
        message: string;                    // Mesaj
        accessToken: string;                // Bearer token (JWT)
        refreshToken: string;               // Refresh token
        refreshTokenExpireDate: string;     // Refresh token son kullanma tarihi
        newContracts: any[];                // Yeni sözleşmeler
    };
}

// InitiatePasswordReset - Request
interface InitiatePasswordResetRequest {
    email: string;                  // Email (email veya telefon ikisinden biri zorunlu)
    phoneNumber: string;            // Telefon numarası (5554443322)
    phoneCountryCode: string;       // Ülke kodu (+90 vs.)
    tokenType: number;              // 1: Recaptcha / 2: TOTP (zorunlu)
    token: string;                  // Token (zorunlu)
}

// InitiatePasswordReset - Response
interface InitiatePasswordResetResponse {
    hasError: boolean;
    errors: string[];
    result?: {
        userToken: string;          // İşlem takip token bilgisi (GUID)
    };
}

// VerifyPasswordResetOtp - Request
interface VerifyPasswordResetOtpRequest {
    userToken: string;              // İşlem takip token (zorunlu)
    code: string;                   // Kullanıcının ekrandan girdiği OTP (zorunlu)
    otpTypeEmail: boolean;          // OTP email'e gönderildiyse true, SMS ise false (zorunlu)
    tokenType: number;              // 1: Recaptcha / 2: TOTP (zorunlu)
    token: string;                  // Token (zorunlu)
}

// VerifyPasswordResetOtp - Response
interface VerifyPasswordResetOtpResponse {
    hasError: boolean;
    errors: string[];
    result?: {
        userToken: string;          // İşlem takip token bilgisi (GUID)
    };
}

// CompletePasswordReset - Request
interface CompletePasswordResetRequest {
    password: string;               // Yeni şifre (zorunlu)
    userToken: string;              // İşlem takip token (zorunlu)
    tokenType: number;              // 1: Recaptcha / 2: TOTP (zorunlu)
    token: string;                  // Token (zorunlu)
}

// CompletePasswordReset - Response
interface CompletePasswordResetResponse {
    hasError: boolean;
    errors: string[];
}

// ReGenerateOTP - Request
interface ReGenerateOTPRequest {
    otpTypeEmail: string;           // OTP gönderildiği provider: "true" = Email, "false" = SMS (zorunlu)
    userToken: string;              // İşlem takip token (zorunlu)
    phoneNumber: string;            // Telefon numarası
    email: string;                  // Email adresi
    phoneCountryCode: string;       // Ülke kodu (+90 vs.)
}

// ReGenerateOTP - Response
interface ReGenerateOTPResponse {
    hasError: boolean;
    errors: string[];
}

// =====================================================
// LOGIN / REGISTER AKIŞI
// =====================================================

/**
 * Kullanıcının Voltran'daki durumunu kontrol eder.
 * - HasUser true dönerse: Kullanıcı mevcut → login akışına (şifre ekranına) yönlendirilir.
 * - HasUser false dönerse: Kullanıcı yok → register akışına yönlendirilir.
 * - IsFirstLogin true dönerse: "Tekrar Hoşgeldiniz" mesajı gösterilir.
 * - Telefon numarası girildiğinde ülke kodu da mutlaka gönderilmelidir.
 *
 * Başarılı: 200 | Hata: 400
 */
export const checkUserExists = async (params: CheckUserExistsRequest) => {
    return axios.post<CheckUserExistsResponse>(
        `${baseUrl}${tenantName}/Auth/CheckUserExists`,
        params
    );
};

/**
 * Kullanıcıya OTP kodu gönderir.
 * Register akışında, son adımda kullanıcı register olmadan önce belirtilen
 * email veya telefon numarası için OTP gönderir.
 * - Kullanıcı başlangıçta telefon ile girdiyse, son ekranda email OTP'si alınır (veya tersi).
 * - Yani her iki doğrulama kanalı da tamamlanmış olur.
 *
 * Başarılı: 200 | Hata: 400 ("Hatalı OTP kodu.")
 */
export const otpSend = async (params: OTPSendRequest) => {
    return axios.post<OTPSendResponse>(
        `${baseUrl}${tenantName}/Auth/OTPSend`,
        params
    );
};

/**
 * Kullanıcıya iletilen OTP kodunu doğrular.
 * - UserToken: CheckUserExists'ten dönen işlem takip token'ı
 * - Code: Kullanıcının ekrandan girdiği OTP kodu
 * - Doğrulama başarılıysa UserToken döner, bu token sonraki adımlarda kullanılır.
 *
 * Başarılı: 200 | Hata: 400 ("Hatalı OTP kodu.")
 */
export const verifyOTP = async (params: VerifyOTPRequest) => {
    return axios.post<VerifyOTPResponse>(
        `${baseUrl}${tenantName}/Auth/VerifyOTP`,
        params
    );
};

/**
 * Kullanıcıyı register yaptıktan sonra login yapar ve access token verir.
 * - OTP doğrulaması tamamlandıktan sonra çağrılır.
 * - Ad, soyad, şifre, KVKK ve üyelik sözleşmesi onayları zorunludur.
 * - WhichPlatformId: 1=WebMobil, 2=WebDesktop, 3=iOSApp, 4=AndroidApp
 * - Referrer: 4=Facebook, 7=GoogleAds, 12=MailNewsletters, 13=MailCampaigns, 16=Migration, 17=Apple
 *
 * *UserNameMismatch durumu:
 * Farklı bir mecra için üye olurken isim veya soyisimini farklı girdiğinde,
 * var olan isim soyisim dışında bir şey yazdıysa UserNameMismatch true olarak
 * response da 202 döner. Bu durumda popup açılır. Kullanıcı popup da "devam"
 * butonuna bastığında UserNameMismatch true olarak istek tekrar atılmalıdır.
 *
 * Başarılı: 200 (access token + refresh token)
 * UserNameMismatch: 202 (popup göster, onaylanırsa userNameMismatch=true ile tekrar at)
 * Hata: 400
 */
export const registerAndLogin = async (params: RegisterAndLoginRequest) => {
    return axios.post<RegisterAndLoginResponse>(
        `${baseUrl}${tenantName}/Auth/RegisterAndLogin`,
        params
    );
};

/**
 * Mevcut kullanıcıyı login yapar.
 * - CheckUserExists'te hasUser=true döndüğünde bu endpoint çağrılır.
 * - Email ya da telefon numarasından birini girmek zorunludur.
 * - Başarılı olursa AccessToken (JWT Bearer), RefreshToken ve kullanıcı bilgileri döner.
 * - BrandArrivalChannel: Geliş markasını belirtir, yoksa null olmalıdır.
 *
 * Başarılı: 200 (access token + refresh token + kullanıcı bilgileri)
 * Hata: 400 ("E-posta adresinizi veya şifrenizi hatalı girdiniz.")
 */
export const userLogin = async (params: UserLoginRequest) => {
    return axios.post<UserLoginResponse>(
        `${baseUrl}${tenantName}/Auth/UserLogin`,
        params
    );
};

// =====================================================
// ŞİFRE SIFIRLAMA AKIŞI
// =====================================================

/**
 * Şifre resetleme işlemini başlatır.
 * - Email ya da telefon numarasından birini girmek zorunludur.
 * - Başarılıysa UserToken (GUID) döner, bu token sonraki adımlarda kullanılır.
 * - Belirtilen email veya telefona OTP kodu gönderilir.
 *
 * Başarılı: 200 (UserToken döner)
 * Hata: 400 ("Kullanıcı bulunamadı")
 */
export const initiatePasswordReset = async (params: InitiatePasswordResetRequest) => {
    return axios.post<InitiatePasswordResetResponse>(
        `${baseUrl}${tenantName}/Auth/InitiatePasswordReset`,
        params
    );
};

/**
 * Şifre resetleme için gönderilen OTP kodunu doğrular.
 * - OtpTypeEmail: OTP email adresine gönderildiyse true, SMS ile gönderildiyse false olmalıdır.
 * - Doğrulama başarılıysa UserToken döner, bu token CompletePasswordReset'te kullanılır.
 *
 * Başarılı: 200 (UserToken döner)
 * Hata: 400 ("Bir hata oluştu. Yeniden deneyiniz.")
 */
export const verifyPasswordResetOtp = async (params: VerifyPasswordResetOtpRequest) => {
    return axios.post<VerifyPasswordResetOtpResponse>(
        `${baseUrl}${tenantName}/Auth/VerifyPasswordResetOtp`,
        params
    );
};

/**
 * Şifre resetleme işlemini tamamlar ve kullanıcı şifresini günceller.
 * - VerifyPasswordResetOtp'den dönen UserToken ile çağrılır.
 * - Yeni şifre bu endpoint ile belirlenir.
 *
 * Başarılı: 200
 * Hata: 400 ("Bir hata oluştu. Yeniden deneyiniz.")
 */
export const completePasswordReset = async (params: CompletePasswordResetRequest) => {
    return axios.post<CompletePasswordResetResponse>(
        `${baseUrl}${tenantName}/Auth/CompletePasswordReset`,
        params
    );
};

// =====================================================
// OTP YENİDEN GÖNDERME
// =====================================================

/**
 * Tekrar OTP kodu oluşturup gönderir.
 * - OTP süresi dolduğunda veya kod ulaşmadığında kullanılır.
 * - OtpTypeEmail: "true" ise email'e, "false" ise SMS ile gönderilir.
 * - UserToken: Mevcut işlem takip token'ı (zorunlu)
 *
 * Başarılı: 200
 * Hata: 400
 */
export const reGenerateOTP = async (params: ReGenerateOTPRequest) => {
    return axios.post<ReGenerateOTPResponse>(
        `${baseUrl}${tenantName}/Auth/ReGenerateOTP`,
        params
    );
};
