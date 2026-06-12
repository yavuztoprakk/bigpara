import ExpoModulesCore
import CapraAnalytics

// Capra Analytics iOS SDK için Expo Modules bridge.
// SDK API referansı: https://github.com/capra-solutions/analytics-ios-sdk
public class CapraAnalyticsModule: Module {
  public func definition() -> ModuleDefinition {
    Name("CapraAnalytics")

    Function("configure") { (siteId: String, endpoint: String) in
      CapraAnalytics.configure(siteId: siteId, endpoint: endpoint)
    }

    Function("trackScreen") { (name: String, url: String, title: String) in
      CapraAnalytics.trackScreen(name: name, url: url, title: title)
    }

    Function("trackEvent") { (name: String, properties: [String: Any]) in
      CapraAnalytics.trackEvent(name: name, properties: properties)
    }

    Function("trackConversion") { (id: String, type: String, value: Double, currency: String) in
      CapraAnalytics.trackConversion(id: id, type: type, value: value, currency: currency)
    }
  }
}
