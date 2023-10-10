const express = require('express');
const router = express.Router();
const {body, validationResult} = require('express-validator')
const connection = require('../config/db');

// router get 
router.get('/',function(req,res){
    connection.query('SELECT *from transmisi order by id_transmisi desc',function(err, rows){
        if(err){
            return res.status(500).json({
                status:false,
                message: 'server failed',
                error:err,
            })
        }else{
            return res.status(200).json({
                status:true,
                message:'data transmisi',
                data:rows
            })
        }
    })
});

router.post('/store', [
    body('nama_transmisi').notEmpty(),
],(req, res) => {
    const error = validationResult(req);
    if(!error.isEmpty()){
        return res.status(422).json({
            error: error.array()
        });
    }
    let Data = {
        nama_transmisi: req.body.nama_transmisi,
    }
    connection.query('insert into transmisi set ?', Data, function(err, rows){
        if(err){
            return res.status(500).json({
                status: false,
                message: 'Server Error',
            })
        }else{
            return res.status(201).json({
                status: true,
                message: 'Success..!',
                data: rows[0]
            })
        }
    })
})
router.get('/(:id)',function (req,res){
    let id = req.params.id;
    connection.query(`select *from transmisi where id_transmisi = ${id}`,function(err,rows){
        if(err){
            return res.status(500).json({
                status:false,
                message:'server error',
            })
        }
        if(rows.length <-0){
            return res.status(404).json({
                status:false,
                message:'not found',
            })
        }
        else{
            return res.status(200).json({
                status:true,
                message: 'data transmisi',
                data:rows[0]
            })
        }
    })
})
router.patch('/update/:id', [
    body('nama_transmisi').notEmpty(),
], (req, res) => {
    const error = validationResult(req);
    if(!error.isEmpty()){
        return res.status(422).json({
            error: error.array()
        });
    }
    let id = req.params.id;
    let Data = {
        nama_transmisi: req.body.nama_transmisi,
    }
    connection.query(`update transmisi set ? where id_transmisi = ${id}`, Data, function (err, rows) {
        if(err){
            return res.status(500).json({
                status: false,
                message: 'Server Error',
            })
        } else {
            return res.status(200).json({
                status: true,
                message: 'Update berhasil..!'
            })
        }
    })
})
router.delete('/delete/(:id)',function(req , res){
    let id = req.params.id;
    connection.query(`delete from transmisi where id_transmisi = ${id}`,function(err, rows){
        if(err){
            return res.status(500).json({
                status:false,
                message:'server eror',
            })
        }else{
            return res.status(200).json({
                status:true,
                message: 'data sudah dihapus',
            })
        }
    })
})

module.exports = router;