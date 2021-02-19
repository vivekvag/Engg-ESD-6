const express = require('express')
const router = express.Router()
const appfile = require('../app.js')
router.get('/', function(req,res){
    const assignments = [
        {
            title: 'Title 1',
            desc: 'Desc 1',
            category: 'Category 1',
            day: 15,
            month: 'Jan',
            year: 2020
        },
        {
            title: 'Title 2',
            desc: 'Desc 2',
            category: 'Category 2',
            day: 29,
            month: 'Feb',
            year: 2020
        }
    ]
    res.render('assignments', { assignments: assignments, userLogin: appfile.userLogin });
});

module.exports = router