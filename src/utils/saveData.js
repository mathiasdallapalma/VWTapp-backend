import {ReservationModel} from '../models/Reservations.js';
import {TourModel} from '../models/Tours.js';
async function saveData(tourData,tourResData){
    console.log("saveData:",tourData,tourResData);
    let reservation;
    switch (tourData.site) {
        case 'GuruWalk':
            reservation = await ReservationModel.findOne({ reservation_id: tourResData.reservation_id }); // Find a reservation with the id matching the current row
        case 'FreeTour':
            reservation = await ReservationModel.findOne({ reservation_id: tourResData.reservation_id }); // Find a reservation with the id matching the current row
    }
    
    if (!reservation) {
        reservation = new ReservationModel(tourResData);
        await reservation.save();
    }

    let tour = await TourModel.findOne({ title: tourData.title, date: tourData.date }); // Find a tour with the title and date matching the current row

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
export default saveData;