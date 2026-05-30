// TrustJSON — background service worker (minimal).
// Jobs:
//   1. Open the local viewer page when the toolbar icon is clicked.
//   2. Allow the content script to stash JSON text in chrome.storage.session
//      so the viewer can pick it up (in-memory only, cleared on browser close).
//
// No network calls, no analytics, no telemetry. Ever.

// Let content scripts read/write session storage (used only for the JSON handoff).
try {
  if (chrome.storage && chrome.storage.session && chrome.storage.session.setAccessLevel) {
    chrome.storage.session.setAccessLevel({
      accessLevel: "TRUSTED_AND_UNTRUSTED_CONTEXTS",
    });
  }
} catch (e) {
  // setAccessLevel may not exist on older Chrome; the standalone viewer still works.
}

chrome.action.onClicked.addListener(function () {
  chrome.tabs.create({ url: chrome.runtime.getURL("viewer.html") });
});
