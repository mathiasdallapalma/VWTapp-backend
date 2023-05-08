import mongoose from "mongoose";

const ReservationsSchema = mongoose.Schema({
  reservation_guruWalk: {
    type: String,
    required: false,
  },
  walker: {
    type: String,
    required: true,
  },
  num_participants: {
    type: Number,
    required: true,
  },
  site: {
    type: String,
    required: true,
  }
});

export const ReservationModel = mongoose.model("reservations", ReservationsSchema);