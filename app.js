const express = require("express");
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = express();
const cors = require("cors");

const PORT = process.env.PORT || 3200;
app.use(express.json());
app.use(cors());
const con = mysql.createConnection({
  host: "usm-assignment.cdago4lyeyfl.us-east-2.rds.amazonaws.com",
  port: "3306",
  user: "admin",
  password: "sivatejan",
  database: "USM_ASSIGNMENT",
});

app.get("", (req, res, next) => {
  res.status(200).send({});
});

app.post("/login", async (req, res, next) => {
  console.log(req.body);
  let { userEmail, userPassword } = req.body;
    mailCheckPromise(userEmail).then(async (mailResult) => {
        let foundMails = JSON.parse(JSON.stringify(mailResult));
        if (foundMails.length > 0) {
            console.log(foundMails[0]["user_password"]);
            console.log(await bcrypt.hash(userPassword, 10));
            if (await bcrypt.compare(userPassword, foundMails[0]["user_password"])) {
              const id = foundMails[0]["user_id"];
              const token = jwt.sign({id}, "bearer");
                res.status(200).send({message: "Successfull"});
            } else  {
                res.status(412).send({message: "Wrong Paassword!!!"})
            }
        } else {
            res.status(400).send({message: "No mail found!!! Please signup"});
        }
    }).catch(() => {
        res.status(500).send({message: "Please try again after some time...."})
    })
});

app.post("/register", async (req, res, next) => {
  let {
    userName,
    userEmail,
    userPassword,
    userdob,
    gender,
    phno,
    userDesignation,
  } = req.body;

  mailCheckPromise(userEmail).then(
    (mailResults) => {
      console.log("mail Results", mailResults);
      if (mailResults.length === 0) {
        getUsersCountPromise()
          .then((usersCount) => {
            console.log("Promise result", usersCount);
            let hashedPassword = bcrypt.hash(userPassword, 10);
            con.query(
              `insert into user_details (user_id, user_name, user_password, user_email, user_dob, user_phno, user_gender, user_Designation) values (${
                usersCount + 1
              },'${userName}','${hashedPassword}','${userEmail}','${userdob}',${phno},'${gender}',${userDesignation})`,
              (error, results) => {
                  if (error) res.status(500).send({message: "Please try again after some time", error});
                  res.send({message: "Successfull"})
              }
            );
          })
          .catch(() => {
            res.status(500).send({
              message: "Found some glitch!!!! Please try after some time",
            });
          });
      } else {
        res.status(202).send({ message: "Found your mail!!! Please login" });
      }
    },
    () => {
      res
        .status(500)
        .send({ message: "Found some glitch!!!! Please try after some time" });
    }
  );

});

const mailCheckPromise = (userEmail) => {
  return new Promise((resolve, reject) => {
    con.query(
      `select * from user_details where user_email = '${userEmail}'`,
      (error, results) => {
        if (error) reject();
        else resolve(results);
      }
    );
  });
};

const getUsersCountPromise = () => {
  return new Promise((resolve, reject) => {
    con.query(
      "select max(user_id) as user_count from user_details",
      (error, results) => {
        if (error) reject();
        else resolve(JSON.parse(JSON.stringify(results))[0]["user_count"]);
      }
    );
  });
};

app.get("/userdesignations", (req, res, next) => {
  let userDesignations;
  con.query("select * from user_designations", (error, results) => {
    userDesignations = JSON.parse(JSON.stringify(results));
    res.json({ userDesignations });
  });
});

con.connect((error) => {
  if (error) {
    console.log("Error");
  } else {
    app.listen(PORT);
  }
});
