chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => console.error(error));

chrome.storage.local.get(['userLocal'], async function () {
    let user = {
        set: "",
        term: "",
        flashcards: {},
        definitions: {},
        panel: "main"
    }
    await chrome.storage.local.set({userLocal: user}, function () {});
})
