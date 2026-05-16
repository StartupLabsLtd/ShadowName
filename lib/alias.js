var ShadowName = ShadowName || {};

ShadowName.alias = (function () {
  var homoglyphMap = null;

  function loadHomoglyphs(json) {
    var parsed = JSON.parse(json);
    var map = {};
    var keys = Object.keys(parsed);
    for (var i = 0; i < keys.length; i++) {
      var base = keys[i];
      var variants = parsed[base];
      map[base] = [base].concat(variants);
    }
    homoglyphMap = map;
  }

  function setHomoglyphMap(map) {
    homoglyphMap = map;
  }

  function generateAlias(name, domainSeed, salt) {
    if (!homoglyphMap) {
      throw new Error("Homoglyph map not loaded");
    }

    var alias = "";
    for (var i = 0; i < name.length; i++) {
      var ch = name[i];
      var variants = homoglyphMap[ch];
      if (variants && variants.length > 0) {
        var seed = ShadowName.fingerprint.charSeed(domainSeed, i, salt);
        var index = seed % variants.length;
        alias += variants[index];
      } else {
        alias += ch;
      }
    }
    return alias;
  }

  return {
    loadHomoglyphs: loadHomoglyphs,
    setHomoglyphMap: setHomoglyphMap,
    generateAlias: generateAlias,
  };
})();
