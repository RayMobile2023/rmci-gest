import { db } from "../config/Database.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const {
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_HOST,
  EMAIL_PORT,
  SECURE,
  SERVICE,
  JWT_SECRET,
  JWT_EXPIRES_IN,
} = process.env;

const saltRounds = 10;

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: SECURE,
  requireTLS: true,
  service: SERVICE,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
  tls: {
    ciphers: "SSLv3",
  },
});

const compteID = Math.floor(Math.random() * 9000000000) + 1000000000;
const userID = Math.floor(Math.random() * 900000000) + 100000000;
var today = new Date();
const created_at =
  today.getFullYear() +
  "-" +
  (today.getMonth() + 1) +
  "-" +
  today.getDate() +
  " " +
  today.getHours() +
  ":" +
  today.getMinutes() +
  ":" +
  today.getSeconds();

export function sendEmailVerify({ recipient_email, administrateur }) {
  let mailSubject = "RMCI-GEST Activation";
  const mailOptions = {
    from: EMAIL_USER,
    to: recipient_email,
    subject: mailSubject,
    html: `<!doctype html>
        <html lang="en-US">
        
        <head>
          <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
          <title>Vérification de compte</title>
          <meta name="description" content="Vérification de compte.">
          <style type="text/css">
              a:hover {text-decoration: underline !important;}
          </style>
        </head>
        
        <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
          <!--100% body table-->
          <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
              style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
              <tr>
                  <td>
                      <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                          align="center" cellpadding="0" cellspacing="0">
                          
                          <tr>
                              <td>
                                  <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                      style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                      <tr>
                                          <td style="height:40px;">&nbsp;</td>
                                      </tr>
                                      <tr>
                                          <td style="padding:0 35px;">
                                              <h1 style="color:#2a2185; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">Activation de compte RMCI-GEST</h1>
                                              <span
                                                  style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                              <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                                  Bonjour ${administrateur}, </p>
                                                  <p>Un compte a été créé avec votre email. Veuillez utiliser cette adresse email pour recevoir le code d'activation de votre compte et suivre les instruction.
                                              </p>
                                              <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;"></h2>
                                              <p style="font-size:0.9em;">Cordialement,<br />Dev-Pack's SARL</p>
                                              <hr style="border:none;border-top:1px solid #eee" />
                                              <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                                                <p>Dev-Pack's SARL</p>
                                                <p>Cocody angré mahou</p>
                                                <p>Abidjan, Côte d'Ivoire</p>
                                              </div>
                                          </td>
                                      </tr>
                                      <tr>
                                          <td style="height:40px;">&nbsp;</td>
                                      </tr>
                                  </table>
                              </td>
                         
                      </table>
                  </td>
              </tr>
          </table>
          <!--/100% body table-->
        </body>
        
        </html>`,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      //console.log(info);
    }
  });
}

export const createUser = async (req, res) => {
  try {
    db.query(
      "SELECT * FROM comptes WHERE email = ?",
      [req.body.email],
      (err, result) => {
        if (err) throw err;

        if (result.length > 0) {
          return res.status(203).send({
            msg: "Cet email est utilisé par un administrateur",
            code: 101,
          });
        }

        if (result.length == 0) {
          db.query(
            "SELECT * FROM users WHERE email = ?",
            [req.body.email],
            (err, results) => {
              if (err) throw err;

              // Email trouvé dans utilisateur
              if (results.length > 0) {
                return res.status(203).send({
                  msg: "Cet email est utilisé par un utilisateur",
                  code: 102,
                });
              }


          if (results.length == 0) {
            db.query(
              "INSERT INTO users(`userID`, `tutelle`, `name`, `telephone`, `email`, `password`, `status`, `image`, `role`, `is_verified`, `createdAt`, `updatedAt`, `loginAt`, `token`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
              [
                userID,
                req.body.tutelle,
                req.body.name,
                req.body.telephone,
                req.body.email,
                "",
                "1",
                "",
                req.body.role,
                0,
                created_at,
                "",
                "",
                "",
              ],
              function (error, response) {
                if (error) {
                  res.status(500).send({
                    msg: error,
                    code: 103,
                  });
                } else if (err) {
                  res.status(500).send({
                    msg: err,
                    code: 104,
                  });
                } else {
                  sendEmailVerify({
                    recipient_email: req.body.email,
                    administrateur: req.body.name,
                  });

                  res.status(200).send({
                    msg: "Compte utilisateur créé avec succès",
                    code: 100,
                  });
                }
              }
            );
          }

            }
          );
        }
      }
    );
  } catch (error) {}
};

export const getAllUsers = async (req, res) => {
  db.query(
    "select * from users",
    (err, rows, fields) => {
      if (!err) {
        res.send(rows);
      } else {
        console.log(err);
      }
    }
  );
}

export const getUserID = (req, res) => {
  var sql =
    "SELECT * FROM users WHERE userID = ?";

  db.query(sql, [req.params.userID], (err, result) => {
    if (err) return res.json({ Message: "Error inside server" });
    return res.json(result);
  });
};


export const editUser = async (req, res) => {
var today = new Date();
const created_at =
  today.getFullYear() +
  "-" +
  (today.getMonth() + 1) +
  "-" +
  today.getDate() +
  " " +
  today.getHours() +
  ":" +
  today.getMinutes() +
  ":" +
  today.getSeconds();
  
  var sql = "SELECT * FROM users WHERE userID = ?";

  db.query(sql, [req.params.userID], (err, result) => {
    if (err) return res.json({ Message: "Error inside server" });

    
    if (result.length == 1) {

      if (result[0].email == req.body.email) {
      const sqlEdit =
        "UPDATE users SET `userID` = ?, `tutelle` = ?, `name` = ?, `telephone` = ?, `email` = ?, `password` = ?, `status` = ?, `image` = ?, `role` = ?, `is_verified` = ?, `createdAt` = ?, `updatedAt` = ?, `loginAt` = ?, `token` = ? WHERE userID=?";
      db.query(
        sqlEdit,
        [
          result[0].userID,
          result[0].tutelle,
          req.body.name,
          req.body.telephone,
          req.body.email,
          result[0].password,
          result[0].status,
          result[0].image,
          req.body.role,
          result[0].is_verified,
          result[0].createdAt,
          created_at,
          result[0].loginAt,
          result[0].token,
          req.params.userID
        ],
        (error, resultat) => {
          if (error) return res.json({ Message: "Error inside server" });

          if (resultat) {
            return res.status(200).send({
              msg: "Utilisateur modifié avec succès",
              code: 100,
            });
          } else {
            return res.status(203).send({
              msg: "Erreur lors de la modification de l'utilisateur'",
              code: 101,
            });
          }
        }
      );
      }

      if (result[0].email != req.body.email) {
        const sqlEdit =
          "UPDATE users SET `userID` = ?, `tutelle` = ?, `name` = ?, `telephone` = ?, `email` = ?, `password` = ?, `status` = ?, `image` = ?, `role` = ?, `is_verified` = ?, `createdAt` = ?, `updatedAt` = ?, `loginAt` = ?, `token` = ? WHERE userID=?";
        db.query(
          sqlEdit,
          [
            result[0].userID,
            result[0].tutelle,
            req.body.name,
            req.body.telephone,
            req.body.email,
            result[0].password,
            result[0].status,
            result[0].image,
            req.body.role,
            0,
            result[0].createdAt,
            created_at,
            result[0].loginAt,
            result[0].token,
            req.params.userID
          ],
          (error, resultat) => {
            if (error) return res.json({ Message: "Error inside server" });

            if (resultat) {
              return res.status(200).send({
                msg: "Utilisateur modifié avec succès",
                code: 102,
              });
            } else {
              return res.status(203).send({
                msg: "Erreur lors de la modification de l'utilisateur'",
                code: 101,
              });
            }
          }
        );
      }
    } else {
      
    }
  });
  
  
};