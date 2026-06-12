// KVKK kapsamında üye aydınlatma metni. Render tarafı (`LegalDocument`)
// `**...**` ile sarılmış parçaları kalın olarak basar.

import type { AgreementBlock } from "./membershipAgreement";

export const PRIVACY_POLICY: AgreementBlock[] = [
  // Veri Sorumlusu
  { type: "h1", text: "Veri Sorumlusu" },
  {
    type: "p",
    text: "**Demirören Medya Yatırımları Ticaret Anonim Şirketi**",
  },
  {
    type: "p",
    text: "100. Yıl Mah. 2264. Sk. Demirören Medya Center Apt. No.1 Bağcılar/İstanbul",
  },

  // 1. Hangi Kişisel Veriler İşlenmektedir?
  { type: "h1", text: "1. Hangi Kişisel Veriler İşlenmektedir?" },

  { type: "h2", text: "Kimlik Bilgileri" },
  {
    type: "p",
    text: "**İşlenen Veriler:** Ad, soyad, doğum tarihi, T.C. kimlik numarası, cinsiyet, meslek, vergi dairesi, vergi kimlik numarası, fotoğraf.",
  },
  {
    type: "p",
    text: "**İşlenme Amaçları:** İletişim faaliyetleri, iş faaliyetleri, ürün/hizmet bağlılığı, satış süreçleri, satış sonrası destek, müşteri ilişkileri, memnuniyet aktiviteleri, sözleşme süreçleri, talep ve şikayetler.",
  },
  {
    type: "p",
    text: "**Hukuki Sebepler:** Açık rıza, sözleşme kurulması ve ifası.",
  },
  {
    type: "p",
    text: "**Toplama Yöntemleri:** Çevrimiçi formlar, platform üyelik sistemi, sözleşme, sosyal hesaplar.",
  },

  { type: "h2", text: "İletişim Bilgileri" },
  {
    type: "p",
    text: "**İşlenen Veriler:** E-posta, cep telefonu, şehir/ülke, ilçe (ücretli üyelikler), adres (ücretli üyelikler).",
  },
  {
    type: "p",
    text: "**İşlenme Amaçları:** İletişim, iş faaliyetleri, satış, satış sonrası destek, müşteri ilişkileri, memnuniyet, pazarlama, sözleşme, talep ve şikayetler.",
  },
  {
    type: "p",
    text: "**Hukuki Sebepler:** Açık rıza, sözleşme kurulması ve ifası.",
  },
  {
    type: "p",
    text: "**Toplama Yöntemleri:** Çevrimiçi formlar, platform sistemi, sözleşme, sosyal hesaplar.",
  },

  { type: "h2", text: "İşlem Güvenliği Bilgileri" },
  {
    type: "p",
    text: "**İşlenen Veriler:** IP adresi, cihaz ID, giriş/çıkış bilgileri, şifre ve parola, token bilgisi.",
  },
  {
    type: "p",
    text: "**İşlenme Amaçları:** Bilgi güvenliği, mevzuata uygunluk, iş faaliyetleri, satış, müşteri ilişkileri, sözleşme, talep ve şikayetler, yetkili kurumlara bilgi.",
  },
  {
    type: "p",
    text: "**Hukuki Sebepler:** Açık rıza, kanuni gereklilik, sözleşme, yasal yükümlülük, meşru menfaatler.",
  },
  {
    type: "p",
    text: "**Toplama Yöntemleri:** Bilgi sistemleri, elektronik formlar, web teknolojileri.",
  },

  { type: "h2", text: "Finans Bilgileri" },
  {
    type: "p",
    text: "**İşlenen Veriler:** Kredi kartı bilgileri (ücretli üyelikler).",
  },
  {
    type: "p",
    text: "**İşlenme Amaçları:** İş faaliyetleri, satış, müşteri ilişkileri, sözleşme, finans ve muhasebe.",
  },
  {
    type: "p",
    text: "**Hukuki Sebepler:** Açık rıza, kanuni gereklilik, sözleşme kurulması ve ifası.",
  },
  {
    type: "p",
    text: "**Toplama Yöntemleri:** Platform sistemi, sözleşme.",
  },

  { type: "h2", text: "Hukuki İşlem Bilgileri" },
  {
    type: "p",
    text: "**İşlenen Veriler:** Adli makam yazışmaları, dava dosyaları, idari makam yazışmaları.",
  },
  {
    type: "p",
    text: "**İşlenme Amaçları:** Mevzuata uygunluk, hukuk işleri, talep ve şikayetler, yetkili kurumlara bilgi.",
  },
  {
    type: "p",
    text: "**Hukuki Sebepler:** Hak tesisi, hak kullanımı ve hak korunması.",
  },
  {
    type: "p",
    text: "**Toplama Yöntemleri:** Basılı formlar, beyan edilen belgeler, sözleşme.",
  },

  { type: "h2", text: "Müşteri İşlem Bilgileri" },
  {
    type: "p",
    text: "**İşlenen Veriler:** Fatura, senet ve çek bilgileri, talep bilgisi, sipariş bilgisi.",
  },
  {
    type: "p",
    text: "**İşlenme Amaçları:** Mevzuata uygunluk, hukuk işleri, satın alım/satış, arşiv, sözleşme, yetkili kurumlara bilgi.",
  },
  {
    type: "p",
    text: "**Hukuki Sebepler:** Açık rıza, sözleşme kurulması ve ifası.",
  },
  {
    type: "p",
    text: "**Toplama Yöntemleri:** Sözleşme, platform sistemi.",
  },

  // 2. Kişisel Veriler Kimlere Aktarılabilir?
  { type: "h1", text: "2. Kişisel Veriler Kimlere Aktarılabilir?" },
  { type: "p", text: "Kişisel veriler aşağıdaki alıcılara aktarılabilir:" },
  {
    type: "ul",
    items: [
      "**Yetkili Kamu Kurum ve Kuruluşları:** Mevzuata uygunluk, iş faaliyetleri, hukuk işleri.",
      "**Tedarikçi Yetkilileri ve Çalışanları:** İş faaliyetleri, sözleşme, iletişim, talep ve şikayetler, finans işleri.",
      "**Borsa İstanbul:** \"BigPara\" hizmeti kullanımında mevzuattan kaynaklı yükümlülükler.",
      "**Grup Şirketleri ve Bağlı Ortaklıkları:** Açık rıza ile sınırlı olmak üzere (iş faaliyetleri, satış, güvenlik, pazarlama).",
      "**İş Ortakları:** Sözleşmesel ilişki kapsamında (iş faaliyetleri, sözleşme, iletişim).",
    ],
  },
  {
    type: "p",
    text: "**Not:** \"Demirören Medya ortak üyelik hesabı aracılığıyla sunulan üyelik hizmetlerinin sağlanması\" amacıyla Microsoft Dynamics altyapısı (yurt dışında sunucular) kullanılmaktadır.",
  },

  // 3. Kişisel Veriler Ne Kadar Süre Saklanır?
  { type: "h1", text: "3. Kişisel Veriler Ne Kadar Süre Saklanır?" },
  {
    type: "p",
    text: "Veriler, kanunda belirlenen saklama süresi kadar tutulur. Kanunda süre belirtilmemişse, işlenme amaçlarıyla bağlantılı, sınırlı ve ölçülü olmak kaydıyla makul süreler için saklanmaktadır.",
  },

  // 4. İlgili Kişi Olarak Haklarınız
  { type: "h1", text: "4. İlgili Kişi Olarak Haklarınız" },
  {
    type: "ul",
    items: [
      "Verilerinizin işlenip işlenmediğini öğrenme.",
      "İşleme ilişkin bilgi talep etme.",
      "İşlenme amacını ve uygunluğunu öğrenme.",
      "Verilerin aktarıldığı üçüncü kişileri bilme.",
      "Eksik veya yanlış verilerin düzeltilmesini isteme.",
      "Silme veya yok etme talebinde bulunma.",
      "Aktarılan üçüncü kişilere bildirim isteme.",
      "Otomatik analiz sonuçlarına itiraz etme.",
      "Kanuna aykırı işlemeden kaynaklı zararın giderilmesini talep etme.",
    ],
  },

  // 5. Haklarınızı Nasıl Kullanabilirsiniz?
  { type: "h1", text: "5. Haklarınızı Nasıl Kullanabilirsiniz?" },
  {
    type: "p",
    text: "Taleplerinizi aşağıdaki yöntemlerle iletebilirsiniz:",
  },
  {
    type: "ul",
    items: [
      "**E-posta:** kvkkbasvuru@demirorenmedya.com",
      "**Bizzat başvuru:** Geçerli kimlik belgesi ile.",
      "**Posta:** Islak imza ve kimlik fotokopisi ile Demirören Medya Center, 100. Yıl Mahallesi, 2264. Sokak, No:1, Bağcılar/İstanbul.",
      "**Mobil veya güvenli elektronik imza:** kvkkbasvuru@demirorenmedya.com",
      "**Kayıtlı Elektronik Posta (KEP):** demirorenmedya@hs03.kep.tr",
    ],
  },

  { type: "h2", text: "Başvuruda Bulunması Gereken Bilgiler" },
  {
    type: "ul",
    items: [
      "Ad, soyad ve imza (yazılı başvurular için).",
      "T.C. kimlik numarası (yabancılar için uyruk, pasaport veya kimlik numarası).",
      "Yerleşim yeri veya iş yeri adresi.",
      "E-posta, telefon, faks.",
      "Talep konusunun açık ve anlaşılır açıklaması.",
      "Talebi destekleyen bilgi ve belgeler.",
    ],
  },

  { type: "h2", text: "Özel Durumlar" },
  {
    type: "ul",
    items: [
      "Başkası adına başvuruda yetkilendirme belgesi (vekâletname) gereklidir.",
      "Sağlık verilerine ilişkin taleplerde özel yetki gereklidir.",
      "Başvuruya kimlik doğrulayıcı belgeler eklenmelidir.",
    ],
  },

  // 6. Talepleriniz Ne Kadar Sürede Cevaplanır?
  { type: "h1", text: "6. Talepleriniz Ne Kadar Sürede Cevaplanır?" },
  {
    type: "p",
    text: "Talepleriniz en kısa sürede ve **en geç 30 gün içinde** cevaplandırılır. Yanıt, başvuruda belirtilen adrese posta veya e-posta ile iletilir.",
  },
];
