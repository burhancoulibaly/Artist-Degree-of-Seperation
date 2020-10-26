const getNeighbors = (current, nodes, startNode) => {
    return new Promise(async(resolve, reject) => {
        try {
            let data;
            // console.log(current.getPoint())

            if(startNode && current.getPoint().type === "artist"){
                data = await getStartNodeNeighbors(current.getPoint());
            }else{
                data = await getArtistNeighbors(current.getPoint());
            }

            if(current.getPoint().type === "release"){
                data = await getReleaseNeighbors(current.getPoint());
            }

            if(current.getPoint().type === "track"){
                data = await getTrackNeighbors(current.getPoint());
            }

            if(current.getPoint().type === "label"){
                data = await getLabelNeighbors(current.getPoint());
            }
            
            // console.log(data);
            const neighbors = new Array();

            if(data.artists){
                neighbors.push(...Object.values(data.artists));
            }
            if(data.releases){
                neighbors.push(...Object.values(data.releases));
            }
            if(data.tracks){
                neighbors.push(...Object.values(data.tracks));
            }
            if(data.labels){
                neighbors.push(...Object.values(data.labels));
            }
            
            resolve(neighbors);
        } catch (error) {
            reject(error);
        }
        
    })
}

async function Dijkstra(artist1, artist2){
    let currCameFromIndex = 0;
    const heap = new FibonacciHeap();
    const cameFrom = {};
    const nodes = {
        "artist": new Object(),
        "label":  new Object(),
        "release":  new Object(),
        "track":  new Object()
    }

    let currNode;

    currCameFromIndex++;

    nodes[artist1.type][artist1.id] = {dist: 0, node: null, index: currCameFromIndex};
    cameFrom[currCameFromIndex] = null;
    currNode = new FibonacciHeapNode(nodes[artist1.type][artist1.id].dist, artist1);
    nodes[artist1.type][artist1.id].node = currNode;
    heap.insert(currNode);

    // console.log(Object.assign({}, heap.getRootList()));

    let count = 0;
    while(heap.getRootList().length > 0){
        const current = heap.peek();

        // console.log(current.getPoint())
        // console.log(Object.assign({}, heap.getRootList()));

        heap.extractMin();

        if(current.getPoint().id === artist2.id){
            console.log(current);
            console.log(cameFrom);
            
            const path = [current.getPoint()];

            console.log(current.getPoint(), nodes[current.getPoint().type][current.getPoint().id].index);
            
            let prev = cameFrom[nodes[current.getPoint().type][current.getPoint().id].index]

            if(!prev){
                console.log("NO RELATION FOUND");

                return ["NO RELATION FOUND"];
            }

            while(prev){
                console.log(prev[0]);

                path.push(prev[0]);

                prev = cameFrom[prev[1]];
            }

            console.log("Path found");
            return path;
        }

        try {
            let neighbors;

            if(current.getPoint().id === artist1.id){
                neighbors = await getNeighbors(current, nodes, true);
            }else{
                neighbors = await getNeighbors(current, nodes, false);
            }
            
            // console.log(neighbors);
            neighbors.forEach((neighbor) => {
                const currentDist = nodes[current.getPoint().type][current.getPoint().id].dist + 1;
                // console.log(currentDist);
                // if(nodes[neighbor.type]){
                //     console.log("does neighbor exist", nodes[neighbor.type][neighbor.id])
                // }

                if(!nodes[neighbor.type][neighbor.id]){
                    currCameFromIndex++;

                    nodes[neighbor.type][neighbor.id] = {dist: currentDist, node: null, index: currCameFromIndex};
                    cameFrom[currCameFromIndex] = [current.getPoint(), nodes[current.getPoint().type][current.getPoint().id].index];
                    currNode = new FibonacciHeapNode(nodes[neighbor.type][neighbor.id].dist, neighbor);
                    nodes[neighbor.type][neighbor.id].node = currNode;
                    heap.insert(currNode);

                    return;
                }

                // console.log("This node already existed")

                neighbor = nodes[neighbor.type][neighbor.id].node;
                    
                if(currentDist < nodes[neighbor.getPoint().type][neighbor.getPoint().id].dist){
                    nodes[neighbor.getPoint().type][neighbor.getPoint().id].dist = currentDist;
                    cameFrom[nodes[neighbor.getPoint().type][neighbor.getPoint().id].index] = [current.getPoint(), nodes[current.getPoint().type][current.getPoint().id].index];
                    heap.decreaseKey(neighbor, nodes[neighbor.getPoint().type][neighbor.getPoint().id].dist);
                }

                return;

                
            })
        } catch (error) {
            console.log(error);
        }
    }
}