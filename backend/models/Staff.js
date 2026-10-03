const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema(
    {
        employeeId: {
            type: String,
            unique: true,
            trim: true,
            uppercase: true
        },

        firstName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

        lastName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            maxlength: 255
        },

        phone: {
            type: String,
            trim: true,
            maxlength: 50
        },

        photo: {
            type: String,
            trim: true
        },

        role: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department"
        },

        professionalTitle: {
            type: String,
            trim: true,
            maxlength: 150
        },

        qualification: {
            type: String,
            trim: true,
            maxlength: 500
        },

        specialization: {
            type: String,
            trim: true,
            maxlength: 300
        },

        employmentType: {
            type: String,
            enum: [
                "full_time",
                "part_time",
                "contract",
                "temporary"
            ],
            default: "full_time"
        },

        joiningDate: {
            type: Date
        },

        status: {
            type: String,
            enum: [
                "active",
                "inactive",
                "on_leave",
                "suspended"
            ],
            default: "active"
        },

        schedule: {
            type: String,
            trim: true,
            maxlength: 2000
        },

        permissions: [
            {
                type: String,
                trim: true
            }
        ],

        activity: {
            type: String,
            trim: true,
            maxlength: 5000
        },

        securityNotes: {
            type: String,
            trim: true,
            maxlength: 3000
        },

        lastActive: {
            type: Date
        },

        notes: {
            type: String,
            trim: true,
            maxlength: 5000
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
);

staffSchema.index({ employeeId: 1 });
staffSchema.index({ email: 1 });
staffSchema.index({ role: 1 });
staffSchema.index({ department: 1 });
staffSchema.index({ status: 1 });
staffSchema.index({ lastActive: -1 });

staffSchema.pre("validate", async function (next) {
    if (!this.employeeId) {
        const Staff = this.constructor;

        const count = await Staff.countDocuments();

        const sequence = String(count + 1).padStart(4, "0");

        this.employeeId = `EMP-${sequence}`;
    }

    next();
});

staffSchema.virtual("fullName").get(function () {
    return `${this.firstName} ${this.lastName}`.trim();
});

staffSchema.set("toJSON", {
    virtuals: true
});

staffSchema.set("toObject", {
    virtuals: true
});

module.exports = mongoose.model("Staff", staffSchema);