import React from "react"

export default class ItemCard extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            editActive: this.props.ed
        }
    }
    handleDragstart = (event)=>{
        this.props.saveOldItemIndex(this.props.id);
    }
    handleDrop = (event) => {
        let temp = document.getElementById("item-"+this.props.id);
        temp.classList.remove("top5-item-dragged-to");
        temp.classList.add("top5-item");
        if(this.props.oldIndex !== this.props.id){
            this.props.moveItemCallback(this.props.id);
        }

    }
    handleDragOver = (event) => {
        event.preventDefault();
        let temp = document.getElementById("item-"+this.props.id);
        temp.classList.remove("top5-item");
        temp.classList.add("top5-item-dragged-to");
    }
    handleDragLeave = (event) =>{
        event.preventDefault();
        let temp = document.getElementById("item-"+this.props.id);
        
        temp.classList.remove("top5-item-dragged-to");
        temp.classList.add("top5-item");
    }
    handleClick = (event) => {
        if (event.detail === 1) {
            //this will save something somewhere for the drag function maybe a callback function
        }
        else if (event.detail === 2) {
            this.props.saveOldItemCallback(this.props.id);
            this.handleToggleEdit(event);
        }
    }

    handleToggleEdit = (event) => {
        this.setState({
            editActive: !this.state.editActive
        });
    }

    handleKeyPress = (event) => {
        if (event.code === "Enter") {
            this.handleBlur();
        }
    }

    handleBlur = () => {
        this.props.renameItemCallback(this.props.id,  this.props.text);
        this.handleToggleEdit();
    }
    handleUpdate = (event) => {
        this.props.handleUpdateCallback(this.props.id, event.target.value);
    }
    render(){
        if(this.state.editActive){
            return (
                <input
                    id={this.props.id}
                    className='top5-item'
                    type='text'
                    onKeyPress={this.handleKeyPress}
                    onBlur={this.handleBlur}
                    onChange={this.handleUpdate}
                    defaultValue={this.props.text}
                />
            );
        }else{
            return(
                <div
                id = {"item-" + this.props.id}
                key = {this.props.id}
                className = { "top5-item"}
                draggable = {true}
                onDragStart = {this.handleDragstart}
                onDragOver = {this.handleDragOver}
                onDragLeave = {this.handleDragLeave}
                onDrop = {this.handleDrop}
                onClick={this.handleClick}>
                {this.props.text}
                
                </div>
            );
        }
    }
}