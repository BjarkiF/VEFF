const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;
const prefix = "/api/v1";
app.use(bodyParser.json());

let nextEventId = 0;
let nextBookId = 0;
let events = [];
let bookings = [];

//Read all events
app.get(prefix + '/events', (req, res) => {
    var newEvents = events.map(readAllData);
    res.status(200).json(newEvents);
});

//Read event
app.get(prefix + '/events/:eventId', (req, res) => {
    for (let i = 0; i < events.length; i++){
        if (events[i].id == req.params.eventId){
            res.status(200).json(events[i]);
            return
        }
    }
    return res.status(404).json({'message': "Event with id " + req.params.eventId + " not found."});
});

//Create event
app.post(prefix + '/events', (req, res) => {
    var tempLocation;
    var tempDescription;
    if (req.body === undefined || req.body.name === undefined || req.body.capacity === undefined ||
        req.body.startDate === undefined || req.body.endDate === undefined) {
        return res.status(400).json({'message': "Name, capacity, startDate and endDate fields are required"});
    } else if (isNaN(Number(req.body.capacity)) || req.body.capacity <= 0) {
        return res.status(400).json({'message': "Capacity must be a number larger than 0"});
    } else if (!dateValidate(req.body.startDate) || !dateValidate(req.body.endDate) ||
        req.body.startDate > req.body.endDate) {
        return res.status(400).json({'message': "Invalid date"})
    }
    if (req.body.location === undefined) {
        tempLocation = "";
    } else {
        tempLocation = req.body.location
    }
    if (req.body.description === undefined) {
        tempDescription = "";
    } else {
        tempDescription = req.body.description
    }
    let newEvent = {
        id: nextEventId,
        name: req.body.name,
        capacity: req.body.capacity,
        startDate: new Date(req.body.startDate * 1000),
        endDate: new Date(req.body.endDate * 1000),
        description: tempDescription,
        location: tempLocation,
        bookings: [],
        bookedSpots: 0
    };
    events.push(newEvent);
    nextEventId++;
    res.status(201).json(newEvent);
});

//Update event
app.put(prefix + '/events/:eventId', (req, res) => {
    if (events[req.params.eventId].bookings.length){
        return res.status(400).json({'message': "Cannot update an event with confirmed bookings"})
    } else if (req.body === undefined || req.body.name === undefined || req.body.description === undefined ||
        req.body.location === undefined || req.body.capacity === undefined || req.body.startDate === undefined ||
        req.body.endDate === undefined){
        return res.status(400).json({'message': "Name, Description, Location, Capacity, Start and End dates required"})
    } else if (isNaN(Number(req.body.capacity)) || req.body.capacity <= 0){
        return res.status(400).json({'message': "Capacity must be a number greater than 0"})
    } else if(!dateValidate(req.body.startDate) || !dateValidate(req.body.endDate) ||
        req.body.startDate > req.body.endDate){
        return res.status(400).json({'message': "Invalid date"})
    }
    for (let i = 0; i < events.length; i++){
        if (events[i].id == req.params.eventId){
            events[i].name = req.body.name;
            events[i].capacity = req.body.capacity;
            events[i].startDate = new Date(req.body.startDate * 1000);
            events[i].endDate = new Date(req.body.endDate * 1000);
            events[i].description = req.body.description;
            events[i].location = req.body.location;
            return res.status(200).json(events[i]);
        }
    }
});

//Delete event
app.delete(prefix + '/events/:eventId', (req, res) => {
    var bookingsArray = [];
    for (let i = 0; i < events.length; i++){
        if (events[i].id == req.params.eventId){
            for (j = 0; j < events[i].bookings.length; j++){
                for (k = 0; k < bookings.length; k++){
                    if (events[i].bookings[j] ===  k){
                        bookingsArray.push(bookings[k])
                    }
                }
            }
            events[i].bookings = bookingsArray;
            var returnArray = events.splice(i, 1);
            return res.status(200).json(returnArray);
        }
    }
    return res.status(404).json({'message': "Event with id " + req.params.eventId + " not found."});
});

//Delete all events
app.delete(prefix + '/events', (req, res) => {
    var bookingsArray = [];
    for (let i = 0; i < events.length; i++) {
        bookingsArray = [];
            for (j = 0; j < events[i].bookings.length; j++) {
                for (k = 0; k < bookings.length; k++) {
                    if (events[i].bookings[j] === k) {
                        bookingsArray.push(bookings[k])
                    }
                }
            }
        events[i].bookings = bookingsArray;
    }
    var returnArray = events.slice();
    events = [];
    res.status(200).json(returnArray);
});

//Read all bookings for event
app.get(prefix + '/events/:eventId/bookings', (req, res) => {
    var ArrBookings = [];
    for (let i = 0; i < events.length; i++){
        if(events[i].id == req.params.eventId) {
            for (let j = 0; j < events[i].bookings.length; j++) {
                for (let k = 0; k < bookings.length; k++) {
                    if (events[i].bookings[j] === bookings[k].id){
                        ArrBookings.push(bookings[k])
                    }
                }
            }
            return res.status(200).json(ArrBookings);
        }
        }
    return res.status(404).json({'message': "Event with id " + req.params.eventId + " not found"})
    });

//Read 1 booking
app.get(prefix + '/events/:eventId/bookings/:bookingId', (req, res) => {
    for (let i = 0; i < events.length; i++) {
        if (events[i].id == req.params.eventId) {
            for (let j = 0; j < events[i].bookings.length; j++) {
                if (events[i].bookings[j] == req.params.bookingId) {
                    res.status(200).json(bookings[events[i].bookings[j]]);
                }
            }
            res.status(404).json({'message': "Booking with id " + req.params.bookingId + " not found."});
            return
        }
    }
    res.status(404).json({'message': "Event with id" + req.params.eventId + " not found."});
});

//Create booking
app.post(prefix + '/events/:eventId/bookings', (req, res) => {
    if (req.body === undefined || req.body.firstName === undefined ||
        req.body.lastName === undefined || req.body.spots === undefined){
        return res.status(400).json({'message': "First name, Last name and spots fields required"})
    } else if (req.body.tel === undefined && req.body.email === undefined){
            return res.status(400).json({'message': "Either telephone or email are required"})
    } else if (isNaN(Number(req.body.spots || req.body.spots <= 0))){
            return res.status(400).json({'message': "Number of booked spots must be a number greater than 0"})
    } else{
            if (req.body.tel === undefined) {
                tempTel = "";
            } else {
                if (isNaN(Number(req.body.tel))){
                    return res.status(400).json({'message': "Telephone must be a valid number"})
                } else{
                    tempTel = req.body.tel
                }
            }
            if (req.body.email === undefined) {
                tempEmail = "";
            } else {
                tempEmail = req.body.email
            }
    }
    let newBooking = {
        id: nextBookId,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        tel: tempTel,
        email: tempEmail,
        spots: req.body.spots
    };
    for (let i = 0; i < events.length; i++){
        if (events[i].id == req.params.eventId){
            if ((events[i].bookedSpots + newBooking.spots) > events[i].capacity){
                return res.status(400).json({'message': "Only " + (events[i].capacity-events[i].bookedSpots) + " spots available. You tried to book " + (newBooking.spots)})
            } else {
                bookings.push(newBooking);
                events[i].bookings.push(newBooking.id);
                events[i].bookedSpots += newBooking.spots;
                nextBookId++;
                return res.status(201).json(newBooking)
            }
        }
    }
    return res.status(404).json({'message': "Event with id " + req.params.eventId + " not found."})


});

//Delete booking
app.delete(prefix + '/events/:eventId/bookings/:bookingId', (req, res) => {
    for (let i = 0; i < events.length; i++){
        if (events[i].id == req.params.eventId){
            for (let j = 0; j < events[i].bookings.length; j++){
                if(events[i].bookings[j] == req.params.bookingId){
                    events[i].bookings.splice(j, 1);
                    var returnArray = bookings.splice(j, 1);
                    return res.status(200).json(returnArray);
                }
            }
            return res.status(404).json({'message': "Booking with id" + req.params.bookingId + " not found"});
        }
    }
    return res.status(404).json({'message': "Event with id" + req.params.eventId + " not found"});
});

//Delete all bookings
app.delete(prefix + '/events/:eventId/bookings', (req, res) => {
    var bookingsArray = [];
    for (let i = 0; i < events.length; i++){
        if (events[i].id == req.params.eventId){
            for (j = 0; j < events[i].bookings.length; j++){
                for (k = 0; k < bookings.length; k++){
                    if (events[i].bookings[j] ===  k){
                        bookingsArray.push(bookings[k])
                    }
                }
            }
            events[i].bookings = [];
            return res.status(200).json(bookingsArray);
        }
    }
    return res.status(404).json({'message': "Event with id " + req.params.eventId + " not found."});
});


//All other commands not supported
app.use('*', (req, res) => {
    res.status(405).json({'message': "Operation not supported"});
});

app.listen(port, () => {
    console.log('App listening on port ' + port);
});

function readAllData(event) {
    returnArray = {
        name: event.name,
        id: event.id,
        capacity: event.capacity,
        startDate: event.startDate,
        endDate: event.endDate
    };
    return returnArray;
}

function dateValidate(number){
    var now = Date.now();
    if (isNaN(Number(number))){
        return false;
    } else if (number <= 0){
        return false;
    } else if (number * 1000 < now){
        return false;
    }
    return true;

}