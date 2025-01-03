// State variables
let editingState = false
let editingDef = ""

// Transition Methods
function transition(elem, duration, animations, direction="normal") {
    elem.style.animation = animations
    elem.style.animationDuration = duration
    elem.style.animationDirection = direction
}

// Page Changing methods
async function returnPanel() {
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
        user.panel = "set"
        user.term = ""
        await chrome.storage.local.set({ userLocal: user }, function () { });
    });

    await chrome.sidePanel.setOptions({ path: `setpanel/setpanel.html`})
}

// Retrieving elements
var returnButton = document.getElementById("return")
var termHeading = document.getElementById("termHeading")
var settings = document.getElementById("settings")

var defscontainer = document.getElementById("definitions-container")
var noDefs = null

// Bottom of the screen stuff
var bottombuttons = document.getElementById("bottom-buttons")
var add = document.getElementById("add")

var bottominputs2 = document.getElementById("bottom-inputs2")
var adding = document.getElementById("naming")
var close2 = document.getElementById("close2")

var bottom = document.getElementById("bottom")

// Returning to main page

returnButton.onclick = async function() {
    returnPanel()
}

// Retrieving definitions
chrome.storage.local.get(['userLocal'], async function (result) {
    let user = result.userLocal
    let existingDefs = user.definitions[user.term]

    // No definitions yet
    let noDefs1 = document.createElement("button")
    noDefs1.setAttribute("class", "definition")
    noDefs1.setAttribute("id", "placeholder")
    noDefs1.innerHTML = "No definitions yet"

    defscontainer.appendChild(noDefs1)

    noDefs = noDefs1

    // Getting current definition
    if (user.term.length > 21) {
        let limit = ""
        for (let i = 0; i < 18; i++) {
            limit += user.term[i]
        }
        termHeading.innerHTML = limit + "..."
    } else {
        termHeading.innerHTML = user.term
    }

    if (existingDefs.length > 0) {
        defscontainer.removeChild(noDefs)
    }

    for (let defName of existingDefs) {
        // Creating existing term objects
        let defToAdd = document.createElement("button")
        defToAdd.setAttribute("class", "definition")
        defToAdd.innerHTML = defName

        // Adding function to each term
        defToAdd.addEventListener("click", async function() {
            if (editingState) {
                if (editingDef != defToAdd.innerHTML) {
                    if (editingDef == "") {
                        transition(close2, "500ms", "fadein")
                        transition(adding, "500ms", "fadein")

                        close2.style.opacity = 1
                        adding.style.opacity = 1

                        bottom.removeChild(bottominputs2)
                        bottom.appendChild(bottominputs2)
                    }

                    await new Promise(resolve => setTimeout(resolve, 500));

                    editingDef = defToAdd.innerHTML
                } else {
                    transition(close2, "500ms", "fadeout")
                    transition(adding, "500ms", "fadeout")

                    close2.style.opacity = 0
                    adding.style.opacity = 0

                    await new Promise(resolve => setTimeout(resolve, 500));
                    editingDef = ""
                }
            }
        })

        // Hover stuff
        defToAdd.addEventListener("mouseover", async function() {
            if(editingState) {
                transition(defToAdd, "300ms", "color2")
                defToAdd.style.backgroundColor = "rgb(26, 88, 179)"
            }
        })

        defToAdd.addEventListener("mouseleave", async function() {
            if (editingState) {
                transition(defToAdd, "300ms", "color2", "reverse")
                defToAdd.style.backgroundColor = "rgb(18, 65, 134)"
            }
        })

        // Adding to container
        defscontainer.appendChild(defToAdd)
    }
})

// Going to adding definitions
add.onclick = async function () {
    transition(add, "500ms", "fadeout")

    add.style.opacity = 0

    transition(close2, "500ms", "fadein")
    transition(adding, "500ms", "fadein")

    close2.style.opacity = 1
    adding.style.opacity = 1

    bottom.removeChild(bottominputs2)
    bottom.appendChild(bottominputs2)

    adding.focus()
}

// Adding definitions
adding.addEventListener("keypress", async (e) => {
    if (e.key == "Enter" && adding.value != "") {
        // Checking for existing term name
        let match = false
        for (let def of [...defscontainer.children]){
            if (def.innerHTML == adding.value){
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
                // Adding the definition
                addDef(adding.value)
            } else{
                // Redefining
                for (let def of [...defscontainer.children]){
                    if (def.innerHTML == editingDef){
                        def.innerHTML = adding.value
                    }
                }

                chrome.storage.local.get(['userLocal'], async function (result) {
                    let user = result.userLocal
                    let defs = user.definitions[user.term]
                    
                    for (let i = 0; i < defs.length; i++) {
                        if (defs[i] == editingDef) {
                            user.definitions[user.term][i] = adding.value
                            break
                        }
                    }

                    await chrome.storage.local.set({userLocal: user}, function () {});

                    editingDef = adding.value

                    adding.value = ""
                })
            }
        }
    }
})

async function addDef(defName) {
    let defToAdd = document.createElement("button")
    defToAdd.setAttribute("class", "definition")
    defToAdd.innerHTML = defName

    if ([...defscontainer.children].length == 1) {
        if ([...defscontainer.children][0].innerHTML == "No definitions yet") {
            defscontainer.removeChild(noDefs)
        }
    }

    // Adding function to each term
    defToAdd.addEventListener("click", async function() {
        if (editingState) {
            if (editingDef != defToAdd.innerHTML) {
                if (editingDef == "") {
                    transition(close2, "500ms", "fadein")
                    transition(adding, "500ms", "fadein")

                    close2.style.opacity = 1
                    adding.style.opacity = 1

                    bottom.removeChild(bottominputs2)
                    bottom.appendChild(bottominputs2)
                }

                await new Promise(resolve => setTimeout(resolve, 500));

                editingDef = defToAdd.innerHTML
            } else {
                transition(close2, "500ms", "fadeout")
                transition(adding, "500ms", "fadeout")

                close2.style.opacity = 0
                adding.style.opacity = 0

                await new Promise(resolve => setTimeout(resolve, 500));
                editingDef = ""
            }
        }
    })

    // Hover stuff
    defToAdd.addEventListener("mouseover", async function() {
        if(editingState) {
            transition(defToAdd, "300ms", "color2")
            defToAdd.style.backgroundColor = "rgb(26, 88, 179)"
        }
    })

    defToAdd.addEventListener("mouseleave", async function() {
        if (editingState) {
            transition(defToAdd, "300ms", "color2", "reverse")
            defToAdd.style.backgroundColor = "rgb(18, 65, 134)"
        }
    })

    // Adding to container
    defscontainer.appendChild(defToAdd)

    // Adding to storage
    await chrome.storage.local.get(['userLocal'], async function (result) {
        let user = result.userLocal;

        user.definitions[user.term].push(defName)
        await chrome.storage.local.set({ userLocal: user }, function () { });
    });

    adding.value = ""
}

// Returning from adding terms
close2.onclick = async function () {
    if (!editingState) {
        transition(add, "500ms", "fadein")

        add.style.opacity = 1

        transition(adding, "500ms", "fadeout")
        transition(close2, "500ms", "fadeout")

        adding.style.opacity = 0
        close2.style.opacity = 0

        adding.value = ""

        bottom.removeChild(bottombuttons)
        bottom.appendChild(bottombuttons)
    } else{
        // Deleting definition
        for (let def of [...defscontainer.children]){
            if (def.innerHTML == editingDef) {
                defscontainer.removeChild(def)
            }
        }

        await chrome.storage.local.get(['userLocal'], async function (result) {
            let user = result.userLocal;
            let defs = user.definitions[user.term]

            for (let i = 0; i < defs.length; i++) {
                if (defs[i] == editingDef) {
                    user.definitions[user.term].splice(i,1)
                    break
                }
            }

            if (defs.length == 0) {
                let noDefs1 = document.createElement("button")
                noDefs1.setAttribute("class", "definition")
                noDefs1.setAttribute("id", "placeholder")
                noDefs1.innerHTML = "No definitions yet"

                defscontainer.appendChild(noDefs1)

                noDefs = noDefs1
            }

            await chrome.storage.local.set({ userLocal: user }, function () { });
            editingDef = ""
        });

        transition(adding, "500ms", "fadeout")
        transition(close2, "500ms", "fadeout")

        adding.style.opacity = 0
        close2.style.opacity = 0

        adding.value = ""

        if ([...defscontainer.children].length == 0) {
            // Changing definition colors
            for (let def of [...defscontainer.children]){
                def.style.color = "#b08cff"
                transition(def, "500ms", "setcolor", "reverse")
                def.style.backgroundColor = "rgb(28, 50, 84)"
            }

            // Changing bottom elements back
            if (editingDef != "") {
                transition(add, "500ms", "fadein")

                add.style.opacity = 1

                transition(adding, "500ms", "fadeout")
                transition(close2, "500ms", "fadeout")

                adding.style.opacity = 0
                close2.style.opacity = 0

                adding.value = ""

                bottom.removeChild(bottombuttons)
                bottom.appendChild(bottombuttons)
            } else {
                transition(add, "500ms", "fadein")

                add.style.opacity = 1

                bottom.removeChild(bottombuttons)
                bottom.appendChild(bottombuttons)
            }

            await new Promise(resolve => setTimeout(resolve, 500));
            // Changing close2 image back
            let close = document.createElement("img")
            close.setAttribute("id","X-image")
            close.setAttribute("src","X.png")
            close2.replaceChildren(close)

            // Changing adding placeholder back
            adding.setAttribute("placeholder", "Definition")

            editingState = false
        }
    }
}

// Settings click
settings.onclick = async function() {
    if (!editingState) {
        // Changing definition colors
        for (let def of [...defscontainer.children]){
            def.style.color = "#b08cff"
            transition(def, "500ms", "setcolor", "reverse")
            def.style.backgroundColor = "rgb(18, 65, 134)"
        }

        editingState = true

        if (add.style.visibility == "visible" || add.style.visibility == "") {
            transition(add, "500ms", "fadeout")
        }

        if (close2.style.opacity == 1) {
            transition(close2, "500ms", "fadeout")
            transition(adding, "500ms", "fadeout")
        }

        add.style.opacity = 0

        close2.style.opacity = 0
        adding.style.opacity = 0

        editingDef = ""

        await new Promise(resolve => setTimeout(resolve, 500));

        // Changing close2 image
        let trash = document.createElement("img")
        trash.setAttribute("id","trash")
        trash.setAttribute("src","delete.png")
        close2.replaceChildren(trash)

        // Changing adding to renaming
        adding.setAttribute("placeholder", "Rename")
    } else {
        // Changing definition colors
        for (let def of [...defscontainer.children]){
            def.style.color = "#b08cff"
            transition(def, "500ms", "setcolor", "reverse")
            def.style.backgroundColor = "rgb(28, 50, 84)"
        }

        // Changing bottom elements back
        if (editingDef != "") {
            transition(add, "500ms", "fadein")

            add.style.opacity = 1

            transition(adding, "500ms", "fadeout")
            transition(close2, "500ms", "fadeout")

            adding.style.opacity = 0
            close2.style.opacity = 0

            adding.value = ""

            bottom.removeChild(bottombuttons)
            bottom.appendChild(bottombuttons)
        } else {
            transition(add, "500ms", "fadein")

            add.style.opacity = 1

            bottom.removeChild(bottombuttons)
            bottom.appendChild(bottombuttons)
        }

        await new Promise(resolve => setTimeout(resolve, 500));
        // Changing close2 image back
        let close = document.createElement("img")
        close.setAttribute("id","X-image")
        close.setAttribute("src","X.png")
        close2.replaceChildren(close)

        // Changing adding placeholder back
        adding.setAttribute("placeholder", "Definition")

        editingState = false
    }
}