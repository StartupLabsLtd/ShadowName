(function () {
  var firstInput = document.getElementById("first-input");
  var lastInput = document.getElementById("last-input");
  var saveBtn = document.getElementById("save-btn");
  var aliasSection = document.getElementById("alias-section");
  var aliasFirst = document.getElementById("alias-first");
  var aliasLast = document.getElementById("alias-last");
  var aliasFull = document.getElementById("alias-full");
  var domainLabel = document.getElementById("domain-label");
  var status = document.getElementById("status");

  function showStatus(msg, duration) {
    status.textContent = msg;
    status.classList.add("visible");
    setTimeout(function () {
      status.classList.remove("visible");
    }, duration || 2000);
  }

  function loadSavedNames() {
    chrome.storage.local.get(["firstName", "lastName"], function (result) {
      if (result.firstName) firstInput.value = result.firstName;
      if (result.lastName) lastInput.value = result.lastName;
      if (result.firstName || result.lastName) showAliases();
    });
  }

  function showAliases() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (!tabs[0] || !tabs[0].url) return;
      var url;
      try {
        url = new URL(tabs[0].url);
      } catch (e) {
        return;
      }
      var domain = url.hostname;
      if (!domain) return;

      domainLabel.textContent = domain;

      chrome.runtime.sendMessage(
        { type: "GET_ALIASES_FOR_DOMAIN", domain: domain },
        function (response) {
          if (response) {
            if (response.first) aliasFirst.textContent = response.first;
            if (response.last) aliasLast.textContent = response.last;
            if (response.full) aliasFull.textContent = response.full;
            aliasSection.style.display = "block";
          }
        }
      );
    });
  }

  document.querySelectorAll(".copy-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = btn.getAttribute("data-target");
      var el = document.getElementById("alias-" + target);
      var text = el.textContent;
      if (!text) return;
      navigator.clipboard.writeText(text).then(function () {
        showStatus("Copied!");
      });
    });
  });

  saveBtn.addEventListener("click", function () {
    var first = firstInput.value.trim();
    var last = lastInput.value.trim();
    if (!first && !last) {
      showStatus("Enter at least one name");
      return;
    }
    chrome.storage.local.set({ firstName: first, lastName: last }, function () {
      showStatus("Saved!");
      showAliases();
    });
  });

  [firstInput, lastInput].forEach(function (input) {
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") saveBtn.click();
    });
  });

  loadSavedNames();
})();