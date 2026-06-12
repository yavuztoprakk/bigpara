Pod::Spec.new do |s|
  s.name           = 'CapraAnalyticsModule'
  s.version        = '1.0.0'
  s.summary        = 'BigPara Capra Analytics bridge (Expo local module).'
  s.description    = 'Capra Analytics iOS SDK için Expo Modules köprüsü.'
  s.author         = ''
  s.homepage       = 'https://github.com/capra-solutions/analytics-ios-sdk'
  s.license        = { :type => 'MIT' }
  s.platforms      = { :ios => '15.1' }
  s.source         = { :git => '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  # CapraAnalytics pod'u Trunk'a yayınlanmadığı için root Podfile'da
  # git source ile çekiliyor. Burada sadece dependency olarak adı listeleniyor,
  # versiyon koşulu Podfile'daki :tag tarafından sağlanır.
  s.dependency 'CapraAnalytics'

  s.source_files = "**/*.{h,m,swift}"
end
