// State variables
let editingState = false
let editingSet = ""

// Transition Methods
async function transition(elem, duration, animations, direction="normal") {
    elem.style.animation = animations
    elem.style.animationDuration = duration
    elem.style.animationDirection = direction
}

// Page Changing methods
async function switchPanel(setName) {
    // Switching panels
    for (let e of document.body.querySelectorAll("*")) {
        // Transitioning out
        if (e.style.visibility != "hidden") {
            transition(e, "300ms", "fadeout")
            e.style.visibility = "hidden"
        }
    }

    await new Promise(resolve => setTimeout(resolve, 300));

    await chrome.storage.local.get(['userLocal'], async function (result) {
        let user = result.userLocal;
        user.set = setName
        user.panel = "set"
        await chrome.storage.local.set({ userLocal: user }, function () { });
    });3

    await chrome.sidePanel.setOptions({ path: `setpanel/setpanel.html`})
}

// Retrieving elements
var settings = document.getElementById("settings")

var setscontainer = document.getElementById("sets-container")
var store = document.getElementById("store")
var upload = document.getElementById("upload")

// Bottom of the screen stuff
var bottombuttons = document.getElementById("bottom-buttons")
var add = document.getElementById("add")
var search = document.getElementById("search")

var bottominputs1 = document.getElementById("bottom-inputs1")
var searching = document.getElementById("searching")
var close1 = document.getElementById("close1")

var bottominputs2 = document.getElementById("bottom-inputs2")
var adding = document.getElementById("naming")
var close2 = document.getElementById("close2")

var bottom = document.getElementById("bottom")

// Retrieving sets
chrome.storage.local.get(['userLocal'], async function (result) {
    let user = result.userLocal
    let existingSets = Object.keys(user.flashcards)

    for (let setName of existingSets) {
        // Creating existing set objects
        let setToAdd = document.createElement("button")
        setToAdd.setAttribute("class", "set")
        setToAdd.innerHTML = setName

        // Adding function to each set
        setToAdd.addEventListener("click", async function() {
            if (editingState) {
                if (editingSet != setToAdd.innerHTML) {
                    if (editingSet == "") {
                        uploadState = false

                        transition(close2, "500ms", "fadein")
                        transition(adding, "500ms", "fadein")

                        close2.style.opacity = 1
                        close2.style.width = "60px"
                        adding.style.opacity = 1
                        adding.style.width = "calc(100% - 80px)"

                        bottom.removeChild(bottominputs2)
                        bottom.appendChild(bottominputs2)

                        // Changing close2 image
                        let trash = document.createElement("img")
                        trash.setAttribute("id","trash")
                        trash.setAttribute("src","delete.png")
                        close2.replaceChildren(trash)

                        adding.setAttribute("placeholder", "Rename")
                        adding.value = ""
                    }

                    await new Promise(resolve => setTimeout(resolve, 500));

                    editingSet = setToAdd.innerHTML
                } else {
                    uploadState = false

                    transition(close2, "500ms", "fadeout")
                    transition(adding, "500ms", "fadeout")

                    close2.style.opacity = 0
                    adding.style.opacity = 0

                    await new Promise(resolve => setTimeout(resolve, 500));
                    editingSet = ""
                }
            } else {
                // Switching panels
                await switchPanel(setToAdd.innerHTML);
            }
        })

        // Hover stuff
        setToAdd.addEventListener("mouseover", async function() {
            transition(setToAdd, "300ms", ((editingState)? "color2": "color1"))

            if (editingState) {
                setToAdd.style.backgroundColor = "#125e44"
            } else {
                setToAdd.style.backgroundColor = "#3d178f"
            }
        })

        setToAdd.addEventListener("mouseleave", async function() {
            transition(setToAdd, "300ms", ((editingState)? "color2": "color1"), "reverse")

            if (editingState) {
                setToAdd.style.backgroundColor = "#003c28"
            } else {
                setToAdd.style.backgroundColor = "#250074"
            }
        })

        // Adding to container
        setscontainer.appendChild(setToAdd)
    }
})

// Going to adding sets
add.onclick = async function () {
    transition(add, "500ms", "grow, fadeout")
    transition(search, "500ms", "shrink, fadeout")

    add.style.opacity = 0
    add.style.width = "calc(100% - 80px)"
    search.style.opacity = 0
    search.style.width = "60px"

    transition(close2, "500ms", "shrink, fadein")
    transition(adding, "500ms", "grow, fadein")

    close2.style.opacity = 1
    close2.style.width = "60px"
    adding.style.opacity = 1
    adding.style.width = "calc(100% - 80px)"

    bottom.removeChild(bottominputs2)
    bottom.appendChild(bottominputs2)

    adding.focus()
}

// Adding sets
adding.addEventListener("keypress", async (e) => {
    if (e.key == "Enter" && adding.value != "") {
        if (!uploadState) {
            // Checking for existing set name
            let match = false
            for (let set of [...setscontainer.children]){
                if (set.innerHTML == adding.value){
                    match = true
                }
            }

            if (match){
                // Name already exists
                transition(adding, "200ms", "shake")
                await new Promise(resolve => setTimeout(resolve, 200));
                adding.style.animation = null
                adding.value = ""
            } else{
                if (!editingState){
                    // Adding the set
                    addSet(adding.value)
                } else{
                    // Changing set name
                    for (let set of [...setscontainer.children]){
                        if (set.innerHTML == editingSet){
                            set.innerHTML = adding.value
                        }
                    }

                    chrome.storage.local.get(['userLocal'], async function (result) {
                        let user = result.userLocal
                        let terms = user.flashcards[editingSet]
                        user.flashcards[adding.value] = terms
                        delete user.flashcards[editingSet]
                        await chrome.storage.local.set({userLocal: user}, function () {});

                        editingSet = adding.value
                        adding.value = ""
                    })
                }
            }
        } else {
            let addV = adding.value

            chrome.storage.local.get(['userLocal'], async function (result) {
                let user = result.userLocal

                let flashAndDefs = hexToString(addV).split("|")

                user.flashcards = JSON.parse(flashAndDefs[0])
                user.definitions = JSON.parse(flashAndDefs[1])

                for (let child of [...setscontainer.children]) {
                    setscontainer.removeChild(child)
                }

                let existingSets = Object.keys(user.flashcards)

                for (let setName of existingSets) {
                    // Creating existing set objects
                    let setToAdd = document.createElement("button")
                    setToAdd.setAttribute("class", "set")
                    setToAdd.innerHTML = setName

                    // Adding function to each set
                    setToAdd.addEventListener("click", async function() {
                        if (editingState) {
                            if (editingSet != setToAdd.innerHTML) {
                                if (editingSet == "") {
                                    uploadState = false

                                    transition(close2, "500ms", "fadein")
                                    transition(adding, "500ms", "fadein")

                                    close2.style.opacity = 1
                                    close2.style.width = "60px"
                                    adding.style.opacity = 1
                                    adding.style.width = "calc(100% - 80px)"

                                    bottom.removeChild(bottominputs2)
                                    bottom.appendChild(bottominputs2)

                                    // Changing close2 image
                                    let trash = document.createElement("img")
                                    trash.setAttribute("id","trash")
                                    trash.setAttribute("src","delete.png")
                                    close2.replaceChildren(trash)

                                    adding.setAttribute("placeholder", "Rename")
                                    adding.value = ""
                                }

                                await new Promise(resolve => setTimeout(resolve, 500));

                                editingSet = setToAdd.innerHTML
                            } else {
                                uploadState = false

                                transition(close2, "500ms", "fadeout")
                                transition(adding, "500ms", "fadeout")

                                close2.style.opacity = 0
                                adding.style.opacity = 0

                                await new Promise(resolve => setTimeout(resolve, 500));
                                editingSet = ""
                            }
                        } else {
                            // Switching panels
                            await switchPanel(setToAdd.innerHTML);
                        }
                    })

                    // Hover stuff
                    setToAdd.addEventListener("mouseover", async function() {
                        transition(setToAdd, "300ms", ((editingState)? "color2": "color1"))

                        if (editingState) {
                            setToAdd.style.backgroundColor = "#125e44"
                        } else {
                            setToAdd.style.backgroundColor = "#3d178f"
                        }
                    })

                    setToAdd.addEventListener("mouseleave", async function() {
                        transition(setToAdd, "300ms", ((editingState)? "color2": "color1"), "reverse")

                        if (editingState) {
                            setToAdd.style.backgroundColor = "#003c28"
                        } else {
                            setToAdd.style.backgroundColor = "#250074"
                        }
                    })

                    // Adding to container
                    setscontainer.appendChild(setToAdd)
                }

                await chrome.storage.local.set({userLocal: user}, function () {});
            })

            adding.value = ""

            transition(add, "500ms", "fadein, shrink")
            transition(search, "500ms", "fadein, grow")

            add.style.opacity = 1
            add.style.width = "60px"
            search.style.opacity = 1
            search.style.width = "calc(100% - 80px)"

            transition(adding, "500ms", "shrink, fadeout")
            transition(close2, "500ms", "grow, fadeout")

            adding.style.opacity = 0
            adding.style.width = "60px"
            close2.style.opacity = 0
            close2.style.width = "calc(100% - 80px)"

            editingState = false
            uploadState = false
            editingSet = ""

            upload.style.transform = "rotate(0deg)"
            store.style.color = "#b2ffd7"
            transition(store, "500ms", "setcolor")
            store.style.backgroundColor = "#250074"

            bottom.removeChild(bottombuttons)
            bottom.appendChild(bottombuttons)

            await new Promise(resolve => setTimeout(resolve, 500));
            adding.setAttribute("placeholder", "Set name")
        }
    }
})

async function addSet(setName) {
    let setToAdd = document.createElement("button")
    setToAdd.setAttribute("class", "set")
    setToAdd.innerHTML = setName

    // Adding function to the set
    setToAdd.addEventListener("click", async function() {
        if (editingState) {
            if (editingSet != setToAdd.innerHTML) {
                if (editingSet == "") {
                    uploadState = false
                    transition(close2, "500ms", "fadein")
                    transition(adding, "500ms", "fadein")

                    close2.style.opacity = 1
                    close2.style.width = "60px"
                    adding.style.opacity = 1
                    adding.style.width = "calc(100% - 80px)"

                    bottom.removeChild(bottominputs2)
                    bottom.appendChild(bottominputs2)

                    // Changing close2 image
                    let trash = document.createElement("img")
                    trash.setAttribute("id","trash")
                    trash.setAttribute("src","delete.png")
                    close2.replaceChildren(trash)

                    adding.setAttribute("placeholder", "Rename")
                    adding.value = ""
                }

                await new Promise(resolve => setTimeout(resolve, 500));

                editingSet = setToAdd.innerHTML
            } else {
                uploadState = false

                transition(close2, "500ms", "fadeout")
                transition(adding, "500ms", "fadeout")

                close2.style.opacity = 0
                adding.style.opacity = 0

                await new Promise(resolve => setTimeout(resolve, 500));
                editingSet = ""
            }
        } else {
            // Switching panels
            await switchPanel(setToAdd.innerHTML);
        }
    })

    // Hover stuff
    setToAdd.addEventListener("mouseover", async function() {
        transition(setToAdd, "300ms", ((editingState)? "color2": "color1"))

        if (editingState) {
            setToAdd.style.backgroundColor = "#125e44"
        } else {
            setToAdd.style.backgroundColor = "#3d178f"
        }
    })

    setToAdd.addEventListener("mouseleave", async function() {
        transition(setToAdd, "300ms", ((editingState)? "color2": "color1"), "reverse")

        if (editingState) {
            setToAdd.style.backgroundColor = "#003c28"
        } else {
            setToAdd.style.backgroundColor = "#250074"
        }
    })

    // Adding to container
    setscontainer.appendChild(setToAdd)

    // Adding to storage
    await chrome.storage.local.get(['userLocal'], async function (result) {
        let user = result.userLocal;
        user.flashcards[setName] = []
        await chrome.storage.local.set({ userLocal: user }, function () { });
    });

    adding.value = ""
}

// Returning from adding sets
close2.onclick = async function () {
    if (!uploadState) {
        if (!editingState) {
            transition(add, "500ms", "shrink, fadein")
            transition(search, "500ms", "grow, fadein")

            add.style.opacity = 1
            add.style.width = "60px"
            search.style.opacity = 1
            search.style.width = "calc(100% - 80px)"

            transition(adding, "500ms", "shrink, fadeout")
            transition(close2, "500ms", "grow, fadeout")

            adding.style.opacity = 0
            adding.style.width = "60px"
            close2.style.opacity = 0
            close2.style.width = "calc(100% - 80px)"

            adding.value = ""

            bottom.removeChild(bottombuttons)
            bottom.appendChild(bottombuttons)
        } else{
            for (let set of [...setscontainer.children]){
                if (set.innerHTML == editingSet) {
                    setscontainer.removeChild(set)
                }
            }

            await chrome.storage.local.get(['userLocal'], async function (result) {
                let user = result.userLocal;
                delete user.flashcards[editingSet]
                await chrome.storage.local.set({ userLocal: user }, function () { });
                editingSet = ""
            });

            transition(adding, "500ms", "fadeout")
            transition(close2, "500ms", "fadeout")

            adding.style.opacity = 0
            close2.style.opacity = 0

            adding.value = ""

            if ([...setscontainer.children].length == 0) {
                // Changing set colors
                for (let set of [...setscontainer.children]){
                    set.style.color = "#b2ffd7"
                    transition(set, "500ms", "setcolor")
                    set.style.backgroundColor = "#250074"
                }
                
                // Changing bottom elements back
                if (editingSet != "") {
                    transition(add, "500ms", "shrink, fadein")
                    transition(search, "500ms", "grow, fadein")

                    add.style.opacity = 1
                    add.style.width = "60px"
                    search.style.opacity = 1
                    search.style.width = "calc(100% - 80px)"

                    transition(adding, "500ms", "shrink, fadeout")
                    transition(close2, "500ms", "grow, fadeout")

                    adding.style.opacity = 0
                    adding.style.width = "60px"
                    close2.style.opacity = 0
                    close2.style.width = "calc(100% - 80px)"

                    adding.value = ""

                    bottom.removeChild(bottombuttons)
                    bottom.appendChild(bottombuttons)
                } else {
                    transition(add, "500ms", "fadein")
                    transition(search, "500ms", "fadein")

                    add.style.opacity = 1
                    search.style.opacity = 1

                    bottom.removeChild(bottombuttons)
                    bottom.appendChild(bottombuttons)
                }

                // Changing close2 image back
                let close = document.createElement("img")
                close.setAttribute("id","X-image")
                close.setAttribute("src","X.png")
                close2.replaceChildren(close)

                // Changing adding placeholder back
                adding.setAttribute("placeholder", "Set name")

                upload.style.transform = "rotate(0deg)"
                store.style.color = "#b2ffd7"
                transition(store, "500ms", "setcolor")
                store.style.backgroundColor = "#250074"

                editingState = false
            }
        }
    } else {
        editingSet = ""
        uploadState = false

        transition(adding, "500ms", "shrink, fadeout")
        transition(close2, "500ms", "grow, fadeout")

        adding.style.opacity = 0
        adding.style.width = "60px"
        close2.style.opacity = 0
        close2.style.width = "calc(100% - 80px)"

        await new Promise(resolve => setTimeout(resolve, 500));
        // Changing close2 image
        let trash = document.createElement("img")
        trash.setAttribute("id","trash")
        trash.setAttribute("src","delete.png")
        close2.replaceChildren(trash)

        adding.setAttribute("placeholder", "Rename")
        adding.value = ""
    }
}

// Going to search sets
search.onclick = async function () {
    transition(add, "500ms", "grow, fadeout")
    transition(search, "500ms", "shrink, fadeout")

    search.style.opacity = 0
    search.style.width = "60px"
    add.style.opacity = 0
    add.style.width = "calc(100% - 80px)"

    transition(close1, "500ms", "shrink, fadein")
    transition(searching, "500ms", "grow, fadein")

    close1.style.opacity = 1
    close1.style.width = "60px"
    searching.style.opacity = 1
    searching.style.width = "calc(100% - 80px)"

    bottom.removeChild(bottominputs1)
    bottom.appendChild(bottominputs1)

    searching.focus()
}

// Searching sets

// Returning from searching sets
close1.onclick = async function () {
    for (let set of [...setscontainer.children]) {
        set.style.backgroundColor = "#250074"
        set.style.opacity = 1
    }

    transition(add, "500ms", "shrink, fadein")
    transition(search, "500ms", "grow, fadein")

    add.style.opacity = 1
    add.style.width = "60px"
    search.style.opacity = 1
    search.style.width = "calc(100% - 80px)"

    transition(searching, "500ms", "shrink, fadeout")
    transition(close1, "500ms", "grow, fadeout")

    close1.style.opacity = 0
    close1.style.width = "calc(100% - 80px)"
    searching.style.opacity = 0
    searching.style.width = "60px"

    searching.value = ""

    bottom.removeChild(bottombuttons)
    bottom.appendChild(bottombuttons)
}

// Magic Ahan stuff
function wordDist(wa, wb) {
    if (wa.length == 0) return wb.length;
    if (wb.length == 0) return wa.length;
    
    let arr = new Array(wb.length);
    for (let i = 0; i < wb.length; i++) {
      arr[i] = new Array(wa.length);
      for (let j = 0; j < wa.length; j++) {
        let l = (j == 0)? i+1 : arr[i][j-1];
        let u = (i == 0)? j+1 : arr[i-1][j];
        let ul = (i == 0)? j : ((j == 0)? i: arr[i-1][j-1]);
        
        let subCost = 0;
        if (wa[j] != wb[i]) subCost++;
        
        arr[i][j] = Math.min(l+1, u+1, ul+subCost);
      }
    }
    return arr[wb.length-1][wa.length-1];
  }
  
function phraseDist(a, b) {
    a = a.toLowerCase().split(" ");
    b = b.toLowerCase().split(" ");
    
    let arr = new Array(b.length+1);
    arr[0] = new Array(a.length+1);
    arr[0][0] = 0;
    let c = 0;
    for (let j = 0; j < a.length; j++) {
      c+=a[j].length;
      arr[0][j+1] = c;
    }
    c = 0;
    for (let i = 0; i < b.length; i++) {
      arr[i+1] = new Array(a.length+1);
      c+=b[i].length;
      arr[i+1][0] = 0;
    }
    
    for (let i = 0; i < b.length; i++) {
      for (let j = 0; j < a.length; j++) {
        let cost = wordDist(a[j], b[i]);
        
        let l = arr[i][j+1];
        let u = arr[i+1][j]+a[j].length;
        let ul = arr[i][j]+2*cost;
        arr[i+1][j+1] = Math.min(l, u, ul);
      }
    }
    return arr[b.length][a.length];
}

searching.addEventListener("keyup", async (e) => {
    let sets = [...setscontainer.children]

    let scrs = sets.map((set)=>{
        return phraseDist(searching.value, set.innerHTML)
    })

    let mscr = Math.min(...scrs)
    let Mscr = Math.max(...scrs)

    if (Mscr - mscr < 2) {
        for (let i = 0; i < sets.length; i++) {
            sets[i].style.backgroundColor = "#250074"
            sets[i].style.opacity = 0.3
        }
        return 
    }

    for (let i = 0; i < sets.length; i++) {
        if (scrs[i] < mscr + 2) {
            sets[i].style.backgroundColor = "#3d178f"
            sets[i].style.opacity = 1
        } else {
            sets[i].style.backgroundColor = "#250074"
            sets[i].style.opacity = 0.3
        }
    }
})

// Settings click
settings.onclick = async function() {
    if (!editingState) {
        // Rotate upload image
        upload.style.transform = "rotate(180deg)"

        store.style.color = "#b08cff"
        transition(store, "500ms", "setcolor", "reverse")
        store.style.backgroundColor = "#003c28"

        // Changing set colors
        for (let set of [...setscontainer.children]){
            set.style.color = "#b08cff"
            transition(set, "500ms", "setcolor", "reverse")
            set.style.backgroundColor = "#003c28"
        }

        editingState = true

        if (add.style.visibility == "visible" || add.style.visibility == "") {
            transition(add, "500ms", "fadeout")
            transition(search, "500ms", "fadeout")
        }

        if (close2.style.opacity == 1) {
            transition(close2, "500ms", "fadeout")
            transition(adding, "500ms", "fadeout")
        }

        if (close1.style.opacity == 1) {
            transition(close1, "500ms", "fadeout")
            transition(searching, "500ms", "fadeout")
        }

        add.style.opacity = 0
        add.style.width = "60px"
        search.style.opacity = 0
        search.style.width = "calc(100% - 80px)"

        close2.style.opacity = 0
        close2.style.width = "60px"
        adding.style.opacity = 0
        adding.style.width = "calc(100% - 80px)"

        close1.style.opacity = 0
        searching.style.opacity = 0

        editingSet = ""

        await new Promise(resolve => setTimeout(resolve, 500));

        // Changing close2 image
        let trash = document.createElement("img")
        trash.setAttribute("id","trash")
        trash.setAttribute("src","delete.png")
        close2.replaceChildren(trash)

        // Changing adding to renaming
        adding.setAttribute("placeholder", "Rename")
    } else {
        // Rotate upload image
        upload.style.transform = "rotate(0deg)"

        store.style.color = "#b2ffd7"
        transition(store, "500ms", "setcolor")
        store.style.backgroundColor = "#250074"

        // Changing set colors
        for (let set of [...setscontainer.children]){
            set.style.color = "#b2ffd7"
            transition(set, "500ms", "setcolor")
            set.style.backgroundColor = "#250074"
        }
        
        // Changing bottom elements back
        if (editingSet != "") {
            transition(add, "500ms", "shrink, fadein")
            transition(search, "500ms", "grow, fadein")

            add.style.opacity = 1
            add.style.width = "60px"
            search.style.opacity = 1
            search.style.width = "calc(100% - 80px)"

            transition(adding, "500ms", "shrink, fadeout")
            transition(close2, "500ms", "grow, fadeout")

            adding.style.opacity = 0
            adding.style.width = "60px"
            close2.style.opacity = 0
            close2.style.width = "calc(100% - 80px)"

            adding.value = ""

            bottom.removeChild(bottombuttons)
            bottom.appendChild(bottombuttons)
        } else {
            bottom.removeChild(bottombuttons)
            bottom.appendChild(bottombuttons)

            if (uploadState) {
                uploadState = false

                transition(add, "500ms", "fadein, shrink")
                transition(search, "500ms", "fadein, grow")

                add.style.opacity = 1
                add.style.width = "60px"
                search.style.opacity = 1
                search.style.width = "calc(100% - 80px)"

                transition(adding, "500ms", "shrink, fadeout")
                transition(close2, "500ms", "grow, fadeout")

                adding.style.opacity = 0
                adding.style.width = "60px"
                close2.style.opacity = 0
                close2.style.width = "calc(100% - 80px)"

                await new Promise(resolve => setTimeout(resolve, 500));
                adding.setAttribute("placeholder", "Rename")
                adding.value = ""
            } else {
                transition(add, "500ms", "fadein")
                transition(search, "500ms", "fadein")
    
                add.style.opacity = 1
                search.style.opacity = 1
            }
        }

        // Changing close2 image back
        let close = document.createElement("img")
        close.setAttribute("id","X-image")
        close.setAttribute("src","X.png")
        close2.replaceChildren(close)

        // Changing adding placeholder back
        adding.setAttribute("placeholder", "Set name")

        editingState = false
    }
}

// Copying
async function copyTextToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
}

// Uploading and Saving
var uploadState = false

store.addEventListener("click", async () => {
    if (editingState) {
        if (!uploadState) {
            uploadState = true

            if (editingSet == "") {
                transition(close2, "500ms", "shrink, fadein")
                transition(adding, "500ms", "grow, fadein")
    
                close2.style.opacity = 1
                close2.style.width = "60px"
                adding.style.opacity = 1
                adding.style.width = "calc(100% - 80px)"
            } else {
                editingSet = ""

                transition(close2, "500ms", "fadein")
                transition(adding, "500ms", "fadein")

                close2.style.opacity = 1
                adding.style.opacity = 1
            }

            bottom.removeChild(bottominputs2)
            bottom.appendChild(bottominputs2)

            adding.setAttribute("placeholder", "Upload sets")
            adding.focus()

            // Changing close2 image back
            let close = document.createElement("img")
            close.setAttribute("id","X-image")
            close.setAttribute("src","X.png")
            close2.replaceChildren(close)
        } else {
            editingSet = ""
            uploadState = false

            transition(adding, "500ms", "shrink, fadeout")
            transition(close2, "500ms", "grow, fadeout")

            adding.style.opacity = 0
            adding.style.width = "60px"
            close2.style.opacity = 0
            close2.style.width = "calc(100% - 80px)"

            await new Promise(resolve => setTimeout(resolve, 500));
            // Changing close2 image
            let trash = document.createElement("img")
            trash.setAttribute("id","trash")
            trash.setAttribute("src","delete.png")
            close2.replaceChildren(trash)

            adding.setAttribute("placeholder", "Rename")
            adding.value = ""
        }
    } else {
        chrome.storage.local.get(['userLocal'], async function (result) {
            let user = result.userLocal
            let text = JSON.stringify(user.flashcards) + "|" + JSON.stringify(user.definitions)
            //Buffer.from(text, "utf8").toString("hex")
            copyTextToClipboard(stringToHex(text))
        })
    }
})

// More hover stuff
store.addEventListener("mouseover", async function() {
    transition(store, "300ms", ((editingState)? "color2": "color1"))

    if (editingState) {
        store.style.backgroundColor = "#125e44"
    } else {
        store.style.backgroundColor = "#3d178f"
    }
})

store.addEventListener("mouseleave", async function() {
    transition(store, "300ms", ((editingState)? "color2": "color1"), "reverse")

    if (editingState) {
        store.style.backgroundColor = "#003c28"
    } else {
        store.style.backgroundColor = "#250074"
    }
})

// String to hex
function stringToHex(str) {
    let hex = "";
    for (let i = 0; i < str.length; i++) {
        hex += str.charCodeAt(i).toString(16).padStart(2, '0');
    }
    return hex;
}

// Hex to string
function hexToString(hex) {
    let str = '';
    for (let n = 0; n < hex.length; n += 2) {
        str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
    }
    return str;
}