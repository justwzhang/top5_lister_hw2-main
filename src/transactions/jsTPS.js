export class jsTPS_Transaction {

    doTransaction() {
        console.log("doTransaction");
    }

    undoTransaction() {
        console.log("undoTransaction");
    }
}

export default class jsTPS{
    constructor() {
        this.transactions = [];
        this.numTransactions = 0;
        this.mostRecentTransaction = -1;
    }
    getSize() {
        return this.transactions.length;
    }
    getRedoSize() {
        return this.getSize() - this.mostRecentTransaction - 1;
    }
    getUndoSize() {
        return this.mostRecentTransaction + 1;
    }
    hasTransactionToRedo() {
        return (this.mostRecentTransaction+1) < this.numTransactions;
    }
    hasTransactionToUndo() {
        return this.mostRecentTransaction >= 0;
    }
    addTransaction(transaction) {
        if ((this.mostRecentTransaction < 0) || (this.mostRecentTransaction < (this.transactions.length - 1))) {
            for (let i = this.transactions.length - 1; i > this.mostRecentTransaction; i--) {
                this.transactions.splice(i, 1);
            }
            this.numTransactions = this.mostRecentTransaction + 2;
        }
        else {
            this.numTransactions++;
        }
        this.transactions[this.mostRecentTransaction+1] = transaction;

        let newCurrentList = this.doTransaction(transaction.items);
        return newCurrentList
    }
    doTransaction(currentList) {
        if (this.hasTransactionToRedo()) {
            let transaction = this.transactions[this.mostRecentTransaction+1];
            let newCurrentList = transaction.doTransaction();
            this.mostRecentTransaction++;
            return newCurrentList;
        }
        return currentList;
    }
    undoTransaction(currentList) {
        if (this.hasTransactionToUndo()) {
            let transaction = this.transactions[this.mostRecentTransaction];
            let newCurrentList = transaction.undoTransaction();
            this.mostRecentTransaction--;
            return newCurrentList;
        }
        return currentList;
    }
    clearAllTransactions() {
        this.transactions = new Array();
        this.mostRecentTransaction = -1;      
        this.numTransactions = 0; 
    }
}