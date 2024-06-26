import React, {useContext, useEffect, useState} from "react";
import WarehouseListItem from "./WarehouseListItem";
import Item from "./Item";
import axios from "axios";
import WarehouseContext from "../../Contexts/WarehouseContext";
import swal from "sweetalert";

interface WarehouseListProps {
    assigned_user_id: number | null;
    warehouse_id: number;
    warehouse_name: string;
    location: string;
    setCurrentPage: (page: string) => void;
}

function WarehouseList({assigned_user_id, warehouse_id, warehouse_name, location, setCurrentPage}: WarehouseListProps) {
    const [itemsInWarehouse, setItemsInWarehouse] = useState<Item[]>([]);
    const [itemsInTransit, setItemsInTransit] = useState<Item[]>([]);
    const [viewInTransit, setViewInTransit] = useState(false);
    const [assignedUser, setAssignedUser] = useState<string>("No assigned user");
    const {
        selectedId, setSelectedId,
        setSelectedUserId,
        overlayType, setOverlayType,
        editingWarehouse, deletingWarehouse,
        selectedItems, setSelectedItems,
        flushValues, setFlushValues
    } = useContext(WarehouseContext);

    useEffect(() => {
        if (warehouse_id !== null) {
            axios.get('http://localhost:3001/warehouses/items/' + warehouse_id, {}).then(res => {
                setItemsInWarehouse(res.data);
            });
            axios.get('http://localhost:3001/warehouses/movingItems/' + warehouse_id
            ).then(res => {
                setItemsInTransit(res.data);
            });

            if (assigned_user_id !== null) {
                axios.get('http://localhost:3001/user/byId/' + assigned_user_id).then(res => {
                    setAssignedUser(res.data.user_name);
                })
            }
            if (assigned_user_id === null) {
                setAssignedUser("No assigned user");
            }
            if (selectedId === warehouse_id && overlayType === "empty") {
                (document.getElementById(warehouse_id.toString()))!.style.zIndex = "170";
            } else {
                (document.getElementById(warehouse_id.toString()))!.style.zIndex = "";
            }
        }
    }, [overlayType, assigned_user_id, viewInTransit]);

    const handleCheckBox = (item: Item) => {
        setSelectedId(warehouse_id);
        let updatedItems = [...selectedItems];
        const itemIndex = updatedItems.findIndex((selectedItem) => selectedItem.item_id === item.item_id);
        if (itemIndex === -1) {
            updatedItems.push(item);
        } else {
            updatedItems.splice(itemIndex, 1);
        }
        setSelectedItems(updatedItems);
        if (updatedItems.length === 0) {
            setOverlayType("none");
            (document.getElementById(warehouse_id.toString()))!.style.zIndex = "";
        } else {
            setOverlayType("empty");
            (document.getElementById(warehouse_id.toString()))!.style.zIndex = "170";
        }
    }

    return (
        <div className="container-warehouse container-box" id={warehouse_id.toString()}>
            <div className="container-header">
                <div className="align-horizontal">
                    <h2 style={{marginRight: "0.5rem"}}>{warehouse_name.toUpperCase()}</h2>
                    {(editingWarehouse && overlayType !== "empty") &&
                        <button className="button-modify" onClick={() => {
                            setOverlayType("warehouseEditForm");
                            setSelectedUserId(assigned_user_id === null ? 0 : assigned_user_id);
                            setSelectedId(warehouse_id);
                        }}>
                            <img className="button-image" src="/images/edit_button.png" alt="Edit"/>
                        </button>
                    }
                    {(deletingWarehouse && overlayType !== "empty") &&
                        <button className="button-modify button-delete" onClick={() => {
                            if (itemsInWarehouse.length !== 0 || itemsInTransit.length !== 0) {
                                swal("Forbidden!", "You cannot delete a warehouse that contains items!", "error", {
                                    buttons: {},
                                    timer: 2500
                                });
                            } else {
                                setOverlayType("warehouseDeleteForm");
                                setSelectedId(warehouse_id);
                            }
                        }}>
                            <img className="button-image" src="/images/delete_button.png" alt="Delete"/>
                        </button>
                    }
                </div>
                <hr className="hr-left no-margin"/>
                <h4 className="text-dim-yellow">{location}</h4>
                <h4 className="text-light">{assignedUser}</h4>
                {overlayType !== "empty" ?
                    !viewInTransit?
                    <button style={{marginBottom: "0.5rem", borderRadius: "1rem 1rem 0 1rem", width: "7.4rem"}} onClick={() => {
                        setOverlayType("itemForm");
                        setSelectedItems(itemsInWarehouse);
                        setSelectedId(warehouse_id);
                    }}>Add Item
                    </button>
                        :
                        <button style={{marginBottom: "0.5rem"}} onClick={() => {
                            setCurrentPage('transactions');
                        }}>View Transactions</button>
                        :
                        <button style={{marginBottom: "0.5rem"}} onClick={() => {
                            setOverlayType("transactionForm");
                            (document.getElementById(warehouse_id.toString()))!.style.zIndex = "";
                            setSelectedId(warehouse_id);
                        }}>Create Transaction
                        </button>
                }
            </div>
            <div className="container-body">
                {(itemsInWarehouse.length === 0 && itemsInTransit.length === 0) ?
                    <p className="text-info">No items in warehouse</p>
                    :
                    <>
                        <div style={{width: "100%"}}>
                        <button id={`storage${warehouse_id}`} className="transfer-view-button-clicked storage-button" onClick={() => {
                            setViewInTransit(false);
                            setFlushValues(flushValues +1);
                            setSelectedItems([]);
                            setOverlayType("none");
                            document.getElementById(`storage${warehouse_id}`)!.className = "transfer-view-button-clicked storage-button";
                            if (selectedItems.length === 0) {
                                document.getElementById(`transfer${warehouse_id}`)!.className = "transfer-view-button transfer-button";
                            }
                        }}>
                            {selectedItems.length === 0?
                                "In storage"
                                :
                                "Unselect all"
                            }
                        </button>
                        {selectedItems.length === 0?
                            <button id={`transfer${warehouse_id}`} className="transfer-view-button transfer-button" onClick={() => {
                                setViewInTransit(true);
                                setFlushValues(flushValues + 1);
                                document.getElementById(`transfer${warehouse_id}`)!.className = "transfer-view-button-clicked transfer-button";
                                document.getElementById(`storage${warehouse_id}`)!.className = "transfer-view-button storage-button";
                            }}>In transit</button>
                            :
                            <button className="transfer-view-button remove-button" onClick={() => {
                                setOverlayType("itemRemoveAlert")
                            }}>Remove Items</button>
                        }</div>
                        <div className="container-inner-body">
                            {!viewInTransit ?
                                itemsInWarehouse.length === 0?
                                    <p className="text-info">All items are in transfer</p>
                                    :
                                    itemsInWarehouse.map((item) => (
                                        <WarehouseListItem itemName={item.item_name}
                                                           itemQuantity={item.item_quantity}
                                                           handleChecked={() => handleCheckBox(item)}
                                                           canCheck={true}/>
                                    ))
                                    : itemsInTransit.length === 0 ?
                                    <p>No items are in transit</p>
                                    :
                                    itemsInTransit.map((item) => (
                                        <WarehouseListItem itemName={item.item_name}
                                                           itemQuantity={item.item_quantity}
                                                           canCheck={false}/>
                                    ))
                            }
                        </div>
                    </>
                }
            </div>
        </div>
    )
}

export default WarehouseList;