import User from "../schema/models/User.js";
import { app } from "../server/app.js";

export const usersRoutes = async () => {
app.post('/', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();   
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
    });
    
    app.get('/search', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    })
};