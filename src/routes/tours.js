import express from "express";
import mongoose from "mongoose";
import { TourModel } from "../models/Tours.js";
import { ReservationModel } from "../models/Reservations.js";
import { verifyToken } from "./user.js";

const router = express.Router();

// Get all tours (Joined with partecipants and total of reservations)
router.get('/', verifyToken, async (req, res) => {
  let tours;

  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // month is zero-based, so add 1
    const currentYear = currentDate.getFullYear();
    switch (req.query.size) {
      case 'thisMonth':
        tours = await TourModel.aggregate([
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: '$date' }, currentYear] },
                  { $eq: [{ $month: '$date' }, currentMonth] },
                ]
              }
            }
          },
          {
            $lookup: {
              from: 'reservations',
              localField: 'reservations',
              foreignField: '_id',
              as: 'reservations',
            },
          },
          {
            $addFields: {
              total_participants: { $sum: '$reservations.num_participants' },
            },
          },
        ]);
        res.json(tours);
        break;

      case 'nextMonth':
        tours = await TourModel.aggregate([
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $year: '$date' }, currentYear] },
                  { $eq: [{ $month: '$date' }, currentMonth+1] },
                ]
              }
            }
          },
          {
            $lookup: {
              from: 'reservations',
              localField: 'reservations',
              foreignField: '_id',
              as: 'reservations',
            },
          },
          {
            $addFields: {
              total_participants: { $sum: '$reservations.num_participants' },
            },
          },
        ]);
        res.json(tours);
        break;

      default:
        tours = await TourModel.aggregate([
          {
            $lookup: {
              from: 'reservations', // the name of the lookup collection
              localField: 'reservations',
              foreignField: '_id',
              as: 'reservations',
            },
          },
          {
            $addFields: {
              total_participants: { $sum: '$reservations.num_participants' },
            },
          },
        ]);
        res.json(tours);
        break;
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export { router as toursRouter };
