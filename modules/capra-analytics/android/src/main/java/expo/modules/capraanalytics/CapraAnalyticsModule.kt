package expo.modules.capraanalytics

import com.capra.analytics.CapraAnalytics
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

// Capra Analytics Android SDK için Expo Modules bridge.
// SDK API referansı: https://github.com/capra-solutions/analytics-android-sdk
class CapraAnalyticsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("CapraAnalytics")

    Function("configure") { siteId: String, endpoint: String ->
      val context = appContext.reactContext?.applicationContext
        ?: throw IllegalStateException("Application context unavailable")
      CapraAnalytics.configure(context, siteId, endpoint)
    }

    Function("trackScreen") { name: String, url: String, title: String ->
      CapraAnalytics.trackScreen(name, url, title)
    }

    Function("trackEvent") { name: String, properties: Map<String, Any> ->
      CapraAnalytics.trackEvent(name, properties)
    }

    Function("trackConversion") { id: String, type: String, value: Double, currency: String ->
      CapraAnalytics.trackConversion(id, type, value, currency)
    }
  }
}
