const express = require("express");
const {
    getAllItems,
    getItemsById,
    createItem,
    updateItems,
    deleteItem
} = require("./controller/itemController");

const app = express();

app.use(express.json());

app.get("/health", (req, res)=>{
    res.status(200).json({
        status: "success",
        message: "Our inventory API is working"
    });
});

app.post("/items", createItem);
app.get("/items", getAllItems);
app.get("/items/:id", getItemsById);
app.put("/items/:id", updateItems);
app.delete("/items/:id", deleteItem);

app.use((err, req, res, next) => {
    if(err instanceof SyntaxError && err.status === 400 && "body" in err){
        return res.status(400).json({
            status: "error",
            message: "Request body contains invalid JSON format"
        });
    }
    next(err);
});

app.use((req, res, next) => {
    res.status(404).json({
        status: "error",
        message: "No endpoints found"
    });
});

module.exports = app;