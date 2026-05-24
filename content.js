(function () {
  var aliases = null;
  var firstName = null;
  var lastName = null;
  var fullName = null;
  var addedIcons = [];

  function init(data) {
    aliases = data.aliases;
    firstName = data.firstName || "";
    lastName = data.lastName || "";
    fullName = (firstName + " " + lastName).trim();
  }

  function replaceText(node) {
    if (!firstName && !lastName) return;
    if (node.nodeType === Node.TEXT_NODE) {
      var v = node.nodeValue;
      var changed = false;
      if (fullName && v.includes(fullName)) {
        v = v.split(fullName).join(aliases.full);
        changed = true;
      }
      if (firstName && v.includes(firstName)) {
        v = v.split(firstName).join(aliases.first);
        changed = true;
      }
      if (lastName && v.includes(lastName)) {
        v = v.split(lastName).join(aliases.last);
        changed = true;
      }
      if (changed) node.nodeValue = v;
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
    if (!firstName && !lastName) return;
    var inputs = document.querySelectorAll(
      'input[type="text"], input[type="search"], input:not([type]), textarea'
    );
    for (var i = 0; i < inputs.length; i++) {
      var input = inputs[i];
      var v = input.placeholder || input.value || "";
      var changed = false;
      if (fullName && v.includes(fullName)) {
        v = v.split(fullName).join(aliases.full);
        changed = true;
      }
      if (firstName && v.includes(firstName)) {
        v = v.split(firstName).join(aliases.first);
        changed = true;
      }
      if (lastName && v.includes(lastName)) {
        v = v.split(lastName).join(aliases.last);
        changed = true;
      }
      if (changed) {
        if (input.placeholder) input.placeholder = v;
        if (input.value) input.value = v;
      }
    }
  }

  function isFirstNameField(el) {
    var name = (el.name || "").toLowerCase();
    var id = (el.id || "").toLowerCase();
    var placeholder = (el.placeholder || "").toLowerCase();
    var aria = (el.getAttribute("aria-label") || "").toLowerCase();
    var re = /(first|fname|given)/;
    return re.test(name) || re.test(id) || re.test(placeholder) || re.test(aria);
  }

  function isLastNameField(el) {
    var name = (el.name || "").toLowerCase();
    var id = (el.id || "").toLowerCase();
    var placeholder = (el.placeholder || "").toLowerCase();
    var aria = (el.getAttribute("aria-label") || "").toLowerCase();
    var re = /(last|lname|surname|family)/;
    return re.test(name) || re.test(id) || re.test(placeholder) || re.test(aria);
  }

  function isFullNameField(el) {
    var name = (el.name || "").toLowerCase();
    var id = (el.id || "").toLowerCase();
    var placeholder = (el.placeholder || "").toLowerCase();
    var aria = (el.getAttribute("aria-label") || "").toLowerCase();
    if (isFirstNameField(el) || isLastNameField(el)) return false;
    var re = /(full.?name|name|your.?name)/;
    return re.test(name) || re.test(id) || re.test(placeholder) || re.test(aria);
  }

  function getFieldType(el) {
    var parentText = "";
    if (el.closest) {
      var container = el.closest("form, div, fieldset, li, .field, .input-group");
      if (container) parentText = container.textContent.toLowerCase();
    }
    if (isFirstNameField(el) && firstName) return "first";
    if (isLastNameField(el) && lastName) return "last";
    if (isFullNameField(el) && fullName) return "full";
    if (/first/i.test(parentText) && firstName) return "first";
    if (/(last|surname|family)/i.test(parentText) && lastName) return "last";
    if (/(full.?name|name)/i.test(parentText) && fullName) return "full";
    return null;
  }

  function addFillIcon(input) {
    if (input.closest(".sn-fill-wrap") || input.readOnly || input.disabled) return;
    var fieldType = getFieldType(input);
    if (!fieldType) return;

    var wrap = document.createElement("span");
    wrap.className = "sn-fill-wrap";
    wrap.style.cssText =
      "position:relative;display:inline-block;";

    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);

    var icon = document.createElement("button");
    icon.className = "sn-fill-btn";
    icon.title = "Fill with " + fieldType + " name alias";
    icon.setAttribute("data-field", fieldType);
    icon.innerHTML =
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>';
    icon.style.cssText =
      "position:absolute;right:4px;top:50%;transform:translateY(-50%);" +
      "width:22px;height:22px;padding:0;margin:0;border:none;border-radius:4px;" +
      "background:#6c63ff;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;" +
      "opacity:0;transition:opacity .15s;z-index:999999;";
    icon.addEventListener("mouseenter", function () {
      icon.style.opacity = "1";
    });
    icon.addEventListener("mouseleave", function () {
      if (!wrap._snHover) icon.style.opacity = "0";
    });
    wrap.addEventListener("mouseenter", function () {
      wrap._snHover = true;
      icon.style.opacity = "1";
    });
    wrap.addEventListener("mouseleave", function () {
      wrap._snHover = false;
      icon.style.opacity = "0";
    });

    icon.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var alias = fieldType === "first" ? aliases.first : fieldType === "last" ? aliases.last : aliases.full;
      if (alias) {
        input.value = alias;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
        icon.style.background = "#4ade80";
        setTimeout(function () {
          icon.style.background = "#6c63ff";
        }, 600);
      }
    });

    wrap.appendChild(icon);
    addedIcons.push(wrap);
  }

  function scanFormFields() {
    if (!firstName && !lastName) return;
    var inputs = document.querySelectorAll(
      'input[type="text"], input[type="search"], input:not([type])'
    );
    for (var i = 0; i < inputs.length; i++) {
      addFillIcon(inputs[i]);
    }
  }

  function run() {
    replaceText(document.body);
    replaceInputs();
    scanFormFields();
  }

  function onMessage(request, sender, sendResponse) {
    if (request.type === "REPLACE") {
      init(request);
      run();
      sendResponse({ success: true });
    } else if (request.type === "GET_ALIAS") {
      sendResponse({ aliases: aliases });
    }
  }

  chrome.runtime.onMessage.addListener(onMessage);

  chrome.runtime.sendMessage(
    { type: "CONTENT_READY", url: window.location.href },
    function (response) {
      if (response && response.aliases) {
        init(response);
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
    scanFormFields();
  });

  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  } else {
    document.addEventListener("DOMContentLoaded", function () {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    });
  }
})();