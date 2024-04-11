import mongoose from 'mongoose';

const flightSchema = new mongoose.Schema({
    flightNum: {
        type: String,
        required: true
    },
    departure: {
        type: String,
        required: true
    },
    arrival: {
        type: String,
        required: true
    },
    departureDate: {
        type: Date,
        required: true
    },
    arrivalDate: {
        type: Date,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
});

const customerSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: false
    },
    // password: {
    //     type: String,
    //     required: true
    // },
    bookings: [flightSchema]
});


// mongoose.model('Customer', customerSchema);
// const Flight = mongoose.model('Flight', flightSchema);

export { customerSchema, flightSchema };
