let timer;
let suggestions;

window.onload = async() => {
    document.getElementById("entity1").addEventListener("keyup", (e) => getSuggestions(e));
    document.getElementById("entity1").addEventListener("paste", (e) => getSuggestions(e));
    document.getElementById("entity2").addEventListener("keyup", (e) => getSuggestions(e));
    document.getElementById("entity2").addEventListener("paste", (e) => getSuggestions(e));
    document.getElementById("search").addEventListener("submit", (e) => search(e));

    document.addEventListener("click", function (e) {
        if(e.target.nodeName === "INPUT"){
            e.preventDefault();
        }

        destroySuggestionList(true, e.target);
    });
}

async function getSuggestions(e){
    clearTimeout(timer); // Clear the timer so we don't end up with dupes.
    timer = setTimeout(async() => { // assign timer a new timeout 
        if(e.target.value === ""){
            return destroySuggestionList(false);
        }

        suggestions = await getArtistsSuggestions(e.target.value); // run ajax request and store in x variable (so we can cancel)
        // console.log(suggestions);

        addSuggestions(e.target, suggestions);
    }, 150); // 2000ms delay, tweak for faster/slower
}

async function addSuggestions(inputEl, suggestions){
    destroySuggestionList(false);

    const suggestionsContainer = document.createElement("DIV");
    suggestionsContainer.setAttribute("id", inputEl.id + "-autocomplete-list");
    suggestionsContainer.setAttribute("class", "autocomplete-items");

    inputEl.parentNode.appendChild(suggestionsContainer);

    Object.entries(suggestions).forEach((entry, index) => {
        [key, value] = entry;

        suggestionDiv = document.createElement("DIV");

        suggestionDiv.setAttribute("id", value.artistId);

        suggestionDiv.innerHTML = "<strong>" + value.stageName.substr(0, inputEl.value.length) + "</strong>";
        suggestionDiv.innerHTML += value.stageName.substr(inputEl.value.length);
        suggestionDiv.innerHTML += value.comment ? `(${value.comment})` : "";
        suggestionDiv.innerHTML += value.origin ? `, ${value.origin}` : "";
        suggestionDiv.innerHTML += `<span class="artist-id">${value.artistId}</span>`;

        suggestionDiv.addEventListener("click", (e) => {
            // console.log(e.target.id)
            inputEl.value = suggestions[e.target.id].stageName;
            inputEl.innerHTML = e.target.id;
            // console.log(inputEl);

            destroySuggestionList(false);
        })
        
        suggestionsContainer.appendChild(suggestionDiv)
    })
}

const destroySuggestionList = (autoSelect, inputEl) => {
    const autoCompleteLists = document.getElementsByClassName("autocomplete-items");

    for(var i = 0; i < autoCompleteLists.length; i++){
        if(!inputEl || inputEl.parentNode != autoCompleteLists[i].parentNode){
            if(autoSelect &&  autoCompleteLists[i].closest("DIV").childNodes[0] && suggestions[autoCompleteLists[i].closest("DIV").childNodes[0].id]){
                autoCompleteLists[i].parentNode.childNodes[3].value = suggestions[autoCompleteLists[i].closest("DIV").childNodes[0].id].stageName;
                autoCompleteLists[i].parentNode.childNodes[3].innerHTML = autoCompleteLists[i].closest("DIV").childNodes[0].id;
            }

            autoCompleteLists[i].parentNode.removeChild(autoCompleteLists[i]);
        }
    }
}

async function search(e){
    const nodes = {
        artist: new Array(),
        release: new Array(),
        track: new Array(),
        label: new Array()
    }

    let releaseNodes = new Array();
    let trackNodes = new Array();
    let artistNodes = new Array();
    let labelNodes = new Array();

    e.preventDefault();

    const resultsEl = document.getElementById("results");

    while(resultsEl.firstChild){
        resultsEl.removeChild(resultsEl.lastChild);
    }

    const loadingDiv = document.createElement(`DIV`);
    const h1Node = document.createElement(`H1`);
    const textNode = document.createTextNode("Finding relationship..");

    loadingDiv.setAttribute("class", "loading");

    h1Node.appendChild(textNode);
    loadingDiv.appendChild(h1Node);
    resultsEl.appendChild(loadingDiv);

    const artist1 = parseInt(e.target[0].textContent);
    const artist2 = parseInt(e.target[1].textContent);

    if(artist1 === artist2){
        let resultNodesDiv = document.createElement("DIV")
        resultNodesDiv.setAttribute("class", "result-nodes");

        const container = document.createElement("DIV");

        container.setAttribute("class", "node");

        const h3 = document.createElement("h3");
        const text1 = document.createTextNode(e.target[0].value);

        const span = document.createElement("SPAN");
        const is = document.createTextNode(" is ")

        span.style.fontWeight = 'bold';

        const text2 = document.createTextNode(e.target[1].value);
        const br = document.createElement("BR");

        h3.appendChild(text1);
        span.appendChild(is);
        h3.appendChild(span);
        h3.appendChild(text2);
        container.appendChild(h3);
        container.appendChild(br);
        resultNodesDiv.appendChild(container);

        resultsEl.removeChild(loadingDiv);
        resultsEl.appendChild(resultNodesDiv);

        return;
    }

    console.log(artist1, artist2);

    console.time("Getting artist data");
    const data = await getArtistsData([artist1, artist2]);
    console.timeEnd("Getting artist data");

    console.log(data);

    Object.values(data.artists).forEach((value) => {
        nodes["artist"].push(new Node(value, "artist"));
    });

    Object.values(data.releases).forEach((value) => {
        nodes["release"].push(new Node(value, "release"));
    });

    Object.values(data.tracks).forEach((value) => {
        nodes["track"].push(new Node(value, "track"));
    });

    Object.values(data.labels).forEach((value) => {
        nodes["label"].push(new Node(value, "label"));
    });

    Object.values(data.artistCreditName).forEach((value) => {
        const releaseNodes = new Array();
        const trackNodes = new Array();
        const artistNodes = new Array();

        nodes["release"].forEach((node) => {
            if(value.creditId === node.getObject().creditId){
                releaseNodes.push(node);
            }

            return;
        });

        nodes["track"].forEach((node) => {
            if(value.creditId === node.getObject().creditId){
                trackNodes.push(node);
            }

            return;
        });

        nodes["artist"].forEach((node) => {
            if(value.artists[node.getObject().id]){
                artistNodes.push(node);
            }

            return;
        });

        releaseNodes.forEach((releaseNode) => {
            releaseNode.addNeighbors(artistNodes);
    
            return;
        });
    
        trackNodes.forEach((trackNode) => {
            trackNode.addNeighbors(artistNodes);
            
            return;
        });
    
        artistNodes.forEach((artistsNode) => {
            artistsNode.addNeighbors(releaseNodes);
            artistsNode.addNeighbors(trackNodes);
    
            return;
        });
    });

    Object.values(data.releaseLabel).forEach((value) => {
        const releaseNodes = new Array();
        const labelNodes = new Array();
    
        nodes["release"].forEach((node) => {
            if(value.releaseId === node.getObject().id){
                releaseNodes.push(node);
            }

            return;
        });

        nodes["label"].forEach((node) => {
            if(value.labels[node.getObject().id] && node.getObject().name && !node.getObject().name.includes("no label") && !node.getObject().name.includes("No label") && !node.getObject().name.includes("No Label") && !node.getObject().name.includes("no Label")){
                labelNodes.push(node);
            }

            return;
        });

        releaseNodes.forEach((releaseNode) => {
            releaseNode.addNeighbors(labelNodes);
    
            return;
        });
    
        labelNodes.forEach((labelNode) => {
            labelNode.addNeighbors(releaseNodes);
    
            return;
        });
    });

    Object.values(data.artistRelationships).forEach((value) => {
        const artist1Nodes = new Array();
        const artist2Nodes = new Array();

        nodes["artist"].forEach((node) => {
            if(node.getObject().id === value.entity0){
                // console.log("artist match 1")
                artist1Nodes.push(node);
            }

            if(node.getObject().id === value.entity1){
                // console.log("artist match 2")
                artist2Nodes.push(node);
            }
        })

        artist1Nodes.forEach((artist) => {
            artist.addNeighbors(artist2Nodes);
        })
        
        artist2Nodes.forEach((artist) => {
            artist.addNeighbors(artist1Nodes);
        })
    })

    Object.values(data.recordingRelationships).forEach((value) => {
        const track1 = new Array();
        const track2 = new Array();

        nodes["track"].forEach((node) => {
            if(node.getObject().recordingId === value.entity0){
                // console.log("track match 1")
                track1.push(node);
            }

            if(node.getObject().recordingId === value.entity1){
                // console.log("track match 2")
                track2.push(node);
            }
        })

        track1.forEach((track) => {
            track.addNeighbors(track2);
        })

        track2.forEach((track) => {
            track.addNeighbors(track1);
        })
    })

    Object.values(data.artistLabelRelationships).forEach((value) => {
        const artists = new Array();
        const labels = new Array();

        nodes["artist"].forEach((node) => {
            if(node.getObject().id === value.entity0){
                // console.log("artist match 1")
                artists.push(node);
            }
        })

        nodes["label"].forEach((node) => {
            if(node.getObject().id === value.entity1){
                // console.log("label match 1")
                labels.push(node);
            }
        })

        artists.forEach((artist) => {
            artist.addNeighbors(labels);
        })
        
        labels.forEach((label) => {
            label.addNeighbors(artists);
        })
    })

    Object.values(data.labelRelationships).forEach((value) => {
        const label1 = new Array();
        const label2 = new Array();

        nodes["label"].forEach((node) => {
            if(node.getObject().id === value.entity0){
                // console.log("label match 1")
                label1.push(node);
            }

            if(node.getObject().id === value.entity1){
                // console.log("label match 2")
                label2.push(node);
            }
        })

        label1.forEach((label) => {
            label.addNeighbors(label2);
        })
        
        label1.forEach((label) => {
            label.addNeighbors(label1);
        })
    })

    releaseNodes = new Array();
    trackNodes = new Array();

    Promise.all(nodes["release"].map((node) => {
        releaseNodes.push(node);

        return;
    }));

    Promise.all(nodes["track"].map((node) => {
        trackNodes.push(node);

        return;
    }));

    releaseNodes.forEach((releaseNode) => {
        trackNodes.forEach((trackNode) => {
            if(releaseNode.getObject().id === trackNode.getObject().releaseId){
                releaseNode.addNeighbor(trackNode);
                trackNode.addNeighbor(releaseNode);

                return;
            }

            return;
        })
    })

    console.log(nodes);

    Promise.all(nodes["track"].map((node) => {
        if(node.getNeighbors().length < 2){
            console.log(node)
            console.log("Soem ting wong")
        } 
    }))

    return;
    console.time("Running Dijkstra Algorithm");
    const path = Dijkstra(artist1, artist2, nodes);
    console.timeEnd("Running Dijkstra Algorithm");

    let resultNodesDiv = document.createElement("DIV")
    resultNodesDiv.setAttribute("class", "result-nodes");
    
    for(let i = path.length-1; i > -1; i--){
        const container = document.createElement("DIV");

        container.setAttribute("class", "node");

        const h5 = document.createElement("H5");

        if(path[i] === "NO RELATION FOUND"){
            const text1 = document.createTextNode(path[i]);

            h5.appendChild(text1);
        }

        if(path[i].getType && path[i].getType() === "artist"){
            h5.setAttribute("class", "artist-div");

            const name = document.createTextNode(`Name: ${path[i].getObject().stageName}`);
            const gender = document.createTextNode(path[i].getObject().gender ? `, Gender: ${path[i].getObject().gender}` : "");
            
            let legalName = document.createTextNode("");;
            
            // if(data.artistAlias[path[i].getObject().artistId]){
            //     for(let i = 0; i < data.artistAlias[path[i].getObject().artistId].length; i++){
            //         if(data.artistAlias[path[i].getObject().artistId]["Alias Type"] === "Legal name"){
            //             legalName = document.createTextNode(`, Legal Name: ${data.artistAlias[path[i].getObject().artistId]["Artist Alias"]}`);
    
            //             break;
            //         }         
            //     }
            // }

            if(!data.artistAlias[path[i].getObject().artistId]){
                console.log(path[i].getObject().artistId)
            }
            

            const about = document.createTextNode(path[i].getObject().comment ? `, About: ${path[i].getObject().comment}` : "");
            const origin = document.createTextNode(path[i].getObject().origin ? `, Origin: ${path[i].getObject().origin}` : "");
            const born = document.createTextNode(path[i].getObject().born ? `, Born: ${path[i].getObject().born}` : "");

            h5.appendChild(name);
            h5.appendChild(gender);
            h5.appendChild(legalName);
            h5.appendChild(about);
            h5.appendChild(origin);
            h5.appendChild(born);
        }
        if(path[i].getType && path[i].getType() === "label"){
            h5.setAttribute("class", "label-div");
            
            const labelName = document.createTextNode(`Label: ${path[i].getObject()["Label Name"]}`);
            const labelCode = document.createTextNode(path[i].getObject()["Label Code"] ? `, Label Code: ${path[i].getObject()["Label Code"]}` : "");

            h5.appendChild(labelName);
            h5.appendChild(labelCode);
        }
        if(path[i].getType && path[i].getType() === "release"){
            h5.setAttribute("class", "release-div");

            const release = document.createTextNode(`Release: ${path[i].getObject().release}`);
            const releaseCredit = document.createTextNode(`, Release Credit: ${path[i].getObject().releaseCredit}`);
            const type = document.createTextNode(`, Type: ${path[i].getObject().type}`);

            h5.appendChild(release);
            h5.appendChild(type);
            h5.appendChild(releaseCredit)
        }
        if(path[i].getType && path[i].getType() === "track"){
            h5.setAttribute("class", "track-div");

            const trackName = document.createTextNode(`Track: ${path[i].getObject()["Track Name"]}`);
            const credits = document.createTextNode(`, Credits: ${path[i].getObject()["Release Credit"]}`);

            h5.appendChild(trackName);
            h5.appendChild(credits);
        }

        const br = document.createElement("BR");
        const h1 = document.createElement("H1");
        const arrow = document.createTextNode("\u2193")

        h1.appendChild(arrow);

        container.appendChild(h5);
        container.appendChild(br);
        resultNodesDiv.appendChild(container);

        if(i != 0){
            resultNodesDiv.appendChild(h1);
        }   
    }

    resultsEl.removeChild(loadingDiv);
    resultsEl.appendChild(resultNodesDiv);
}

function getArtistsSuggestions(text, url="/getArtistsSuggestions"){
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() { 
            // Only run if the request is complete
            if (xhr.readyState !== 4) return;

            // Process our return data
            if (xhr.status >= 200 && xhr.status < 300) {
                // What do when the request is successful
                // console.log(xhr.responseText)
                return resolve(JSON.parse(xhr.responseText));
            }else{
                return reject(new Error(JSON.parse(xhr.responseText)));
            }
        }
        xhr.open("POST", url, true); // true for asynchronous 
        // set `Content-Type` header
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({text: text}));
    })
}

function getArtistsData(artists, url="/getArtistsData"){
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() { 
            // Only run if the request is complete
            if (xhr.readyState !== 4) return;

            // Process our return data
            if (xhr.status >= 200 && xhr.status < 300) {
                // What do when the request is successful
                // console.log(xhr.responseText)
                return resolve(JSON.parse(xhr.responseText));
            }else{
                return reject(new Error(JSON.parse(xhr.responseText)));
            }
        }
        xhr.open("POST", url, true); // true for asynchronous 
        // set `Content-Type` header
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({artists: artists}));
    })
}
