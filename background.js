importScripts("lib/fingerprint.js", "lib/alias.js");

var homoglyphText = null;
var userName = null;
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

function loadName(callback) {
  if (userName !== null) {
    callback(userName);
    return;
  }
  chrome.storage.local.get(["name"], function (result) {
    userName = result.name || null;
    callback(userName);
  });
}

function sendReplaceToTab(tabId) {
  loadHomoglyphs(function (hgText) {
    loadName(function (name) {
      if (!name) return;
      chrome.tabs.sendMessage(tabId, {
        type: "REPLACE",
        homoglyphs: hgText,
        name: name,
      });
    });
  });
}

function getAliasForDomain(domain, callback) {
  loadHomoglyphs(function (hgText) {
    loadName(function (name) {
      if (!name) {
        callback(null);
        return;
      }
      ShadowName.alias.loadHomoglyphs(hgText);
      var seed = ShadowName.fingerprint.domainToSeed(domain);
      var alias = ShadowName.alias.generateAlias(name, seed, SALT);
      callback(alias);
    });
  });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type === "CONTENT_READY") {
    var tabId = sender.tab ? sender.tab.id : null;
    if (tabId) {
      loadHomoglyphs(function (hgText) {
        loadName(function (name) {
          sendResponse({ homoglyphs: hgText, name: name });
        });
      });
      return true;
    }
    sendResponse({});
  } else if (request.type === "GET_ALIAS_FOR_DOMAIN") {
    getAliasForDomain(request.domain, function (alias) {
      sendResponse({ alias: alias });
    });
    return true;
  }
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === "complete" && tab.url) {
    var domain = new URL(tab.url).hostname;
    if (domain) {
      sendReplaceToTab(tabId);
    }
  }
});

chrome.storage.onChanged.addListener(function (changes, area) {
  if (area === "local" && changes.name) {
    userName = changes.name.newValue || null;
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
