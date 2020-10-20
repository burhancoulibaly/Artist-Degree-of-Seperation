class FibonacciHeap{
    constructor(){
        this._rootList = [];
        this._min = null;
    }

    getRootList = () => {
        return this._rootList;
    }

    insert = (node) => {
        this._rootList.push(node);

        if(this._rootList.length > 1){
            const node1 = this._rootList[this._rootList.length-2];
            const node2 = this._rootList[this._rootList.length-1];
            
            node2.setRight(node1.getRight());
            node1.getRight().setLeft(node2);
            node1.setRight(node2);
            node2.setLeft(node1);
        }else{
            const node1 = this._rootList[this._rootList.length-1];
            node1.setRight(node1);
            node1.setLeft(node1);
        }
        
        if(!this._min || this._min.getVal() >= node.getVal()){
            this._min = node;
        }
    }

    peek = () => {
        return this._min;
    }

    extractMin = () => {
        const min = this._min;

        if(min){
            if(min === min.getRight()){
                this._min = null;
            }else{
                this._min = min.getRight()
            }
            
            if(min.getChild()){
                min.getChild().forEach((node) => {
                    node.setParent(null);
    
                    this.insert(node);
                })
            }

            this._rootList.forEach((node, index) => {
                if(node === min){
                    if(this._min){
                        this._min.setLeft(min.getLeft());
                        min.getLeft().setRight(this._min);
                    }

                    this._rootList.splice(index, 1);
                }
                return;
            })

            this.consolidate();

        }

        return min;
    }

    link = (node1, node2) => {
        if(node1.getChild() === null){
            node1.setChild([]);
        }

        node1.getChild().push(node2);
        
        if(node1.getChild().length > 1){
            const child1 = node1.getChild()[node1.getChild().length-2];
            const child2 = node1.getChild()[node1.getChild().length-1];

            child2.setRight(child1.getRight());
            child1.getRight().setLeft(child2);
            child1.setRight(child2);
            child2.setLeft(child1);
            child2.setParent(child1.getParent());

            child2.setIsMarked(false);
        }else{
            const child1 = node1.getChild()[node1.getChild().length-1];
            
            child1.setRight(child1);
            child1.setLeft(child1);
            child1.setParent(node1);

            child1.setIsMarked(false);
        }

        node1.incrementDegree();

        return node1;
    }

    consolidate = () => {
        const arr = new Array(parseInt(this._rootList.length / Math.log(2)));
        
        this._rootList.forEach((node, index) => {
            let node1 = node;

            node1.setParent(null);
            node1.setLeft(null);
            node1.setRight(null);

            let degree = node1.getDegree();

            //degree is being used as an index
            while(arr[degree]){
                let node2 = arr[degree];
                
                node2.setParent(null);
                node2.setLeft(null);
                node2.setRight(null);

                if(node1.getVal() > node2.getVal()){
                    const tmpNode = node1;

                    node1 = node2;
                    node2 = tmpNode;
                }

                node1 = this.link(node1, node2);

                arr[degree] = null;

                degree += 1;
            }

            arr[degree] = node1;
        })

        this._rootList = [];

        arr.forEach((node, index) => {
            if(node){
                this.insert(node);
            }
        })
    }

    //To be seen
    union = (h) => {   
        this._min = h.peek();

        const hStartIndex = this._rootList.length;
        const hEndIndex = h.length-1;

        this._rootList = this._rootList.concat(h);

        if(hStartIndex !== 0){
            const node1 = this._rootList[hStartIndex-1];
            const node2 = this._rootList[hStartIndex];
            const node3 = this._rootList[hEndIndex];

            node3.setRight(node1.getRight())
            node1.getRight().setLeft(node3)
            node1.setRight(node2);
            node2.setLeft(node1);
        }

        if((this._min === null || h.peek()) && h.peek() < this._min){
            this._min = h.peek();
        }

        //clear h object
    }

    decreaseKey = (node, val) => {
        if(val > node.getVal()){
            throw new Error("Replacement key is greater than the original key");
        }

        node.setVal(val);

        const parent = node.getParent();

        if(parent !== null && node.getVal() < parent.getVal()){
            this.cut(node, parent);
            this.cascadingCut(parent);
        }
    }
    
    cut = (child, parent) => {
        parent.getChild().forEach((node, index) => {
            if(node === child){
                node.getLeft().setRight(node.getRight());
                node.getRight().setLeft(node.getLeft());

                parent.getChild().splice(index, 1);   

                if(parent.getChild().length === 0){
                    parent.setChild(null);
                }

                node.setParent(null);
                node.setLeft(null);
                node.setRight(null);
                node.setIsMarked(false);

                this.insert(node);

                //Understand better why the degree is being decremented here
                parent.decrementDegree();
            }
            return;
        })
    }

    cascadingCut = (parent) => {
        const grandParent = parent.getParent();

        if(grandParent !== null){
            if(parent.isMarked() === false){
                parent.setIsMarked(true);
            }else{
                this.cut(parent, grandParent);
                this.cascadingCut(grandParent);
            }
        }
    }
}

