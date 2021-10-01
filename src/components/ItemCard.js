import React from "react"

export default class ItemCard extends React.Component{

    handleClick = (event) => {
        if (event.detail === 1) {
            //this will save something somewhere for the drag function
        }
        else if (event.detail === 2) {
            this.handleToggleEdit(event);
        }
    }

    handleToggleEdit = (event) => {
        this.props.editActive = !this.props.editActive;
    }

    handleKeyPress = (event) => {
        if (event.code === "Enter") {
            this.handleBlur();
        }
    }

    handleBlur = () => {
        let textValue = this.props.text;
        console.log("ListCard handleBlur: " + textValue);
        this.props.renameItemCallback(this.props.id, textValue);
        this.handleToggleEdit();
    }
    handleUpdate = (event) => {
        this.props.text = event.target.value;
    }
    render(){
        if(this.props.editActive){
            return (
                <input
                    id={this.props.id}
                    className='top5-item'
                    type='text'
                    onKeyPress={this.handleKeyPress}
                    //onBlur={this.handleBlur}
                    onChange={this.handleUpdate}
                    defaultValue={this.props.text}
                />
            );
        }else{
            return(
                <div
                id = {this.props.id}
                key = {this.props.id}
                className = { "top5-item"}
                draggable = {true}
                onClick={this.handleClick}>
                {this.props.text}
                
                </div>
            );
        }
    }
}