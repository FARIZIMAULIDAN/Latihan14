const express = require('express');
const router = express.Router();
const {body, validationResult} = require('express-validator')
const connection = require('../config/db');
const fs = require('fs')
const multer = require('multer')
const path = require('path');
const { error } = require('console');

const storage = multer.diskStorage({
    destination:(req , file, cb)=>{
        cb(null,'public/image')
    },
    filename:(req ,file,cb)=>{
        cb(null, Date.now() + path.extname(file.originalname))
    },
})
const fileFilter = (req,file,cb) =>{
    // mengecek jenis file
    if(file.mimetype === 'image/png'){
        cb(null,true); 
    }else{
        cb(new Error('Jenis file tidak diizinkan'),false);
    }
};
const upload = multer({storage:storage,fileFilter:fileFilter})

router.get('/',function(req,res){
    connection.query('SELECT kendaraan.no_pol,kendaraan.nama_kendaraan,transmisi.nama_transmisi,kendaraan.gambar_kendaraan '+'from kendaraan join transmisi '+'ON kendaraan.id_transmisi =transmisi.id_transmisi order by kendaraan.no_pol desc',function(err, rows){
        if(err){
            return res.status(500).json({
                status:false,
                message: 'server failed',
                error:err,
            })
        }else{
            return res.status(200).json({
                status:true,
                message:'data mahasiswa',
                data:rows
            })
        }
    })
});

router.post('/store',upload.single("gambar_kendaraan"), [
    //validation
    body('no_pol').notEmpty(),
    body('nama_kendaraan').notEmpty(),
    body('id_transmisi').notEmpty(),
],(req, res) => {
    const error = validationResult(req);
    if(!error.isEmpty()){
        return res.status(422).json({
            error: error.array()
        });
    }
    let Data = {
        no_pol: req.body.no_pol,
        nama_kendaraan: req.body.nama_kendaraan,
        id_transmisi: req.body.id_transmisi,
        gambar_kendaraan: req.file.filename
    }
    connection.query('insert into kendaraan set ?', Data, function(err, rows){
        if(err){
            return res.status(500).json({
                status: false,
                message: 'Server Error',
                error:err,
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
router.get('/(:no_pol)', function (req, res){
    let no_pol = req.params.no_pol;
    connection.query(`select a.no_pol as no_polisi, a.nama_kendaraan as kendaraan, a.gambar_kendaraan as gambar_kendaraan ,b.id_transmisi as transmisi from kendaraan a join transmisi b on b.id_transmisi=a.id_transmisi where no_pol='${no_pol}'`, function (err, rows){
        if(err){
            return res.status(500).json({
                status: false,
                message: 'Server Error',
            })
        }if(rows.length <=0){
            return res.status(404).json({
                status: false,
                message: 'Not Found',
            })
        }else{
            return res.status(200).json({
                status: true,
                message: 'Data kendaraan',
                data: rows[0]
            })
        }
    })
})
router.patch("/update/:no_pol", upload.single("gambar_kendaraan"), (req, res) => {
    const no_pol = req.params.no_pol;
    const { nama_kendaraan, id_transmisi } = req.body;
    let gambar_kendaraan = req.file ? req.file.filename : null;
  
    // Pastikan data yang akan diupdate valid
    if (!nama_kendaraan || !id_transmisi) {
      return res.status(400).json({
        status: false,
        message: "Nama Kendaraan dan ID Transmisi harus diisi",
      });
    }
    connection.query(
      "UPDATE kendaraan SET nama_kendaraan = ?, id_transmisi = ?, gambar_kendaraan = ? WHERE no_pol = ?",
      [nama_kendaraan, id_transmisi, gambar_kendaraan, no_pol],
      (err, result) => {
        if (err) {
          return res.status(500).json({
            status: false,
            message: "Server Error",
          });
        }
  
        if (result.affectedRows === 0) {
          return res.status(404).json({
            status: false,
            message: "Kendaraan not found",
          });
        } else {
          return res.status(200).json({
            status: true,
            message: "update berhasil",
          });
        }
      }
    );
  });
router.delete('/delete/(:id)',function(req , res){
    let id = req.params.id;
    connection.query(`select *from kendaraan where no_pol='${id}'`,function(err,rows) {
        if(err){
            return res.status(500).json({
                status:false,
                message:'server error',
                error:err,
            })
        }
        if(rows.length === 0){
            return res.status(404).json({
                status:false,
                message:'not found',
            })
        }
        const namaFileLama = rows[0].gambar_kendaraan;
        
        // hapus file lama jika tidak ada
        if(namaFileLama){
            const pathFileLama = path.join(__dirname,'../public/image',namaFileLama);
            fs.unlinkSync(pathFileLama);
        }
        connection.query(`delete from kendaraan where no_pol='${id}'`,function(err, rows){
            if(err){
                return res.status(500).json({
                    status:false,
                    message:'server eror',
                    error:err,
                })
            }else{
                return res.status(200).json({
                    status:true,
                    message: 'data sudah dihapus',
                })
            }
        })
    })
})
module.exports = router;