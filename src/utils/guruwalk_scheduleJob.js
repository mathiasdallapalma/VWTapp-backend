import csvParser from 'csv-parser';
import { TourModel } from '../models/Tour.js';
import { ReservationModel } from '../models/Reservations.js';
import moment from 'moment';
import request from "request"
import mongoose from "mongoose";

async function requestcsv(options) {
    return new Promise((resolve, reject) => {
        request(options, function (error, response) {
            if (error) {
                console.error(error);
                reject(error); 
            } else {
                resolve(response.body);
            }
        });
    });
}

async function storeRowtoDB(row) {
    //row index: ID prenotazione,Data,Time,Walker,Tour,No. di persone,Lingua,Stato della prenotazione
    //              0               1   2   3       4   5               6       7   

    // Combine the date and time into a single datetime object
    let dateObj = moment(row[1] + row[2], "DD/MM/YYYYHH:mm");
    const combinedDateTime = Date.parse(dateObj)

    const tourResData = {
        reservation_guruWalk: row[0],
        walker: row[3],
        num_participants: parseInt(row[5]),
        site: 'GuruWalk',
    };

    let id = mongoose.Types.ObjectId();

    const tourData = {
        _id: id,
        date: combinedDateTime,
        title: row[4],
        reservations: []
    };

    let reservation = await ReservationModel.findOne({ reservation_guruWalk: row[0] }); // Find a reservation with the id matching the current row

    if (!reservation) {
        reservation = new ReservationModel(tourResData);
        await reservation.save();
    }

    let tour = await TourModel.findOne({ title: row[4], date: combinedDateTime }); // Find a tour with the title and date matching the current row

    if (!tour) {
        // Create a new tour if it doesn't exist
        tour = new TourModel(tourData);
        tour.reservations = [reservation._id];
        await tour.save();
    } else {
        // If a tour was found, add the reservation data to its reservations array
        // First, check if the reservation already exists in the array to avoid duplicates

        const existingRes = tour.reservations.find(res =>
            res.equals(reservation._id)
        );
        if (!existingRes) {
            tour.reservations.push(reservation._id);
            await tour.save();
        }
    }
}

const processRows = async (rows) => {
    let futureMonth = new Date();
    futureMonth.setMonth(futureMonth.getMonth() + 1);
    

    for (const row of rows) {
        const row_arr = row.split(',');
        console.log(row_arr[1])

        let dateParts = row_arr[1].split("/");
        let date = new Date(dateParts[2], (dateParts[1] - 1), dateParts[0]);

        if (date.getTime() < futureMonth.getTime()) {
            await storeRowtoDB(row_arr);
        } else {
            break;
        }
    };
}

async function guruwalk_schedulejob() {
    var options = {
        'method': 'POST',
        'url': 'https://www.guruwalk.com/gurus/bookings/'+process.env.GURUWALK_LINK,
        'headers': {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': process.env.GURUWALK_COOKIE
        },
        form: {
            'authenticity_token': process.env.GURUWALK_AUTH_TOKEN
        }
    };

    let myCsvString;
    try {
        myCsvString = await requestcsv(options);
    } catch (error) {
        console.error(error);
    }

    // Validate if the CSV string is not empty
    if (myCsvString !== undefined && myCsvString !== null) {

        const rows = myCsvString.split('\n');
        rows.shift();

        // Validate if rows were successfully split from the CSV string
        if (Array.isArray(rows) && rows.length > 0) {


            processRows(rows);


        } else {
            console.error('No rows found in CSV string');
        }
    } else {
        console.error('CSV string is empty');
    }



}

export default guruwalk_schedulejob;


