const express = require('express');
const router = express.Router();
require("dotenv").config();

//Requiring Models Schemas
const User = require('../models/user');
const Note = require('../models/note');

const { isTokenValid } = require('../middleware/authorization');

router.post('/', isTokenValid, async (req,res)=> {
    const id = req.id;

    const note = new Note({
        createdBy : id,
        body : req.body.body,
        sharedTo : []
    });
 
    note.save()
        .then((result)=> {
            return res.status(201).send({message : "New note succesfully created : ", success : true, data : result});
        })
        .catch((err)=> {
            console.log(err);
            return res.status(500).json({message: err.message, success : false});
        })
});

router.get('/', isTokenValid, async (req,res)=> {

    const id = req.id;

		Note.find({
			$or: [
				{ createdBy: id },					    // Check my notes
				{ sharedTo: { $in: [id] } } 		// Check shared notes
			]
		})
        .then((result) => {
            return res.status(200).send({data : result, success : true});
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).json({message: err.message, success : false});
        })
});

router.get('/:id', isTokenValid, async (req,res)=> {

    const id = req.id;
    const noteId = req.params.id;

    Note.findOne({_id : noteId})
        .then((result) => {
            if(!result) return res.status(404).send({message : "Note not found", success : false});
			if(result.createdBy != id && !result.sharedTo.includes(id)) return res.status(401).send({message : "You are not authorized to view this note", success : false});
			return res.status(200).send({data : result, success : true});
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).json({message: err.message, success : false});
        })
});

router.put('/:id', isTokenValid, async (req,res)=> {

    const id = req.id;
    const noteId = req.params.id;

    Note.findOne({createdBy : id, _id : noteId})
        .then((result) => {
			if(!result) return res.status(404).send({message : "Note not found", success : false});
			result.body = req.body.body;
			result.save();
            return res.status(200).send({data : result, success : true});
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).json({message: err.message, success : false});
        })
});

router.delete('/:id', isTokenValid, async (req,res)=> {

	const id = req.id;
	const noteId = req.params.id;

	Note.findOne({createdBy : id, _id : noteId})
		.then((result) => {
			if(!result) return res.status(404).send({message : "Note not found", success : false});
			result.delete();
			return res.status(200).send({message : "Note deleted successfully", success : true});
		})
		.catch((err) => {
			console.log(err);
			return res.status(500).json({message: err.message, success : false});
		});

});

router.post('/:id/share', isTokenValid, async (req,res)=> {

	const id = req.id;
	const noteId = req.params.id;
	const sharedToId = req.body.sharedToId;

	if(!sharedToId) return res.status(404).send({message : "Please enter the \"sharedToId\"", success : false});

	const sharedUser = User.findOne({_id : sharedToId});
	if(!sharedUser) return res.status(404).send({message : "SharedTo User not found", success : false});

	Note.findOne({_id : noteId})
		.then((result) => {
			if(!result) return res.status(404).send({message : "Note not found", success : false});
			if(result.createdBy != id &&					// this ensures that i can share only my notes
			  !result.sharedTo.includes(id)	    			// this ensures that i can share the notes which are shared to me
			) return res.status(401).send({message : "You are not authorized to share this note", success : false});
			if(result.sharedTo.includes(sharedToId)) return res.status(200).send({message : "Note already shared to this user", success : true});
			result.sharedTo.push(sharedToId);
			result.save();
			return res.status(200).send({message : "Note shared successfully", success : true});
		})
		.catch((err) => {
			console.log(err);
			return res.status(500).json({message: err.message, success : false});
		});

});

module.exports = router;