import React from 'react';
import './App.css';

// IMPORT DATA MANAGEMENT AND TRANSACTION STUFF
import DBManager from './db/DBManager';

// THESE ARE OUR REACT COMPONENTS
import DeleteModal from './components/DeleteModal';
import Banner from './components/Banner.js'
import Sidebar from './components/Sidebar.js'
import Workspace from './components/Workspace.js';
import Statusbar from './components/Statusbar.js'

// These are the data structures that will handle the transactions for redo and undo
import jsTPS from './transactions/jsTPS';
import ChangeItem_Transaction from './transactions/ChangeItem_Transaction';
import MoveItem_Transaction from './transactions/MoveItem_Transaction';

class App extends React.Component {
    constructor(props) {
        super(props);

        window.addEventListener('keydown', (event)=>{
            if(event.ctrlKey && event.key === "z"){
                this.undo();
            }else if(event.ctrlKey && event.key === "y"){
                this.redo();
            }
        });
        // THIS WILL TALK TO LOCAL STORAGE
        this.db = new DBManager();

        // GET THE SESSION DATA FROM OUR DATA MANAGER
        let loadedSessionData = this.db.queryGetSessionData();

        // SETUP THE INITIAL STATE
        this.state = {
            currentList : null,
            deleteKeyPair: { "key": null, "name": null },
            oldText: "",
            oldIndex: 0,
            sessionData : loadedSessionData,
            tps: new jsTPS(),
        }
    }
    sortKeyNamePairsByName = (keyNamePairs) => {
        keyNamePairs.sort((keyPair1, keyPair2) => {
            // GET THE LISTS
            return keyPair1.name.localeCompare(keyPair2.name);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CREATING A NEW LIST
    createNewList = () => {
        // FIRST FIGURE OUT WHAT THE NEW LIST'S KEY AND NAME WILL BE
        let newKey = this.state.sessionData.nextKey;
        let newName = "Untitled" + newKey;

        // MAKE THE NEW LIST
        let newList = {
            key: newKey,
            name: newName,
            items: ["?", "?", "?", "?", "?"]
        };

        // MAKE THE KEY,NAME OBJECT SO WE CAN KEEP IT IN OUR
        // SESSION DATA SO IT WILL BE IN OUR LIST OF LISTS
        let newKeyNamePair = { "key": newKey, "name": newName };
        let updatedPairs = [...this.state.sessionData.keyNamePairs, newKeyNamePair];
        this.sortKeyNamePairsByName(updatedPairs);

        // CHANGE THE APP STATE SO THAT IT THE CURRENT LIST IS
        // THIS NEW LIST AND UPDATE THE SESSION DATA SO THAT THE
        // NEXT LIST CAN BE MADE AS WELL. NOTE, THIS setState WILL
        // FORCE A CALL TO render, BUT THIS UPDATE IS ASYNCHRONOUS,
        // SO ANY AFTER EFFECTS THAT NEED TO USE THIS UPDATED STATE
        // SHOULD BE DONE VIA ITS CALLBACK
        this.setState(prevState => ({
            currentList: newList,
            oldText: prevState.oldText,
            deleteKeyPair: prevState.deleteKeyPair,
            oldIndex: prevState.oldIndex,
            sessionData: {
                nextKey: prevState.sessionData.nextKey + 1,
                counter: prevState.sessionData.counter + 1,
                keyNamePairs: updatedPairs
            },
            tps: prevState.tps
        }), () => {
            // PUTTING THIS NEW LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationCreateList(newList);
            this.db.mutationUpdateSessionData(this.state.sessionData)
            this.state.tps.clearAllTransactions();
            this.disableUndo();
            this.disableRedo();
            this.enableClose();
        });
    }
    renameList = (key, newName) => {
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        // NOW GO THROUGH THE ARRAY AND FIND THE ONE TO RENAME
        for (let i = 0; i < newKeyNamePairs.length; i++) {
            let pair = newKeyNamePairs[i];
            if (pair.key === key) {
                pair.name = newName;
            }
        }
        this.sortKeyNamePairsByName(newKeyNamePairs);

        // WE MAY HAVE TO RENAME THE currentList
        let currentList = this.state.currentList;
        if (currentList.key === key) {
            currentList.name = newName;
        }

        this.setState(prevState => ({
            currentList: prevState.currentList,
            oldText: prevState.oldText,
            deleteKeyPair: prevState.deleteKeyPair,
            oldIndex: prevState.oldIndex,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter,
                keyNamePairs: newKeyNamePairs
            },
            tps: prevState.tps
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            this.state.tps.clearAllTransactions();
            let list = this.db.queryGetList(key);
            list.name = newName;
            this.db.mutationUpdateList(list);
            this.db.mutationUpdateSessionData(this.state.sessionData);
            document.getElementById("add-list-button").classList.remove("top5-button-disabled")
            document.getElementById("add-list-button").classList.add("top5-button");
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF LOADING A LIST FOR EDITING
    loadList = (key) => {
        let newCurrentList = this.db.queryGetList(key);
        this.setState(prevState => ({
            currentList: newCurrentList,
            oldText: prevState.oldText,
            deleteKeyPair: prevState.deleteKeyPair,
            oldIndex: prevState.oldIndex,
            sessionData: prevState.sessionData,
            tps: prevState.tps
        }), () => {
            this.state.tps.clearAllTransactions();
            this.enableClose();
            this.disableRedo();
            this.disableUndo();
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CLOSING THE CURRENT LIST
    closeCurrentList = () => {
        this.setState(prevState => ({
            currentList: null,
            oldText: prevState.oldText,
            oldIndex: prevState.oldIndex,
            deleteKeyPair: prevState.deleteKeyPair,
            sessionData: prevState.sessionData,
            tps:prevState.tps
        }), () => {
            this.state.tps.clearAllTransactions();
            this.disableClose();
            this.disableUndo();
            this.disableRedo();
        });
    }
    //only sets the name and reveals the modal does NOT delete the list
    deleteList = (key) => {
        this.setState(prevState =>({
            currentList: prevState.currentList,
            oldText: prevState.oldText,
            oldIndex: prevState.oldIndex,
            deleteKeyPair: key,
            sessionData: prevState.sessionData,
            tps:prevState.tps
        }), ()=>{

        });
        this.showDeleteListModal();
    }
    // THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER
    // TO SEE IF THEY REALLY WANT TO DELETE THE LIST
    showDeleteListModal() {
        let modal = document.getElementById("delete-modal");
        modal.classList.add("is-visible");
    }
    // THIS FUNCTION IS FOR HIDING THE MODAL
    hideDeleteListModal() {
        let modal = document.getElementById("delete-modal");
        modal.classList.remove("is-visible");
    }
    //the next methods are to disable and enable the 3 buttons 
    enableUndo(){
        let undo = document.getElementById("undo-button");
        undo.classList.remove("top5-button-disabled");
        undo.classList.add("top5-button")
    }
    disableUndo(){
        let undo = document.getElementById("undo-button");
        undo.classList.remove("top5-button")
        undo.classList.add("top5-button-disabled")
    }
    enableRedo(){
        let redo = document.getElementById("redo-button");
        redo.classList.remove("top5-button-disabled")
        redo.classList.add("top5-button")
    }
    disableRedo(){
        let redo = document.getElementById("redo-button");
        redo.classList.remove("top5-buttond")
        redo.classList.add("top5-button-disabled")
    }
    enableClose(){
        let close = document.getElementById("close-button");
        close.classList.remove("top5-button-disabled")
        close.classList.add("top5-button")
    }
    disableClose(){
        let close = document.getElementById("close-button");
        close.classList.remove("top5-button")
        close.classList.add("top5-button-disabled")
    }
    //saves the old text for use in the tps
    itemSaveOldText = (index) => {
        let newOldText = this.state.currentList.items[index];
        this.setState(prevState =>({
            currentList: prevState.currentList,
            oldText: newOldText,
            oldIndex: prevState.oldIndex,
            deleteKeyPair: prevState.deleteKeyPair,
            sessionData: prevState.sessionData,
            tps: prevState.tps
        }))
    }

    //updates the list item at the given index
    itemHandleUpdate = (index, newText) => {
        let newOldText = this.state.currentList.items[index];
        let newCurrentList = this.state.currentList;
        newCurrentList.items[index] = newText;
        this.setState(prevState =>({
            currentList: newCurrentList,
            oldText: prevState.oldText,
            oldIndex: prevState.oldIndex,
            deleteKeyPair: prevState.deleteKeyPair,
            sessionData: prevState.sessionData,
            tps: prevState.tps
        }))
    }

    //confirms renames the item at the given index and uses a tps for the undo and redo functions
    renameItem = (index, newText) => {
        let tempCurrentList = this.state.currentList; 
        let newTransaction = new ChangeItem_Transaction(tempCurrentList, index, this.state.oldText, newText);
        let newCurrentList = this.state.tps.addTransaction(newTransaction);
        this.setState(prevState => ({
            currentList: newCurrentList,
            oldText: newText,
            oldIndex: prevState.oldIndex,
            deleteKeyPair: prevState.deleteKeyPair,
            sessionData: prevState.sessionData,
            tps: prevState.tps
        }), () =>{
            this.db.mutationUpdateList(this.state.currentList);
            this.enableUndo();
            if(!this.state.tps.hasTransactionToRedo()){
                this.disableRedo();
            }
        });
    }
    //handles the moving of items through a tps which will allow for undo and redo
    moveItem = (newIndex) =>{
        let newTransaction = new MoveItem_Transaction(this.state.currentList, this.state.oldIndex, newIndex);
        let newCurrentList = this.state.tps.addTransaction(newTransaction);
        this.setState(prevState => ({
            currentList: newCurrentList,
            oldText: prevState.oldText,
            oldIndex: prevState.oldIndex,
            deleteKeyPair: prevState.deleteKeyPair,
            sessionData: prevState.sessionData,
            tps: prevState.tps
        }), () =>{
            this.db.mutationUpdateList(this.state.currentList);
            this.enableUndo();
            if(!this.state.tps.hasTransactionToRedo()){
                this.disableRedo();
            }
        });
    }
    //saves the old index of an item for tps use
    saveOldItemIndex = (item) =>{
        this.setState(prevState => ({
            currentList: prevState.currentList,
            oldText: prevState.oldText,
            oldIndex: item,
            deleteKeyPair: prevState.deleteKeyPair,
            sessionData: prevState.sessionData,
            tps: prevState.tps
        }), () =>{
            
        });
    }
    //undos whatever is at the current location of the tps
    undo = () =>{
        if(this.state.tps.hasTransactionToUndo()){
            let newCurrentList = this.state.tps.undoTransaction(this.state.currentList);
            if(!this.state.tps.hasTransactionToUndo()){
                this.disableUndo();
            }
            if(this.state.tps.hasTransactionToRedo()){
                this.enableRedo();
            }
            this.setState(prevState =>({
                currentList: newCurrentList,
                oldText: prevState.oldText,
                oldIndex: prevState.oldIndex,
                deleteKeyPair: prevState.deleteKeyPair,
                sessionData: prevState.sessionData,
                tps:prevState.tps
            }), ()=>{
                this.db.mutationUpdateList(this.state.currentList);
            });
        }
    }
    //redos whatever is at the current location of the tps
    redo = () =>{
        if(this.state.tps.hasTransactionToRedo()){
            let newCurrentList = this.state.tps.doTransaction(this.state.currentList);
            if(!this.state.tps.hasTransactionToRedo()){
                this.disableRedo();
            }
            if(this.state.tps.hasTransactionToUndo()){
                this.enableUndo();
            }
            this.setState(prevState =>({
                currentList: newCurrentList,
                oldText: prevState.oldText,
                oldIndex: prevState.oldIndex,
                deleteKeyPair: prevState.deleteKeyPair,
                sessionData: prevState.sessionData,
                tps:prevState.tps
            }), ()=>{
                this.db.mutationUpdateList(this.state.currentList);
            });
        }
    }
    //actually deleats the list with the given unique id
    confirmedDeleteList = (id) =>{
        let tempCurrentList = this.state.currentList;
        let newKeyNamePairs = [];
        this.state.sessionData.keyNamePairs.map((pair) =>{
            if(pair.key !==id){
                newKeyNamePairs = [...newKeyNamePairs, pair];
            }
            if(this.state.currentList !== null)
                if(pair.key === id && pair.name === this.state.currentList.name){
                    tempCurrentList = null;
                    this.disableClose();
                    this.disableRedo();
                    this.disableUndo();
                    this.state.tps.clearAllTransactions();
                }
        });
        this.sortKeyNamePairsByName(newKeyNamePairs);
        this.setState(prevState =>({
            currentList: tempCurrentList,
            oldText:prevState.oldText,
            oldIndex:prevState.oldIndex,
            deleteKeyPair: prevState.deleteKeyPair,
            sessionData: {
                nextKey: prevState.sessionData.nextKey + 1,
                counter: prevState.sessionData.counter + 1,
                keyNamePairs: newKeyNamePairs
            },
            tps:prevState.tps
        }), ()=>{
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    
    render() {
        return (
            <div id="app-root">
                <Banner 
                    title='Top 5 Lister'
                    closeCallback={this.closeCurrentList} 
                    undoCallback = {this.undo}
                    redoCallback = {this.redo}/>
                <Sidebar
                    heading='Your Lists'
                    currentList={this.state.currentList}
                    keyNamePairs={this.state.sessionData.keyNamePairs}
                    createNewListCallback={this.createNewList}
                    deleteListCallback={this.deleteList}
                    loadListCallback={this.loadList}
                    renameListCallback={this.renameList}
                    
                />
                <Workspace
                    currentList={this.state.currentList} 
                    renameItemCallback={this.renameItem}
                    handleUpdateCallback = {this.itemHandleUpdate}
                    saveOldItemCallback={this.itemSaveOldText}
                    moveItemCallback = {this.moveItem}
                    saveOldItemIndexCallback = {this.saveOldItemIndex}
                    oldIndex = {this.state.oldIndex}/>
                <Statusbar 
                    currentList={this.state.currentList} />
                <DeleteModal
                    listKeyPair = {this.state.deleteKeyPair}
                    deleteListCallback = {this.confirmedDeleteList}
                    hideDeleteListModalCallback={this.hideDeleteListModal}
                />
            </div>
        );
    }
}

export default App;
