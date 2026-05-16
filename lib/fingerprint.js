var ShadowName = ShadowName || {};

ShadowName.fingerprint = (function () {
  function fnv1a32(str) {
    var hash = 0x811c9dc5;
    for (var i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
  }

  function domainToSeed(domain) {
    var normalized = domain.replace(/^www\./, "").toLowerCase();
    return fnv1a32(normalized);
  }

  function charSeed(domainSeed, charIndex, salt) {
    var combined = domainSeed + ":" + charIndex + ":" + salt;
    return fnv1a32(combined);
  }

  return {
    domainToSeed: domainToSeed,
    charSeed: charSeed,
  };
})();
