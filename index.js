const express = require('express')
const app = express()
const port = 3000

const bodyPs = require('body-parser');
app.use(bodyPs.urlencoded({extended: false}));
app.use(bodyPs.json()); 


const transmisirouter = require('./routes/transmisi');
app.use('/api/trans',transmisirouter);
const kendaraaanrouter = require('./routes/kendaraan');
app.use('/api/kndr',kendaraaanrouter);


app.listen(port,()=>{
    console.log(`aplikasi berjalan di http:://localhost:${port}`)
})