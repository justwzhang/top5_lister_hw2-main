import React from "react";

export default class EditToolbar extends React.Component {
    constructor(props){
        super(props);
        window.addEventListener('keydown', (event)=>{
            if(event.ctrlKey && event.key === "z"){
                this.props.undoCallback();
            }else if(event.ctrlKey && event.key === "y"){
                this.props.redoCallback();
            }
        });
    }
    close = () =>{
        this.props.closeCallback();
    }
    undo= () =>{        
        this.props.undoCallback();
    }
    redo= () =>{
        this.props.redoCallback();
    }
    render() {
        return (
            <div id="edit-toolbar">
                <div 
                    id='undo-button' 
                    className="top5-button-disabled"
                    onClick = {this.undo}>
                        &#x21B6;
                </div>
                <div
                    id='redo-button'
                    className="top5-button-disabled"
                    onClick = {this.redo}>
                        &#x21B7;
                </div>
                <div
                    id='close-button'
                    className="top5-button-disabled"
                    onClick = {this.close}>
                        &#x24E7;
                </div>
            </div>
        )
    }
}