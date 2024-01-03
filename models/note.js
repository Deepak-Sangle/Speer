const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    body : {
        type: String,
        required : true
    },
    createdBy : {
        type : String,
        required : true
    },
    sharedTo : {
        type : Array,
        required : false
    },
});

// Create text index on the 'body' field
noteSchema.index({ body: 'text' });

const Note = mongoose.model("Note", noteSchema);

module.exports = Note;