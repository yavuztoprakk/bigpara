// Üyelik Sözleşmesi içeriği. Render tarafı `**...**` ile sarılmış parçaları
// kalın olarak basar; diğer her şey normal akış metnidir.

export type CompanyInfo = {
  name: string;
  address: string;
  phone: string;
  email: string;
  mersis: string;
  kep: string;
};

export type AgreementBlock =
  | { type: "h1"; text: string }
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "company"; data: CompanyInfo };

export const MEMBERSHIP_AGREEMENT: AgreementBlock[] = [
  // 1. TARAFLAR
  { type: "h1", text: "1. TARAFLAR" },
  { type: "p", text: "İşbu Üyelik Sözleşmesi aşağıdaki taraflar arasında akdedilmiştir." },
  { type: "h2", text: "Üye" },
  { type: "p", text: "[●] (e-posta adresi [●])" },
  { type: "h2", text: "Grup Şirketleri" },
  {
    type: "ul",
    items: [
      "Milliyet Gazetecilik ve Yayıncılık A.Ş.",
      "MES Televizyon ve Radyo Yayıncılık A.Ş. (CNN TÜRK)",
      "Demirören Yayıncılık ve Gazetecilik A.Ş. (FANATİK & POSTA)",
      "Demirören TV Radyo Yayıncılık Yapımcılık A.Ş. (KANAL D)",
      "Hürriyet Gazetecilik ve Matbaacılık A.Ş.",
      "Demirören Medya Yatırımları Ticaret Anonim Şirketi",
    ],
  },
  {
    type: "p",
    text: "Tüm şirketler: 100. Yıl Mahallesi, 2264. Sokak, No:1, Demirören Medya Center, Bağcılar/İstanbul",
  },

  // 2. SÖZLEŞMENİN KONUSU VE KAPSAMI
  { type: "h1", text: "2. SÖZLEŞMENİN KONUSU VE KAPSAMI" },
  {
    type: "p",
    text: "Sözleşme, Mecralar (hurriyet.com.tr, milliyet.com.tr, cnnturk.com, kanald.com.tr, fanatik.com.tr, posta.com.tr, uyelik-sso1-pilot.demirorenmedya.com) üzerinden sunulan hizmetlerin şartlarını ve tarafların hak-yükümlülüklerini belirler.",
  },
  {
    type: "p",
    text: "Hizmetlerden yararlanabilmek için kullanıcılar tarafından onaylanması anında hüküm ifade eder. **Kullanım Koşulları, işbu Sözleşme'nin eki ve ayrılmaz bir parçasıdır.**",
  },

  // 3. TANIMLAR
  { type: "h1", text: "3. TANIMLAR" },
  {
    type: "ul",
    items: [
      "**Üye:** 18 yaşını doldurmuş, seçilen üyelik formunu eksiksiz dolduran ve onaylanan gerçek/tüzel kişi.",
      "**Kullanıcı:** Üye olsun veya olmasın, Mecralar'ı ziyaret eden kişi.",
      "**SSO:** Demirören Medya ortak üyelik hesabı ile tüm platformlara giriş sağlayan altyapı sistemi.",
      "**Grup Şirketleri:** SSO ile kullanıcı girişi yapılabilen tüm şirketler.",
      "**Demirören Medya ortak üyelik hesabı:** Grup Şirketleri Mecralarında tek noktadan giriş sağlayan hesap.",
      "**Link:** Mecralar'dan diğer sitelere veya tersine erişimi sağlayan bağlantı.",
      "**İçerik:** Mecralar'da yayınlanan bilgi, dosya, resim, program, rakam, fiyat, görsel ve işitsel imgeler.",
      "**Üyelik Sözleşmesi:** Mecralar vasıtasıyla sunulan hizmetlerden yararlanacak kişilerle Grup Şirketleri arasında akdedilen sözleşme.",
      "**Kullanım Koşulları:** Mecralar'ı ziyaret eden kullanıcıların uyması gereken kurallar.",
      "**Kişisel Veri:** Kimlik, adres, e-posta, telefon, IP adresi, ziyaret edilen sayfalar gibi belirli/belirlenebilir kişilere ilişkin bilgi.",
    ],
  },

  // 4. HİZMETLERİN KAPSAMI
  { type: "h1", text: "4. HİZMETLERİN KAPSAMI" },
  {
    type: "p",
    text: "Sözleşme onaylandıktan sonra her bir Mecra için tek üyelik oluşturulur. Üye, **Demirören Medya ortak üyelik hesabı bilgilerini kullanarak giriş yapabilecektir.**",
  },
  {
    type: "p",
    text: "Mecralar üzerinden yapılan işlemler **Tüketicinin Korunması Hakkında Kanun, Mesafeli Sözleşmeler Yönetmeliği ve Abonelik Sözleşmeleri Yönetmeliği** hükümlerine tabi olacaktır.",
  },
  {
    type: "p",
    text: "Grup Şirketleri **hizmetlere ilişkin olarak yapacağı her türlü değişikliği Mecralar'da yayınlamasıyla yürürlüğe girdiğini beyan eder.** Üye bunu peşinen kabul etmiş sayılır.",
  },
  {
    type: "p",
    text: "Haber içeriklerine üye olmaksızın tüm kullanıcılar erişebilir. Diğer üyelik hizmetlerinden yararlanabilmek için üye olmak ve/veya abonelik paketi satın almak gereklidir.",
  },

  // 5. HAK VE YÜKÜMLÜLÜKLER
  { type: "h1", text: "5. HAK VE YÜKÜMLÜLÜKLER" },

  { type: "h2", text: "5.1 Üyelik Koşulları" },
  {
    type: "p",
    text: "18 yaşını doldurmuş bireyler gerçek kimlik bilgileriyle üye olabilir. **Üye adı** üyeye özeldir ve aynı ad iki farklı üyeye verilmez. Yanlış bilgi verenlerin üyeliği iptal/durdurulabilir.",
  },

  { type: "h2", text: "5.2 Bilgilerin Doğruluğu" },
  {
    type: "p",
    text: "Üye, verilen bilgilerin kanunlar önünde doğru olduğunu, yanlış olması durumunda tüm zararı tazmin edeceğini kabul eder.",
  },

  { type: "h2", text: "5.3 Sözleşme İhlali" },
  {
    type: "p",
    text: "**İşbu Sözleşme içerisinde sayılan maddelerden bir ya da birkaçını ihlal eden Üye işbu ihlal nedeniyle cezai ve hukuki olarak şahsen sorumlu olup** Grup Şirketleri'ni korur.",
  },

  { type: "h2", text: "5.4 Fikri Mülkiyet" },
  {
    type: "p",
    text: "Mecralar'ın yazılım ve tasarımı Grup Şirketleri'nindir. **Bunlar Üye veya Kullanıcılar tarafından izinsiz kullanılamaz, iktisap edilemez ve değiştirilemez.**",
  },

  { type: "h2", text: "5.5 Kişisel Bilgilerin Açıklanması" },
  {
    type: "p",
    text: "Yasal zorunluluk, yasal işlemlere uyum veya haklarını korumak için Grup Şirketleri, kişisel bilgileri ilgili mercilere açıklayabilir.",
  },

  { type: "h2", text: "5.6 Bilgilerin Güncelliği" },
  {
    type: "p",
    text: "**Mecralar muhteviyatında yer alan materyal ve bilgiler Mecralar'da verildiği anda sunulmaktadır.** Güncelliği, doğruluğu ve şartları konusunda garanti verilmez.",
  },

  { type: "h2", text: "5.7 Üçüncü Kişi Sorumluluğu" },
  {
    type: "p",
    text: "**Mecralar dahilinde üçüncü kişiler tarafından sağlanan hizmetlerden ve yayınlanan içeriklerden dolayı Grup Şirketleri'nin sorumluluğu bulunmamaktadır.**",
  },

  { type: "h2", text: "5.8 Dış Linkler" },
  {
    type: "p",
    text: "Mecralar'dan dış sitelere link verilir ancak **Grup Şirketleri, link üzerinden yönlendirme yapılan sayfalardaki bilgilerin doğruluğunu garanti etmemekte** ve taahhütte bulunmaz.",
  },

  { type: "h2", text: "5.9 Mecralar'ın Hukuka Uygun Kullanımı" },
  {
    type: "p",
    text: "Kullanıcılar yalnızca **hukuka uygun ve şahsi amaçlarla Mecralar üzerinde işlem yapabilirler.** Üyelerin faaliyetlerindeki hukuki/cezai sorumluluk kendilerine aittir.",
  },

  { type: "h2", text: "5.10 Fikri Mülkiyet Hakları" },
  {
    type: "p",
    text: "Grup Şirketleri, hizmetleri, bilgileri, telif haklarına tâbi çalışmaları, ticari markaları ve diğer varlıklarına ilişkin tüm hakları saklı tutar.",
  },

  { type: "h2", text: "5.11 Üyelik Silme / Askıya Alma" },
  {
    type: "p",
    text: "**Grup Şirketleri'nin her zaman tek taraflı olarak işbu Sözleşme hükümlerine aykırı davrandığını tespit ettiği Üye'nin üyeliğini silme, askıya alma ve tekrar üye olmasını yasaklama hakkı vardır.**",
  },

  { type: "h2", text: "5.12 Bilgilendirme İletişimi" },
  {
    type: "p",
    text: "Grup Şirketleri, kayıtlı e-posta adreslerine mail ve cep telefonuna SMS gönderme yetkisine sahiptir. Sözleşme onaylaması bunu kabul sayılır.",
  },

  { type: "h2", text: "5.13 İçerik Kullanımı Kısıtlamaları" },
  {
    type: "p",
    text: "Üye, satın aldığı içeriği kopyalamayacağını, cihazına kaydetmeyeceğini, üçüncü kişilere aktarmayacağını, kendi hesabı üzerinden erişim sağlamayacağını ve dağıtımını yapmayacağını kabul eder.",
  },

  { type: "h2", text: "5.14 Üyelik Hakkının Devri" },
  {
    type: "p",
    text: "**Üye'nin Mecralar üyeliği ile sahip olduğu kullanım hakkı ve işbu kullanım hakkından doğan mali yükümlülükler sadece kendisine ait olup sair gerçek veya tüzel kişilere devredilemez.**",
  },

  { type: "h2", text: "5.15 Giriş Bilgilerinin Gizliliği" },
  {
    type: "p",
    text: "Üye, cep telefonu bilgisi, şifre, kod gibi bilgileri gizli tutmalıdır. **Mecralar'ın üçüncü bir şahıs tarafından kullanımının sonuçlarından tamamı ile Üye sorumludur.**",
  },

  // 6. KİŞİSEL VERİLERİN KORUNMASI
  { type: "h1", text: "6. KİŞİSEL VERİLERİN KORUNMASI" },

  { type: "h2", text: "6.1 Veri İşleme Amaçları" },
  {
    type: "p",
    text: "Grup Şirketleri, Üye'nin kişisel verilerini sözleşmenin kurulması/ifası için işler. Veriler gizli tutulur ve hizmetin ifası için tedarikçiler, yetkili merciler ve Grup Şirketleri ile paylaşılır.",
  },

  { type: "h2", text: "6.2 SSO ve Veri Aktarımı" },
  {
    type: "p",
    text: "**Kişisel verileriniz; SSO sisteminin kullanımı ve tek bir Demirören Medya ortak üyelik hesabı ile Mecralar'a giriş yapılmasının sağlanması amacıyla veri sorumlusu Demirören Medya tarafından toplanmakta, akabinde Grup Şirketleri ile paylaşılmaktadır.**",
  },
  {
    type: "p",
    text: "Grup Şirketleri, sunucuları yurtdışında bulunan bulut hizmet sağlayıcısı Dynamics 365 altyapısını kullanır. Üye, kişisel verilerinin **üyelik işlemlerinin yürütülmesi, hizmetlerin sunulabilmesi, saklama ve arşiv faaliyetlerinin yürütülmesi amaçlarıyla yurtdışına aktarılacağı** konusunda bilgilendirilmiştir.",
  },

  { type: "h2", text: "6.3 Veri Güncelleme" },
  { type: "p", text: "Üye, profil ekranından verilerini güncelleyebilir." },

  { type: "h2", text: "6.4 Çevrimiçi Hizmetlerde Ses / Görüntü" },
  {
    type: "p",
    text: "Çevrimiçi hizmetlerde Üye'nin sesli, görüntülü veya yazılı katılımı, ilgili hizmetlere dahil kişiler tarafından görülür. Üye bunu kabul eder.",
  },

  { type: "h2", text: "6.5 Veri Haklarına İlişkin Başvuru" },
  {
    type: "p",
    text: "Üye, kişisel verilerine ilişkin bilgi alabilir ve **Kişisel Verilerin Korunması Kanunu** kapsamındaki hak ve taleplerini Demirören Medya'ya yöneltebilir.",
  },

  { type: "h2", text: "6.6 Veri Silme Hakkı" },
  {
    type: "p",
    text: "Grup Şirketleri, kayıtlı kullanıcı bilgi ve verilerini silme hakkını saklı tutar.",
  },

  // 7. SÖZLEŞMENİN FESHİ
  { type: "h1", text: "7. SÖZLEŞMENİN FESHİ" },

  { type: "h2", text: "7.1 Sözleşmenin Yürürlülüğü" },
  {
    type: "p",
    text: "Sözleşme **Üye'nin Mecralar'a üye olduğu sürece yürürlükte kalacak** ve üyelikten ayrılması veya geçici/kalıcı durdurulması halinde sona erer.",
  },

  { type: "h2", text: "7.2 Tek Taraflı Fesih Hakkı" },
  {
    type: "p",
    text: "**Grup Şirketleri herhangi bir zamanda gerekçe göstermeden, bildirimde bulunmadan, tazminat, ceza vb. sair yükümlülüğü bulunmaksızın derhal yürürlüğe girecek şekilde işbu Sözleşme'yi tek taraflı olarak feshedebilir.**",
  },
  {
    type: "p",
    text: "Üyeliğe son verme veya geçici durdurma halleri: Kurallara aykırılık, telif hakkı ihlali, bilgi güvenliğine risk oluşturma. Üye, feshe neden olan fiillerden doğan tüm zararı tazmin eder.",
  },

  // 8. SON HÜKÜMLER
  { type: "h1", text: "8. SON HÜKÜMLER" },

  { type: "h2", text: "8.1 Sorumluluğun Sınırlandırılması" },
  {
    type: "p",
    text: "Grup Şirketleri, **Mecralar'a erişilmesi, Mecralar'ın ya da Mecralar'daki bilgilerin ve diğer verilerin programların vs. kullanılması sebebiyle, Sözleşme'nin ihlali, haksız fiil, ya da başkaca sebeplere binaen, doğabilecek doğrudan ya da dolaylı hiçbir zarardan sorumlu değildir.**",
  },
  {
    type: "p",
    text: "İşlemin kesintisi, hata, ihmal nedeniyle sorumluluk kabul edilmez. Üye, doğrudan/dolaylı zararları ilk talep halinde ödeyecektir.",
  },

  { type: "h2", text: "8.2 Mücbir Sebepler" },
  {
    type: "p",
    text: "**Grup Şirketleri, hukuken mücbir sebep sayılan tüm durumlarda (savaş, sıkıyönetim, salgın hastalık gibi), işbu Sözleşme'de geçen yükümlülükleri geç ifadan veya hiç ifa etmemekten dolayı herhangi bir sorumluluk kabul etmemektedir.**",
  },
  { type: "p", text: "Mücbir sebepler nedeniyle tazminat talep edilemez." },

  { type: "h2", text: "8.3 Yürürlük" },
  {
    type: "p",
    text: "Üye'nin üyelik kaydı, sözleşmenin tüm maddelerini okuduğu ve kabul ettiği anlamına gelir. Sözleşme, Üye'nin üye olması anında akdedilmiş ve yürürlülüğe girmiştir.",
  },

  { type: "h2", text: "8.4 Sözleşme Değişiklikleri" },
  {
    type: "p",
    text: "**Grup Şirketleri tamamen kendi takdirine bağlı ve tek taraflı olarak işbu Sözleşme'yi uygun göreceği herhangi bir zamanda Mecralar'da ilan ederek değiştirebilir.** Değişiklikler ilan edildiği tarihte geçerli olur.",
  },

  { type: "h2", text: "8.5 Devir" },
  {
    type: "p",
    text: "Grup Şirketleri, sözleşmeyi bildirimsiz olarak kısmen veya tamamen devredebilir. Üye, bu hakkı kullanamaz ve bu türden devir girişimi geçersizdir.",
  },

  { type: "h2", text: "8.6 Yetki" },
  {
    type: "p",
    text: "**İşbu Sözleşme'den kaynaklanan uyuşmazlıkların çözümünde İstanbul Bakırköy Mahkemeleri ile İcra Müdürlükleri yetkili olacaktır.**",
  },

  { type: "h2", text: "8.7 Kısmi Geçersizlik" },
  {
    type: "p",
    text: "Sözleşmenin bir veya birkaç maddesinin geçersizliği, diğer maddelerin geçerliliğini ortadan kaldırmaz.",
  },

  // Şirket Bilgileri
  { type: "h1", text: "ŞİRKET BİLGİLERİ" },
  {
    type: "company",
    data: {
      name: "Milliyet Gazetecilik ve Yayıncılık A.Ş.",
      address: "100. Yıl Mahallesi, 2264. Sokak, No:1, Demirören Medya Center, Bağcılar/İstanbul",
      phone: "0212 337 99 99",
      email: "internethabermerkezi@milliyet.com.tr",
      mersis: "0302049759000010",
      kep: "milliyetgazetecilik@hs03.kep.tr",
    },
  },
  {
    type: "company",
    data: {
      name: "Hürriyet Gazetecilik ve Matbaacılık A.Ş.",
      address: "100. Yıl Mahallesi, 2264. Sokak, No:1, Demirören Medya Center, Bağcılar/İstanbul",
      phone: "0850 224 0 222",
      email: "okuriletisim@hurriyet.com.tr",
      mersis: "0464006127300014",
      kep: "hurriyet@hs02.kep.tr",
    },
  },
  {
    type: "company",
    data: {
      name: "Demirören TV Radyo Yayıncılık Yapımcılık A.Ş.",
      address: "Demirören Medya Center 100. Yıl Mah. 2264 Sok. No:1 34218 Bağcılar/İstanbul",
      phone: "0212 413 51 11",
      email: "izleyicitemsilcisi@kanald.com.tr",
      mersis: "0289068531000001",
      kep: "demirorentvradyo@hs02.kep.tr",
    },
  },
  {
    type: "company",
    data: {
      name: "Demirören Medya Yatırımları Ticaret Anonim Şirketi",
      address: "100. Yıl Mah., 2264. Sok., No:1, Demirören Medya Center Bağcılar/İstanbul",
      phone: "0212 677 00 00",
      email: "—",
      mersis: "0289066107200001",
      kep: "demirorenmedya@hs03.kep.tr",
    },
  },
  {
    type: "company",
    data: {
      name: "Demirören Yayıncılık ve Gazetecilik A.Ş.",
      address: "100. Yıl Mahallesi, 2264. Sokak, No:1, Demirören Medya Center, Bağcılar/İstanbul",
      phone: "0212 505 61 11",
      email: "okur@fanatik.com.tr  /  postadijital@posta.com.tr",
      mersis: "0289077105300001",
      kep: "demirorenyayincilik@hs02.kep.tr",
    },
  },
  {
    type: "company",
    data: {
      name: "Mes Televizyon ve Radyo Yayıncılık A.Ş.",
      address: "100. Yıl Mahallesi, 2264. Sokak, No:1, Demirören Medya Center, Bağcılar/İstanbul",
      phone: "0212 413 56 00",
      email: "internet@cnnturk.com.tr",
      mersis: "0619089362500001",
      kep: "mestv@hs02.kep.tr",
    },
  },
];
