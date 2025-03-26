import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'senderType'
    },
    senderType: {
        type: String,
        required: true,
        enum: ['Petitioner', 'Official']
    },
    message: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const statusHistorySchema = new mongoose.Schema({
    status: {
        type: String,
        required: true,
        enum: ['pending', 'assigned', 'in-progress', 'resolved', 'rejected']
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'statusHistory.updatedByType'
    },
    updatedByType: {
        type: String,
        required: true,
        enum: ['petitioner', 'official', 'admin']
    },
    comment: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const grievanceSchema = new mongoose.Schema({
    petitionId: {
        type: String,
        unique: true,
        required: true,
        default: function () {
            return `GRV${Date.now().toString().slice(-6)}`;
        }
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    department: {
        type: String,
        required: true,
        enum: ['Water', 'RTO', 'Electricity']
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    petitioner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Petitioner'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Official',
        default: null
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'assigned', 'in-progress', 'resolved', 'rejected'],
        default: 'pending'
    },
    statusHistory: [statusHistorySchema],
    chatMessages: [chatMessageSchema],
    originalDocument: {
        filename: String,
        path: String,
        uploadedAt: Date
    },
    resolutionDocument: {
        filename: String,
        path: String,
        uploadedAt: Date
    },
    resolution: {
        text: String,
        date: Date
    },
    feedback: {
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        comment: String,
        date: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
grievanceSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

const Grievance = mongoose.model('Grievance', grievanceSchema);

export default Grievance; 