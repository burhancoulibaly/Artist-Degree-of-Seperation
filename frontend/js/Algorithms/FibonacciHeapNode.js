class FibonacciHeapNode{
    constructor(val, point){
        this._val = val;
        this._parent = null;
        this._left = null;
        this._right = null;
        this._child = null;
        this._degree = 0;
        this._isMarked = false;
        this._point = point;
    }

    setVal(val){
        this._val = val;
    }

    setPoint(point){
        this._point = point
    }

    setParent(node){
        this._parent = node;
    }

    setLeft(node){
        this._left = node;
    }

    setRight(node){
        this._right = node;
    }

    setChild(node){
        this._child = node;
    }

    incrementDegree(){
        this._degree += 1;
    }

    decrementDegree(){
        this._degree -= 1;
    }

    setIsMarked(booly){
        this._isMarked = booly;
    }

    getVal(){
        return this._val;
    }

    getPoint(){
        return this._point;
    }

    getParent(){
        return this._parent
    }

    getLeft(){
        return this._left;
    }

    getRight(){
        return this._right;
    }

    getChild(){
        return this._child;
    }

    getDegree(){
        return this._degree;
    }
    
    isMarked(){
        return this._isMarked;
    }

    
}