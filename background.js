importScripts("lib/fingerprint.js", "lib/alias.js");

var homoglyphText = null;
var userFirst = null;
var userLast = null;
var SALT = "shadowname-v1";

function loadHomoglyphs(callback) {
  if (homoglyphText !== null) {
    callback(homoglyphText);
    return;
  }
  fetch(chrome.runtime.getURL("homoglyphs.json"))
    .then(function (res) {
      return res.text();
    })
    .then(function (text) {
      homoglyphText = text;
      callback(text);
    });
}

function loadNames(callback) {
  if (userFirst !== null && userLast !== null) {
    callback(userFirst, userLast);
    return;
  }
  chrome.storage.local.get(["firstName", "lastName"], function (result) {
    userFirst = result.firstName || "";
    userLast = result.lastName || "";
    callback(userFirst, userLast);
  });
}

function computeAliases(domain, hgText, first, last) {
  ShadowName.alias.loadHomoglyphs(hgText);
  var seed = ShadowName.fingerprint.domainToSeed(domain);
  var firstAlias = first
    ? ShadowName.alias.generateAlias(first, seed, SALT + ":first")
    : "";
  var lastAlias = last
    ? ShadowName.alias.generateAlias(last, seed, SALT + ":last")
    : "";
  var fullAlias =
    firstAlias && lastAlias
      ? firstAlias + " " + lastAlias
      : firstAlias || lastAlias;
  return { first: firstAlias, last: lastAlias, full: fullAlias };
}

function sendReplaceToTab(tabId) {
  loadHomoglyphs(function (hgText) {
    loadNames(function (first, last) {
      if (!first && !last) return;
      var domain = "";
      chrome.tabs.get(tabId, function (tab) {
        if (tab && tab.url) {
          try {
            domain = new URL(tab.url).hostname;
          } catch (e) {}
        }
        if (!domain) return;
        var aliases = computeAliases(domain, hgText, first, last);
        chrome.tabs.sendMessage(tabId, {
          type: "REPLACE",
          aliases: aliases,
          firstName: first,
          lastName: last,
        });
      });
    });
  });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type === "CONTENT_READY") {
    var tabId = sender.tab ? sender.tab.id : null;
    if (tabId) {
      loadHomoglyphs(function (hgText) {
        loadNames(function (first, last) {
          var domain = "";
          try {
            domain = new URL(sender.tab.url).hostname;
          } catch (e) {}
          var aliases = computeAliases(domain, hgText, first, last);
          sendResponse({
            aliases: aliases,
            firstName: first,
            lastName: last,
          });
        });
      });
      return true;
    }
    sendResponse({});
  } else if (request.type === "GET_ALIASES_FOR_DOMAIN") {
    loadHomoglyphs(function (hgText) {
      loadNames(function (first, last) {
        var aliases = computeAliases(request.domain, hgText, first, last);
        sendResponse(aliases);
      });
    });
    return true;
  }
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === "complete" && tab.url) {
    sendReplaceToTab(tabId);
  }
});

chrome.storage.onChanged.addListener(function (changes, area) {
  if (area === "local" && (changes.firstName || changes.lastName)) {
    userFirst = null;
    userLast = null;
    homoglyphText = null;
    chrome.tabs.query({}, function (tabs) {
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].url && tabs[i].url.startsWith("http")) {
          sendReplaceToTab(tabs[i].id);
        }
      }
    });
  }
});