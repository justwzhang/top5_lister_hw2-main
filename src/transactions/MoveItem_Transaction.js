import { jsTPS_Transaction } from "./jsTPS";

export default class MoveItem_Transaction extends jsTPS_Transaction{
    constructor(initCurrentList, initOld, initNew) {
        super();
        this.currentList = initCurrentList;
        this.oldItemIndex = initOld;
        this.newItemIndex = initNew;
    }

    doTransaction() {
        this.model.moveItem(this.oldItemIndex, this.newItemIndex);
        return this.currentList;
    }
    
    undoTransaction() {
        this.model.moveItem(this.newItemIndex, this.oldItemIndex);
        return this.currentList;
    }

    moveItem(index1, index2){
        this.currentList.items.splice(index2, 0, this.items.splice(index1, 1)[0]);
    }
}