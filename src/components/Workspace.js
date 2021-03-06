import React from "react";
import ItemCard from "./ItemCard"

export default class Workspace extends React.Component {
    render() {
        const {currentList,handleUpdateCallback,renameItemCallback, saveOldItemCallback, moveItemCallback, saveOldItemIndexCallback, oldIndex} = this.props
        if(currentList !== null){
            return (
                <div id="top5-workspace">
                    <div id="workspace-edit">
                        <div id="edit-numbering">
                            <div className="item-number">1.</div>
                            <div className="item-number">2.</div>
                            <div className="item-number">3.</div>
                            <div className="item-number">4.</div>
                            <div className="item-number">5.</div>
                        </div>
                        <div id="edit-items">
                        {
                            currentList.items.map((item, index) => (
                                <ItemCard
                                moveItemCallback = {moveItemCallback}
                                saveOldItemIndex = {saveOldItemIndexCallback}
                                oldIndex = {oldIndex}
                                renameItemCallback = {renameItemCallback}
                                handleUpdateCallback = {handleUpdateCallback}
                                saveOldItemCallback = {saveOldItemCallback}
                                text = {item}
                                id = {index}
                                oldText = {item}
                                editActive= {false}
                                />
                            ))
                            
                        }
                        </div>
                    </div>
                </div>
            )
        }else{
            return (
                <div id="top5-workspace">
                    <div id="workspace-edit">
                        <div id="edit-numbering">
                            <div className="item-number">1.</div>
                            <div className="item-number">2.</div>
                            <div className="item-number">3.</div>
                            <div className="item-number">4.</div>
                            <div className="item-number">5.</div>
                        </div>
                        <div id="edit-items">
                            <div id = {0} key = {0} className = { "top5-item"} draggable = {true}></div>
                            <div id = {1} key = {1} className = { "top5-item"} draggable = {true}></div>
                            <div id = {2} key = {2} className = { "top5-item"} draggable = {true}></div>
                            <div id = {3} key = {3} className = { "top5-item"} draggable = {true}></div>
                            <div id = {4} key = {4} className = { "top5-item"} draggable = {true}></div>
                        </div>
                    </div>
                </div>
            )
        }
    }

}