import express from 'express';

export const app = express();
const port = 3000;

export const startServer = async () => {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}
