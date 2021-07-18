const express = require("express");
const PORT = process.env.PORT || 3200;
const app = express();



app.get("", (req, res, next) => {
    res.status(200).json({message: "Successfull"});
})


app.listen(PORT);