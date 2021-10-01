import React from "react"

export default class ItemCard extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            editActive: this.props.ed
        }
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