function Dijkstra(artistId1, artistId2, nodes){
    const heap = new FibonacciHeap();
    const cameFrom = {};
    const nodeArtists = {};
    const nodeLabels = {};
    const nodeReleases = {};
    const nodeTracks = {};

    nodes.forEach((node, index) => {
        if(node.getType() === "artist" && node.getObject().artistId === artistId1){
            nodeArtists[artistId1] = {dist: 0, node: null, index: index};
            cameFrom[index] = null;
        }

        if(node.getType() !== "artist" ||  node.getType() === "artist" && node.getObject().artistId !== artistId1){
            if(node.getType() === "artist"){
                nodeArtists[node.getObject().artistId] = {dist: Number.POSITIVE_INFINITY, node: null, index: index};
                cameFrom[index] = null;
            }

            if(node.getType() === "label"){
                nodeLabels[node.getObject()["Label ID"]] = {dist: Number.POSITIVE_INFINITY, node: null, index: index};
                cameFrom[index] = null;
            }

            if(node.getType() === "release"){
                nodeReleases[node.getObject().releaseId] = {dist: Number.POSITIVE_INFINITY, node: null, index: index};
                cameFrom[index] = null;
            }

            if(node.getType() === "track"){
                nodeTracks[node.getObject()["Track ID"]] = {dist: Number.POSITIVE_INFINITY, node: null, index: index};
                cameFrom[index] = null;
            }   
        }

        if(node.getType() === "artist"){
            const currNode = new FibonacciHeapNode(nodeArtists[node.getObject().artistId].dist, node);
            nodeArtists[node.getObject().artistId].node = currNode;
            heap.insert(currNode);
        }

        if(node.getType() === "label"){
            const currNode = new FibonacciHeapNode(nodeLabels[node.getObject()["Label ID"]].dist, node);
            nodeLabels[node.getObject()["Label ID"]].node = currNode;
            heap.insert(currNode);
        }

        if(node.getType() === "release"){
            const currNode = new FibonacciHeapNode(nodeReleases[node.getObject().releaseId].dist, node);
            nodeReleases[node.getObject().releaseId].node = currNode;
            heap.insert(currNode);
        }

        if(node.getType() === "track"){
            const currNode = new FibonacciHeapNode(nodeTracks[node.getObject()["Track ID"]].dist, node);
            nodeTracks[node.getObject()["Track ID"]].node = currNode;
            heap.insert(currNode);
        }

        return;
    })

    console.log(heap.getRootList());
    let count = 0;
    while(heap.getRootList().length > 0){
        const current = heap.peek();

        heap.extractMin();

        count++;

        if(current.getPoint().getObject().artistId === artistId2){
            console.log(current);
            console.log(cameFrom);
            
            const path = [current.getPoint()];

            console.log(current.getPoint());
            
            let prev;

            if(current.getPoint().getType() === "artist"){
                prev = cameFrom[nodeArtists[current.getPoint().getObject().artistId].index];

                if(!prev){
                    console.log("NO RELATION FOUND");

                    return ["NO RELATION FOUND"];
                }
            }

            if(current.getPoint().getType() === "label"){
                prev = cameFrom[nodeLabels[current.getPoint().getObject()["Label ID"]].index];

                if(!prev){
                    console.log("NO RELATION FOUND");

                    return ["NO RELATION FOUND"];
                }
            }

            if(current.getPoint().getType() === "release"){
                prev = cameFrom[nodeReleases[current.getPoint().getObject().releaseId].index];

                if(!prev){
                    console.log("NO RELATION FOUND");

                    return ["NO RELATION FOUND"];
                }
            }

            if(current.getPoint().getType() === "track"){
                prev = cameFrom[nodeTracks[current.getPoint().getObject()["Track ID"]].index];

                if(!prev){
                    console.log("NO RELATION FOUND");

                    return ["NO RELATION FOUND"];
                }
            }

            while(prev){
                console.log(prev[0]);

                path.push(prev[0]);

                prev = cameFrom[prev[1]];
            }

            console.log("Path found");
            return path;
        }

        const neighbors = current.getPoint().getNeighbors();

        neighbors.forEach((neighbor) => {
            let currentDist;

            if(current.getPoint().getType() === "artist"){
                currentDist = nodeArtists[current.getPoint().getObject().artistId].dist + 1;
            }

            if(current.getPoint().getType() === "label"){
                currentDist = nodeLabels[current.getPoint().getObject()["Label ID"]].dist + 1;
            }

            if(current.getPoint().getType() === "release"){
                currentDist = nodeReleases[current.getPoint().getObject().releaseId].dist + 1;
            }

            if(current.getPoint().getType() === "track"){
                currentDist = nodeTracks[current.getPoint().getObject()["Track ID"]].dist + 1;
            } 

            if(neighbor.getType() === "artist"){
                neighbor = nodeArtists[neighbor.getObject().artistId].node;

                if(currentDist < nodeArtists[neighbor.getPoint().getObject().artistId].dist){
                    nodeArtists[neighbor.getPoint().getObject().artistId].dist = currentDist;

                    if(current.getPoint().getType() === "artist"){
                        cameFrom[nodeArtists[neighbor.getPoint().getObject().artistId].index] = [current.getPoint(), nodeArtists[current.getPoint().getObject().artistId].index];
                    }
        
                    if(current.getPoint().getType() === "label"){
                        cameFrom[nodeArtists[neighbor.getPoint().getObject().artistId].index] = [current.getPoint(), nodeLabels[current.getPoint().getObject()["Label ID"]].index];
                    }
        
                    if(current.getPoint().getType() === "release"){
                        cameFrom[nodeArtists[neighbor.getPoint().getObject().artistId].index] = [current.getPoint(), nodeReleases[current.getPoint().getObject().releaseId].index];
                    }
        
                    if(current.getPoint().getType() === "track"){
                        cameFrom[nodeArtists[neighbor.getPoint().getObject().artistId].index] = [current.getPoint(), nodeTracks[current.getPoint().getObject()["Track ID"]].index];
                    }

                    heap.decreaseKey(neighbor, nodeArtists[neighbor.getPoint().getObject().artistId].dist);
                }

                return;
            }

            if(neighbor.getType() === "label"){
                neighbor = nodeLabels[neighbor.getObject()["Label ID"]].node;

                if(currentDist < nodeLabels[neighbor.getPoint().getObject()["Label ID"]].dist){
                    nodeLabels[neighbor.getPoint().getObject()["Label ID"]].dist = currentDist;
                    
                    if(current.getPoint().getType() === "artist"){
                        cameFrom[nodeLabels[neighbor.getPoint().getObject()["Label ID"]].index] = [current.getPoint(), nodeArtists[current.getPoint().getObject().artistId].index];
                    }
        
                    if(current.getPoint().getType() === "label"){
                        cameFrom[nodeLabels[neighbor.getPoint().getObject()["Label ID"]].index] = [current.getPoint(), nodeLabels[current.getPoint().getObject()["Label ID"]].index];
                    }
        
                    if(current.getPoint().getType() === "release"){
                        cameFrom[nodeLabels[neighbor.getPoint().getObject()["Label ID"]].index] = [current.getPoint(), nodeReleases[current.getPoint().getObject().releaseId].index];
                    }
        
                    if(current.getPoint().getType() === "track"){
                        cameFrom[nodeLabels[neighbor.getPoint().getObject()["Label ID"]].index] = [current.getPoint(), nodeTracks[current.getPoint().getObject()["Track ID"]].index];
                    }

                    heap.decreaseKey(neighbor, nodeLabels[neighbor.getPoint().getObject()["Label ID"]].dist);
                }

                return;
            }

            if(neighbor.getType() === "release"){
                neighbor = nodeReleases[neighbor.getObject().releaseId].node;

                if(currentDist < nodeReleases[neighbor.getPoint().getObject().releaseId].dist){
                    nodeReleases[neighbor.getPoint().getObject().releaseId].dist = currentDist;
                    
                    if(current.getPoint().getType() === "artist"){
                        cameFrom[nodeReleases[neighbor.getPoint().getObject().releaseId].index] = [current.getPoint(), nodeArtists[current.getPoint().getObject().artistId].index];
                    }
        
                    if(current.getPoint().getType() === "label"){
                        cameFrom[nodeReleases[neighbor.getPoint().getObject().releaseId].index] = [current.getPoint(), nodeLabels[current.getPoint().getObject()["Label ID"]].index];
                    }
        
                    if(current.getPoint().getType() === "release"){
                        cameFrom[nodeReleases[neighbor.getPoint().getObject().releaseId].index] = [current.getPoint(), nodeReleases[current.getPoint().getObject().releaseId].index];
                    }
        
                    if(current.getPoint().getType() === "track"){
                        cameFrom[nodeReleases[neighbor.getPoint().getObject().releaseId].index] = [current.getPoint(), nodeTracks[current.getPoint().getObject()["Track ID"]].index];
                    }

                    heap.decreaseKey(neighbor, nodeReleases[neighbor.getPoint().getObject().releaseId].dist);
                }

                return;
            }

            if(neighbor.getType() === "track"){
                neighbor = nodeTracks[neighbor.getObject()["Track ID"]].node;

                if(currentDist < nodeTracks[neighbor.getPoint().getObject()["Track ID"]].dist){
                    nodeTracks[neighbor.getPoint().getObject()["Track ID"]].dist = currentDist;
                    
                    if(current.getPoint().getType() === "artist"){
                        cameFrom[nodeTracks[neighbor.getPoint().getObject()["Track ID"]].index] = [current.getPoint(), nodeArtists[current.getPoint().getObject().artistId].index];
                    }
        
                    if(current.getPoint().getType() === "label"){
                        cameFrom[nodeTracks[neighbor.getPoint().getObject()["Track ID"]].index] = [current.getPoint(), nodeLabels[current.getPoint().getObject()["Label ID"]].index];
                    }
        
                    if(current.getPoint().getType() === "release"){
                        cameFrom[nodeTracks[neighbor.getPoint().getObject()["Track ID"]].index] = [current.getPoint(), nodeReleases[current.getPoint().getObject().releaseId].index];
                    }
        
                    if(current.getPoint().getType() === "track"){
                        cameFrom[nodeTracks[neighbor.getPoint().getObject()["Track ID"]].index] = [current.getPoint(), nodeTracks[current.getPoint().getObject()["Track ID"]].index];
                    }

                    heap.decreaseKey(neighbor, nodeTracks[neighbor.getPoint().getObject()["Track ID"]].dist);
                }

                return;
            }
        })
    }
}