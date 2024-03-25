"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("./db");
const router = (0, express_1.Router)();
async function authenticateUser(userType) {
    try {
        if (!userType) {
            throw Error("Provide user type!");
        }
        const { rows: role } = await db_1.default.query(`SELECT role FROM grocery_user_account WHERE role = $1`, [userType.toUpperCase()]);
        return role && role[0] && role[0].role === 'ADMIN' ? true : false;
    }
    catch (error) {
        console.error("Error while authenticating user", error);
        throw (error);
    }
}
async function getUser(userType) {
    try {
        if (!userType) {
            throw Error("Provide user type!");
        }
        const { rows: role } = await db_1.default.query(`SELECT user_id FROM grocery_user_account WHERE role = $1`, [userType.toUpperCase()]);
        if (role && role.length >= 1) {
            return role[0].user_id;
        }
        else {
            throw ('Not a valid user');
        }
    }
    catch (error) {
        console.error("Error fetching user details", error);
        throw (error);
    }
}
router.get("/welcome", (req, res) => {
    res.send("Welcome to the grocery Store!");
});
router.get("/user/grocery-items", async (req, res) => {
    try {
        const result = await db_1.default.query("SELECT * FROM groceries WHERE is_active");
        const groceryList = result.rows;
        res.json(groceryList);
    }
    catch (error) {
        console.error("Error while fetching grocery items", error);
        res.status(500).json({ error: "Error while fetching grocery items" });
    }
});
router.post("/add-grocery-items", async (req, res) => {
    try {
        const userType = req.headers.type;
        const validUser = await authenticateUser(userType);
        if (validUser) {
            const { name, price, is_active, quantity } = req.body;
            const { rows: itemAvailable } = await db_1.default.query("SELECT count(*) FROM groceries WHERE name= $1", [name]);
            if (itemAvailable && itemAvailable[0].count === 0) {
                throw ('Item alredy present in list please with update');
            }
            const result = await db_1.default.query("INSERT INTO groceries(name, price, is_active, quantity) VALUES ($1, $2, $3, $4) RETURNING *", [name, price, is_active, quantity]);
            const groceryItem = result.rows[0];
            res.status(201).json(groceryItem);
        }
        else {
            res.status(400).json({ error: "Not Authorized to acces" });
        }
    }
    catch (error) {
        console.error("Error while adding grocery items", error);
        res.status(500).json(`Error while adding grocery items:: ${error}`);
    }
});
router.get("/get-all-grocery-items", async (req, res) => {
    try {
        const result = await db_1.default.query("SELECT * FROM groceries");
        const groceryItems = result.rows;
        res.json(groceryItems);
    }
    catch (error) {
        console.error("Error while getting grocery items", error);
        res.status(500).json({ error: "Error while getting grocery items" });
    }
});
router.delete("/remove-grocery-item/:id", async (req, res) => {
    try {
        const userType = req.headers.type;
        const validUser = await authenticateUser(userType);
        if (validUser) {
            const groceryId = parseInt(req.params.id, 10);
            if (isNaN(groceryId)) {
                return res.status(400).json({ error: "Invalid grocery ID" });
            }
            const { rows: itemAvailable } = await db_1.default.query("SELECT count(*) FROM groceries WHERE grocery_id= $1", [groceryId]);
            if (itemAvailable && +itemAvailable[0].count === 0) {
                throw ('Item is not present in list please verify');
            }
            await db_1.default.query("DELETE FROM groceries WHERE grocery_id = $1", [groceryId]);
            res.sendStatus(200);
        }
    }
    catch (error) {
        console.error("Error while deleting grocery items", error);
        res.status(500).json(`Error while deleting grocery items:: ${error}`);
    }
});
router.put("/update-grocery-item/:id", async (req, res) => {
    try {
        const userType = req.headers.type;
        const validUser = await authenticateUser(userType);
        if (validUser) {
            const groceryId = parseInt(req.params.id, 10);
            if (isNaN(groceryId)) {
                return res.status(400).json({ error: "Invalid grocery ID" });
            }
            const { rows: itemAvailable } = await db_1.default.query("SELECT count(*) FROM groceries WHERE grocery_id= $1", [groceryId]);
            if (itemAvailable && +itemAvailable[0].count === 0) {
                throw ('Item is not present in list please verify');
            }
            const { name } = req.body;
            await db_1.default.query("UPDATE groceries SET name = $1 WHERE grocery_id = $2", [
                name,
                groceryId
            ]);
            res.sendStatus(200);
        }
    }
    catch (error) {
        console.error("Error while updating grocery items", error);
        res.status(500).json(`Error while updating grocery items:: ${error}`);
    }
});
router.get("/enlist-grocery-items", async (req, res) => {
    try {
        const userType = req.headers.type;
        const validUser = await authenticateUser(userType);
        if (validUser) {
            const result = await db_1.default.query("SELECT name, quantity, expirt_date FROM groceries");
            const groceryList = result.rows;
            res.json(groceryList);
        }
    }
    catch (error) {
        console.error("Error fetching grocery items", error);
        res.status(500).json({ error: "Error fetching grocery items" });
    }
});
router.post("/grocery-order", async (req, res) => {
    try {
        const userType = req.headers.type;
        const validUser = await authenticateUser(userType);
        if (!validUser) {
            const userId = await getUser(userType);
            if (Array.isArray(req.body) && req.body.length >= 0) {
                req.body.forEach(async (e) => {
                    await db_1.default.query("INSERT INTO grocery_order(name, quantity, user_id, created_by, updated_by) VALUES ($1, $2, $3, $4, $5) RETURNING *", [e.name, e.quantity, userId, userId, userId]);
                    res.status(201).json();
                });
            }
        }
    }
    catch (error) {
        console.error("Error while adding grocery items", error);
        res.status(500).json({ error: "Error while adding grocery items" });
    }
});
exports.default = router;
