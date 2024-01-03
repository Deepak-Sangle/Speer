const express = require('express');
const router = express.Router();
require("dotenv").config();

//Requiring Models Schemas
const Note = require('../models/note');

const { isTokenValid } = require('../middleware/authorization');

router.get('/search', isTokenValid, async (req,res)=> {

    const id = req.id;
	const queryParam = req.query.q;

	Note.find({
        $text: {
            $search: queryParam,
        }, 
        createdBy : id
    })
		.then((result) => {
			return res.status(200).send({data : result, success : true});
		})
		.catch((err) => {
			console.log(err);
			return res.status(500).json({message: err.message, success : false});
		});
	
});


module.exports = router;