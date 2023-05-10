import mongoose from "mongoose";
import { ReservationModel } from './Reservations.js';

const tourSchema = mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  reservations: [{type: mongoose.Schema.Types.ObjectId, ref: 'Reservation'},]
});

export const TourModel = mongoose.model("tours", tourSchema);
