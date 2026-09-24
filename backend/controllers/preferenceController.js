const Hospital = require("../models/Hospital");
const Preference = require("../models/Preference");

const savePreferences = async (req, res, next) => {
    try {
        const {
            currency,
            timezone,
            dateFormat,
            workingHoursStart,
            workingHoursEnd,
            appointmentDuration
        } = req.body;

        if (
            !currency ||
            !timezone ||
            !dateFormat ||
            !workingHoursStart ||
            !workingHoursEnd ||
            !appointmentDuration
        ) {
            return res.status(400).json({
                success: false,
                message: "Please complete all preference fields."
            });
        }

        if (workingHoursStart >= workingHoursEnd) {
            return res.status(400).json({
                success: false,
                message:
                    "Working hours end time must be after start time."
            });
        }

        const hospital = await Hospital.findOne({
            owner: req.user.id
        });

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital setup has not been completed."
            });
        }

        const preference = await Preference.findOneAndUpdate(
            { hospital: hospital._id },
            {
                hospital: hospital._id,
                currency,
                timezone,
                dateFormat,
                workingHoursStart,
                workingHoursEnd,
                appointmentDuration: Number(
                    appointmentDuration
                )
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        return res.status(200).json({
            success: true,
            message: "Preferences saved successfully.",
            data: {
                preference
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    savePreferences
};