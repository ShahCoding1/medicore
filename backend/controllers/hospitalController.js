const Hospital = require("../models/Hospital");

const createOrUpdateHospital = async (req, res, next) => {
    try {
        const {
            name,
            type,
            registrationNumber,
            country,
            city,
            address,
            phone,
            email,
            website
        } = req.body;

        if (
            !name ||
            !type ||
            !country ||
            !city ||
            !address ||
            !phone ||
            !email
        ) {
            return res.status(400).json({
                success: false,
                message: "Please complete all required hospital fields."
            });
        }

        const hospital = await Hospital.findOneAndUpdate(
            { owner: req.user.id },
            {
                owner: req.user.id,
                name: name.trim(),
                type,
                registrationNumber:
                    registrationNumber?.trim() || "",
                country: country.trim(),
                city: city.trim(),
                address: address.trim(),
                phone: phone.trim(),
                email: email.trim().toLowerCase(),
                website: website?.trim() || ""
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        return res.status(200).json({
            success: true,
            message: "Hospital information saved successfully.",
            data: {
                hospital
            }
        });

    } catch (error) {
        next(error);
    }
};


const completeOnboarding = async (req, res, next) => {
    try {
        const hospital = await Hospital.findOneAndUpdate(
            { owner: req.user.id },
            {
                onboardingCompleted: true
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital setup has not been completed."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Hospital onboarding completed successfully.",
            data: {
                hospital
            }
        });

    } catch (error) {
        next(error);
    }
};


module.exports = {
    createOrUpdateHospital,
    completeOnboarding
};