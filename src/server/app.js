import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { registerAllRoutes } from '../routes/index.js';
import ejs from 'ejs';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();


app.use(express.static(path.join(__dirname, '..', '..', 'public')));

app.engine('html', ejs.renderFile);
app.set('view engine', 'html');

app.set('views', path.join(__dirname, '..', '..', 'public', 'views'));

await registerAllRoutes(app);

app.get('/', (req, res) => {
    res.render('index');
});
  
app.get('/about', (req, res) => {
    res.render('about');
});
  
app.get('/contact', (req, res) => {
    res.render('contact');
});


app.use((req, res) => {
    res.status(404).render('404');
});