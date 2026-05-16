(function () {
  var nameInput = document.getElementById("name-input");
  var saveBtn = document.getElementById("save-btn");
  var aliasSection = document.getElementById("alias-section");
  var aliasDisplay = document.getElementById("alias-display");
  var copyBtn = document.getElementById("copy-btn");
  var domainLabel = document.getElementById("domain-label");
  var status = document.getElementById("status");

  function showStatus(msg, duration) {
    status.textContent = msg;
    status.classList.add("visible");
    setTimeout(function () {
      status.classList.remove("visible");
    }, duration || 2000);
  }

  function loadSavedName() {
    chrome.storage.local.get(["name"], function (result) {
      if (result.name) {
        nameInput.value = result.name;
        showAlias();
      }
    });
  }

  function showAlias() {
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
        { type: "GET_ALIAS_FOR_DOMAIN", domain: domain },
        function (response) {
          if (response && response.alias) {
            aliasDisplay.textContent = response.alias;
            aliasSection.style.display = "block";
          }
        }
      );
    });
  }

  copyBtn.addEventListener("click", function () {
    var text = aliasDisplay.textContent;
    if (!text) return;
    navigator.clipboard.writeText(text).then(function () {
      showStatus("Copied!");
    });
  });

  saveBtn.addEventListener("click", function () {
    var name = nameInput.value.trim();
    if (!name) {
      showStatus("Please enter a name");
      return;
    }
    chrome.storage.local.set({ name: name }, function () {
      showStatus("Saved!");
      showAlias();
    });
  });

  nameInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      saveBtn.click();
    }
  });

  loadSavedName();
})();
