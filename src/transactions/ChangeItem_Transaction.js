import { jsTPS_Transaction } from "./jsTPS";

export default class ChangeItem_Transaction extends jsTPS_Transaction{
    constructor(initCurrentList, initIndex, initOldText, initNewText) {
        super();
        this.currentList = initCurrentList;
        this.index = initIndex;
        this.oldText = initOldText;
        this.newText = initNewText;
    }

    doTransaction() {
        this.changeItem(this.index, this.newText);
        return this.currentList;
    }
    
    undoTransaction() {
        this.changeItem(this.index, this.oldText);
        return this.currentList;
    }

    changeItem(index, text){
        this.currentList.items[index] = text;
    }
}