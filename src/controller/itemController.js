const db = require("../database/db");


function createItem(req, res){
     try {
        const {name, category, price, quantity } = req.body;

        if (
            typeof name !== "string" || !name.trim() || 
            typeof category !== "string" || !category.trim() ||
            price === undefined ||
            quantity === undefined
        ) {
            return res.status(400).json({
                status: "error",
                message: "Name, category, price and quantity are reuired"
            });
        }
        if ( 
            typeof price !== "number" || 
            !Number.isFinite(price) ||
            price < 0 ||
            !Number.isInteger(quantity) ||
            quantity < 0
        ) {
            return res.status(400).json({
                status: "error",
                message: "The price and quantity MUST be a positive number "
            });
        }

        const result  = db.prepare(
            `INSERT INTO items (name,category,price, quantity) VALUES (?,?,?,?)`).run(name.trim(), category.trim(), price, quantity);

            const newItem = db.prepare(
                "SELECT * FROM items WHERE id = ?"
            ).get(result.lastInsertRowid);
            return res.status(201).json({
                status: "success",
                message: "Item created succesfully",
                data: newItem
            });
     } catch (error) {
        console.error("Create item error:", error.message);

        return res.status(500).json({
            status: "error",
            message: "Unable to create items"
        });
     }
}

function getItemsById(req, res){
    try {
        const id = Number(req.params.id);

        if(!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                status:"error",
                message: "Id must be a positive number"
            });
}
            const item = db.prepare("SELECT * FROM items WHERE id = ?").get(id);

            if (!item) {
                return res.status(400).json({
                    status: "error",
                    message: "Item not found"
                });
            }

            return res.status(200).json({
                status: "success",
                data: item
            });
        
    } catch (error) {
       console.error("Get item error:", error.message);
        
       return res.status(500).json({
        status: "error",
        message: "Unable to retrieve item"
       })
    }
}

function getAllItems(req, res){
    try {
        const items = db.prepare(
            "SELECT * FROM items ORDER BY id ASC"
        ).all();
        return res.status(200).json({
            status: "success",
            count: items.length,
            data: items
        })
    } catch (error) {
        console.error("Get items error:", error.message);

        return res.status(500).json({
            status: "error",
            message: "Unable to retrieve items from the database"
        });   
    }
}


function updateItems(req, res) {
    try {
        const id = Number(req.params.id);
        
        if (!Number.isInteger(id) || id <= 0){
            return res.status(400)/json({
                status: "error",
                message: "Item ID must be a positive number"
            });
        }

        const {name, category, quantity, price} = req.body;

        if (
            typeof name !== "string" || !name.trim() || 
            typeof category !== "string" || !category.trim() ||
             typeof price !== "number" || 
            !Number.isFinite(price) ||
            price < 0 ||
            !Number.isInteger(quantity) ||
            quantity < 0
        ) {
            return res.status(400).json({
                status: "error",
                message: "Provide valid parameters(name, category, price and quantity)"
            });
        }

        const existingItems = db.prepare("SELECT id FROM items WHERE id = ?").get(id);

        if(!existingItems) {
            return res.status(404).json({
                status: "error",
                message: "Item not found"
            });
        }

        db.prepare(
            `UPDATE items 
            SET name = ?,
            category = ?,
            price =?,
            quantity = ?,
            updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(name.trim(),category.trim(), price, quantity, id);

            const updatedItem = db.prepare("SELECT * FROM items WHERE id =?").get(id);

            return res.status(200).json({
                status: "success",
                message: "Item updated successfully", 
                data: updatedItem
            });
    } catch (error) {
        console.error("Update item error:", error.message);

        return res.status(500).json({
            status: "error",
            message: "Unable to update item"
        });
    }
}

function deleteItem(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Item ID must be a positive integer"
      });
    }

    const result = db.prepare(
      "DELETE FROM items WHERE id = ?"
    ).run(id);

    if (result.changes === 0) {
      return res.status(404).json({
        status: "error",
        message: "Item not found"
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Item deleted successfully",
      id
    });
  } catch (error) {
    console.error("Delete item error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Unable to delete item"
    });
  }
}

module.exports = {
    getAllItems,
    getItemsById,
    createItem,
    updateItems,
    deleteItem
};