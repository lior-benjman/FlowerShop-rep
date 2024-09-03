import { app } from "../server/app.js";
import { flowersRoutes } from "./flowerRoutes.js";
import { usersRoutes } from "./userRoutes.js";
import { ordersRoutes } from "./orderRoutes.js";
import { categoriesRoutes } from "./categoryRoutes.js";

const healthRoutes = async () => {
    app.get('/health', async (req, res) =>
      res.code(200).send({ pong: 'Server is alive' })
    );
  };

export const registerAllRoutes = (app) => {
    app.use('/health', healthRoutes);
    app.use('/flowers', flowersRoutes);
    app.use('/users', usersRoutes);
    app.use('/orders', ordersRoutes);
    app.use('/categories', categoriesRoutes);
};
