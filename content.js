(function () {
  var aliasCache = null;
  var realName = null;
  var SALT = "shadowname-v1";

  function init(homoglyphText, name) {
    realName = name;
    ShadowName.alias.loadHomoglyphs(homoglyphText);
    var domain = window.location.hostname;
    var seed = ShadowName.fingerprint.domainToSeed(domain);
    aliasCache = ShadowName.alias.generateAlias(name, seed, SALT);
  }

  function replaceText(node) {
    if (!realName || !aliasCache) return;
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.nodeValue.includes(realName)) {
        node.nodeValue = node.nodeValue.split(realName).join(aliasCache);
      }
    } else if (
      node.nodeType === Node.ELEMENT_NODE &&
      node.tagName !== "SCRIPT" &&
      node.tagName !== "STYLE" &&
      node.tagName !== "NOSCRIPT"
    ) {
      for (var i = 0; i < node.childNodes.length; i++) {
        replaceText(node.childNodes[i]);
      }
    }
  }

  function replaceInputs() {
    if (!realName || !aliasCache) return;
    var inputs = document.querySelectorAll(
      'input[type="text"], input[type="search"], input:not([type]), textarea'
    );
    for (var i = 0; i < inputs.length; i++) {
      var input = inputs[i];
      if (
        input.placeholder &&
        input.placeholder.includes(realName)
      ) {
        input.placeholder = input.placeholder.split(realName).join(aliasCache);
      }
    }
  }

  function run() {
    replaceText(document.body);
    replaceInputs();
  }

  function onMessage(request, sender, sendResponse) {
    if (request.type === "REPLACE") {
      init(request.homoglyphs, request.name);
      run();
      sendResponse({ success: true, alias: aliasCache });
    } else if (request.type === "GET_ALIAS") {
      sendResponse({ alias: aliasCache });
    }
  }

  chrome.runtime.onMessage.addListener(onMessage);

  chrome.runtime.sendMessage(
    { type: "CONTENT_READY", url: window.location.href },
    function (response) {
      if (response && response.homoglyphs && response.name) {
        init(response.homoglyphs, response.name);
        run();
      }
    }
  );

  var observer = new MutationObserver(function (mutations) {
    for (var i = 0; i < mutations.length; i++) {
      var mutation = mutations[i];
      for (var j = 0; j < mutation.addedNodes.length; j++) {
        replaceText(mutation.addedNodes[j]);
      }
    }
    replaceInputs();
  });

  observer.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true,
  });
})();
