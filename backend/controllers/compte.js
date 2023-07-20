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

export function sendEmailVerify({ recipient_email, otp, administrateur }) {
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
                                                  <p>Nous vous remercions d'avoir choisi RMCIGEST pour l'ouverture de votre compte. Veuillez utiliser le code OTP suivant pour terminer votre procédure de de création de compte. ce code OTP est valide pendant 1 minute
                                              </p>
                                              <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
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

export const create = async (req, res) => {
  const company = req.body.company;
  const nom_admin = req.body.nom_admin;
  const type_compte = req.body.type_compte;
  const contact = req.body.contact;
  const telephone = req.body.telephone;
  const email = req.body.email;
  const pass = req.body.password;
  const otpSend = req.body.otpSend;

  const password = bcrypt.hashSync(req.body.password, saltRounds);

  if (pass.length < 8) {
    return res.status(203).send({
      msg: "Le mot de passe doit comporter au moins 8 caractères.",
      code: 101,
    });
  }

  try {
    //Il s’agit de vérifier si le nom d’utilisateur est déjà enregistré.
    db.query(
      "SELECT * FROM comptes WHERE email = ?",
      [req.body.email],
      (err, result) => {
        if (err) throw err;

        // Email trouvé dans admin
        if (result.length > 0) {
          return res.status(203).send({
            msg: "Cet email est utilisé par un administrateur",
            code: 101,
          });
        }

        // Email non trouvé
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
                  "INSERT INTO comptes(`compteID`, `raison_sociale`, `administrateur`, `type_compte`, `contact`, `email`, `status`, `createdAt`, `updatedAt`, `entete`, `pied`, `logo`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
                  [
                    compteID,
                    company,
                    nom_admin,
                    type_compte,
                    contact,
                    email,
                    "0",
                    created_at,
                    "",
                    "",
                    "",
                    "",
                  ],
                  (err, resultat) => {
                    if (err) throw err;

                    if (resultat.affectedRows > 0) {
                      db.query(
                        "INSERT INTO users(`userID`, `tutelle`, `name`, `telephone`, `email`, `password`, `status`, `image`, `role`, `is_verified`, `createdAt`, `updatedAt`, `loginAt`, `token`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                        [
                          userID,
                          compteID,
                          nom_admin,
                          telephone,
                          email,
                          password,
                          "1",
                          "",
                          "Administrateur",
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
                              code: 103
                            });
                          } else if (err) {
                            res.status(500).send({
                              msg: err,
                              code: 104
                            });
                          } else {
                            sendEmailVerify({
                              recipient_email: email,
                              otp: otpSend,
                              administrateur: nom_admin,
                            });
  
                            res.status(200).send({
                              msg: "Compte créé avec succès",
                              code: 100,
                            });
                          }
                        }
                      );
                    } else {
                      res.status(203).send({
                        msg: "Erreur lors de la création de compte",
                        code: 105,
                      });
                    }

                  }
                )
              }
            }
          );
        }
      }
    );
  } catch (error) {}
};

export const verifyMail = async (req, res) => {
  const email = req.body.recipient_email;

  db.query(
    "SELECT * FROM users where email=? limit 1",
    [email],
    function (error, result, fields) {
      if (error) {
        console.log(error.message);
      }

      if (result.length > 0) {
        db.query(`
        UPDATE users SET is_verified = 1, token='' WHERE email = '${email}'
        `);
        console.log(result[0].email);
      } else {
      }
    }
  );
};
