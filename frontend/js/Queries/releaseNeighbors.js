function getReleaseNeighbors(release, url="/getReleaseNeighbors"){
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
                console.log(JSON.parse(xhr.responseText));
                return reject(new Error(JSON.parse(xhr.responseText)));
            }
        }
        xhr.open("POST", url, true); // true for asynchronous 
        // set `Content-Type` header
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({ release: release }));
    })
}