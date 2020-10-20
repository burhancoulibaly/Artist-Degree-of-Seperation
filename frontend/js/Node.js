class Node {
    constructor(object, type){
        this._object = object;
        this._neighbors = [];
        this._type = type;
    }

    setObject(object){
        this._object = object;

        return;
    }

    setType(type){
        this._type = type;

        return;
    }

    addNeighbor(node){
        this._neighbors.push(node);

        return;
    }

    addNeighbors(nodeArray){
        this._neighbors.push(...nodeArray);

        return;
    }

    removeNeighbor(id){
        for(let i = 0; i < this._neighbors.length; i++){
            if(this._type === "artist" && this._type === type){
                if(this._neighbors[i]._object.artistId === id){
                    this._neighbors.splice(i, 1);

                    return;
                }

                return;
            }

            if(this._type === "label" && this._type === type){
                if(this._neighbors[i]._object["Label ID"] === id){
                    this._neighbors.splice(i, 1);

                    return;
                }

                return;
            }

            if(this._type === "release" && this._type === type){
                if(this._neighbors[i]._object.releaseId === id){
                    this._neighbors.splice(i, 1);

                    return;
                }

                return;
            }

            if(this._type === "track" && this._type === type){
                if(this._neighbors[i]._object["Track ID"] === id){
                    this._neighbors.splice(i, 1);

                    return;
                }

                return;
            }

            return;
        }

        return;
    }

    getObject(){
        return this._object;
    }

    getType(){
        return this._type;
    }

    getNeighbors(){
        return this._neighbors;
    }

    getNeighborAtIndex(index){
        return this._neighbors[index];
    }

    getNeighborWithObjectId(id, type){
        for(let i = 0; i < this._neighbors.length; i++){
            if(this._type === "artist" && this._type === type){
                if(this._neighbors[i]._object.artistId === id){
                    return this._neighbors[i];
                }

                return;
            }

            if(this._type === "label" && this._type === type){
                if(this._neighbors[i]._object["Label ID"] === id){
                    return this._neighbors[i];
                }

                return;
            }

            if(this._type === "release" && this._type === type){
                if(this._neighbors[i]._object.releaseId === id){
                    return this._neighbors[i];
                }

                return;
            }

            if(this._type === "track" && this._type === type){
                if(this._neighbors[i]._object["Track ID"] === id){
                    return this._neighbors[i];
                }

                return;
            }

            return
        }

        return;
    }
}
