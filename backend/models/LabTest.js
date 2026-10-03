const mongoose = require("mongoose");

const labTestSchema = new mongoose.Schema(
    {
        testName: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 150
        },

        testCode: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
            maxlength: 50
        },

        category: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

        description: {
            type: String,
            trim: true,
            maxlength: 500,
            default: ""
        },

        sampleType: {
            type: String,
            trim: true,
            maxlength: 100,
            default: ""
        },

        preparationRequired: {
            type: Boolean,
            default: false
        },

        preparationInstructions: {
            type: String,
            trim: true,
            maxlength: 500,
            default: ""
        },

        turnaroundTime: {
            type: String,
            trim: true,
            maxlength: 100,
            default: ""
        },

        price: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

/*
|--------------------------------------------------------------------------
| Indexes
|--------------------------------------------------------------------------
*/

labTestSchema.index({ testName: 1 });
labTestSchema.index({ testCode: 1 }, { unique: true });
labTestSchema.index({ category: 1 });
labTestSchema.index({ status: 1 });

/*
|--------------------------------------------------------------------------
| Virtual
|--------------------------------------------------------------------------
*/

labTestSchema.virtual("displayName").get(function () {
    return `${this.testName} (${this.testCode})`;
});

/*
|--------------------------------------------------------------------------
| JSON Configuration
|--------------------------------------------------------------------------
*/

labTestSchema.set("toJSON", {
    virtuals: true
});

module.exports = mongoose.model("LabTest", labTestSchema);