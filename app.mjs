import './config.mjs';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { customerSchema, flightSchema } from './db.mjs';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import passportLocalMongoose from 'passport-local-mongoose';
import session from 'express-session';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));

// configure templating to hbs
app.set('view engine', 'hbs');

// body parser (req.body)
app.use(express.urlencoded({ extended: false }));

app.use(express.json());


// db connection
// console.log(process.env.DSN);
mongoose.connect(process.env.DSN);

customerSchema.plugin(passportLocalMongoose);
mongoose.model('Customer', customerSchema);
mongoose.model('Flight', flightSchema);
const Customer = mongoose.model('Customer', customerSchema);
const Flight = mongoose.model('Flight', flightSchema);

app.use(session({ secret: 'your-secret-key', 
                  resave: false, 
                  saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(Customer.authenticate()));
passport.serializeUser(Customer.serializeUser());
passport.deserializeUser(Customer.deserializeUser());

app.get('/', (req, res) => {
    res.render('home');
});

// Register a new user
app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    const { username, password, name } = req.body; // Capture the last name from the request body
  
    // Check if the username is unique before creating the user
    const existingCus = await Customer.findOne({ username: username });
    if (existingCus) {
        return res.status(400).json({ error: 'Username already exists.' });
    } else {
        // Create a new user with the provided information
        let newCus = new Customer({ username, name });
        // console.log(newCus);
        if (!name) {
            newCus = new Customer({ username });
        }
  
        // Use Passport.js to register the user with a password
        Customer.register(newCus, password, (err) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          
          // Authenticate the user immediately after successful registration
          passport.authenticate('local')(req, res, () => {
            res.redirect('/');
            });
        });
      }
});

// Log in an existing customer
app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', passport.authenticate('local'), (req, res) => {
    // res.json({ success: 'Logged in' });
    res.redirect('/allTickets');
});

app.get('/allTickets', async (req, res) => {
    if (req.isAuthenticated()) {
        const filters = {};
        if (req.query.departure) {
            filters['departure'] = req.query.departure;
        }
        if (req.query.arrival) {
            filters['arrival'] = req.query.arrival;
        }
        if (req.query.departureDate) {
            filters['departureDate'] = new Date(req.query.departureDate);
        }
        if (req.query.price) {
            filters['price'] = {$lte: req.query.price};
        }
        const flights = await Flight.find(filters);
        const flightsWithFormattedDates = flights.map(flight => {
            const departureDate = new Date(flight.departureDate).toLocaleDateString();
            const arrivalDate = new Date(flight.arrivalDate).toLocaleDateString();
            const flightNum = flight.flightNum;
            const departure = flight.departure;
            const arrival = flight.arrival;
            const price = flight.price;
            return { departureDate, arrivalDate, flightNum, departure, arrival, price};
        });

        res.render('allTickets', { flights: flightsWithFormattedDates });
    } else {
        res.send('You are not logged in. <a href="/login">Log in</a> to view this page.');
    }
});

app.post('/buyTicket', async (req, res) => {
    if (req.isAuthenticated()) {
        const username = req.user.username;
        const customer = await Customer.findOne({ username: username });
        // console.log(req.body);
        const flightNum = req.body.flightNum;
        if (flightNum) {
            const flight = await Flight.findOne({ flightNum: flightNum });
            customer.bookings.push(flight);
            // console.log(customer.bookings);
            await customer.save();
            res.json({message: 'Ticket bought successfully!'});
        }
    } else {
        res.send('You are not logged in. <a href="/login">Log in</a> to view this page.');
    }
});

app.get('/myTickets', async (req, res) => {
    if (req.isAuthenticated()) {
        const username = req.user.username;
        const customer = await Customer.findOne({ username: username });
        // console.log(customer.bookings);
        const flightsWithFormattedDates = customer.bookings.map(flight => {
            const departureDate = new Date(flight.departureDate).toLocaleDateString();
            const arrivalDate = new Date(flight.arrivalDate).toLocaleDateString();
            const flightNum = flight.flightNum;
            const departure = flight.departure;
            const arrival = flight.arrival;
            const price = flight.price;
            return { departureDate, arrivalDate, flightNum, departure, arrival, price};
        });
        // res.render('myTickets', { tickets: customer.bookings });
        res.render('myTickets', { tickets: flightsWithFormattedDates });
    } else {
        res.send('You are not logged in. <a href="/login">Log in</a> to view this page.');
    }
});

app.post('/cancelTicket', async (req, res) => {
    if (req.isAuthenticated()) {
        const username = req.user.username;
        const customer = await Customer.findOne({ username: username });
        // console.log(customer.bookings);
        const flightNum = req.body.flightNum;
        if (flightNum) {
            // console.log(flightNum);
            for (let i = 0; i < customer.bookings.length; i++) {
                if (customer.bookings[i].flightNum === flightNum) {
                    customer.bookings.splice(i, 1);
                    // console.log(customer.bookings);
                    await customer.save();
                    res.json({message: 'Ticket cancelled successfully!'});
                    break;
                }
            }
        }
    } else {
        res.send('You are not logged in. <a href="/login">Log in</a> to view this page.');
    }
});

app.listen(process.env.PORT ?? 3000);
