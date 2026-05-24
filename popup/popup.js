(function () {
  var firstInput = document.getElementById("first-input");
  var lastInput = document.getElementById("last-input");
  var pepperInput = document.getElementById("pepper-input");
  var genPepperBtn = document.getElementById("gen-pepper-btn");
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

  function loadSaved() {
    chrome.storage.local.get(
      ["firstName", "lastName", "pepper"],
      function (result) {
        if (result.firstName) firstInput.value = result.firstName;
        if (result.lastName) lastInput.value = result.lastName;
        if (result.pepper) pepperInput.value = result.pepper;
        if (result.firstName || result.lastName) showAliases();
      }
    );
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

  function save() {
    var first = firstInput.value.trim();
    var last = lastInput.value.trim();
    var pepper = pepperInput.value.trim();
    if (!first && !last) {
      showStatus("Enter at least one name");
      return;
    }
    chrome.storage.local.set(
      { firstName: first, lastName: last, pepper: pepper },
      function () {
        showStatus("Saved!");
        showAliases();
      }
    );
  }

  genPepperBtn.addEventListener("click", function () {
    var chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    var s = "";
    for (var i = 0; i < 12; i++) {
      s += chars[Math.floor(Math.random() * chars.length)];
    }
    pepperInput.value = s;
    save();
  });

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

  saveBtn.addEventListener("click", save);

  [firstInput, lastInput, pepperInput].forEach(function (input) {
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") save();
    });
  });

  loadSaved();
})();