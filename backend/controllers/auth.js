import { db } from "../config/Database.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

dotenv.config();

const { user: User, role: Role, refreshToken: RefreshToken } = db;

const {
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_HOST,
  EMAIL_PORT,
  SECURE,
  SERVICE,
  JWT_EXPIRATION,
  JWT_REFRESH_EXPIRATION,
  JWT_ACCESS_TOKEN,
  JWT_REFRESH_TOKEN,
} = process.env;

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

export const verifyMail = async (req, res) => {
    const email = req.body.recipient_email;
  
    db.query(
      "SELECT * FROM users WHERE email=? limit 1",
      [email],
      function (error, result, fields) {
        if (error) {
          console.log(error.message);
        }
  
        if (result.length > 0) {
          db.query(
            `UPDATE users SET is_verified = 1 WHERE email = '${email}'`,
            (err, resultat) => {
              if (err) throw err;

              if (resultat) {
                return res.status(200).send({
                  msg: "Compte vérifié avec succès",
                  code: 100,
                });
              }
            }
          );
        } else {
          res.status(203).send({
            msg: "Erreur lors de la vérification de compte",
            code: 101,
          });
        }
      }
    );
  };
  
  export const resendOTP = async (req, res) => {
    const email = req.body.recipient_email;
    const otpsend = req.body.otpSend;
  
    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      function (err, result) {
        if (err) throw err;
        
        if (result.length > 0) {
          resendEmailVerify({
            recipient_email: email,
            otp: otpsend,
            administrateur: result[0].name,
          })
            .then((response) => res.send(response.message))
            .catch((error) => res.status(500).send(error.message));
        } else {
          res.status(500).send("Compte inexistant")
        }
      }
    );
  };
  
  export const resendPasswordOTP = async (req, res) => {
    const email = req.body.recipient_email;
    const otpsend = req.body.otpSend;
  
    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      function (err, result) {
        if (err) throw err;
        
        if (result.length > 0) {
          sendEmailVerify({
            recipient_email: email,
            otp: otpsend,
            administrateur: result[0].name,
          })
            .then((response) => res.send(response.message))
            .catch((error) => res.status(500).send(error.message));
        } else {
          res.status(500).send("Compte inexistant")
        }
      }
    );
  };
  
  export function resendEmailVerify({ recipient_email, otp, administrateur }) {
    return new Promise((resolve, reject) => {
      let mailSubject = "RMCI-GEST Activation";
      const mailOptions = {
        from: EMAIL_USER,
        to: recipient_email,
        subject: mailSubject,
        html: `<!doctype html>
          <html lang="en-US">
          
          <head>
            <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
            <title>Activation de compte</title>
            <meta name="description" content="Activation de compte.">
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
          return reject({ message: `Une erreur s’est produite` });
        }
        return resolve({ message: "Email envoyé avec succès" });
      });
    });
  }
  
  export function sendEmailVerifyBefore({ recipient_email, administrateur }) {
    return new Promise((resolve, reject) => {
      let mailSubject = "RMCI-GEST Activation";
      const mailOptions = {
        from: EMAIL_USER,
        to: recipient_email,
        subject: mailSubject,
        html: `<!doctype html>
        <html lang="en-US">
        
        <head>
          <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
          <title>Activation de compte</title>
          <meta name="description" content="Activation de compte.">
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
                                                  <p>Nous vous remercions d'avoir choisi RMCI-GEST pour l'ouverture de votre compte. <a href=${CLIENT_URL}>Veuillez cliquer sur içi</a> et suivre les instruction pour l'activation de votre compte.
                                              </p>
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
          return reject({ message: `Une erreur s’est produite` });
        }
        return resolve({ message: "Email envoyé avec succès" });
      });
    });
  }

  export const login = async (req,res) => {
    const { email, password } = req.body

    //console.log(email, password)

    try {
      //rechercher l'utilisateur
    let findUserQuery = "SELECT * FROM users WHERE email = ?";
    db.query(findUserQuery, [email], (err, data) => {
        if (err) throw err;

        // Utilisateur non trouvé
        if (data.length == 0) {
          return res.status(201).send({ 
            message: 'Mauvais nom utilisateur ou mot de passe',
            code: 101
          })
        }

        // Compte Utilisateur non vérifié
        if (data[0].is_verified !== 1) {
          return res.status(201).send({ 
            message: 'Compte utilisateur non vérifié !',
            code: 102
          })
        }

        const checkPassword = bcrypt.compareSync(
          password,
          data[0].password
        );

        if (!checkPassword) {
          return res.status(201).send({ 
            message: 'Mauvais mot de passe ou nom utilisateur',
            code: 103
          })
        }

        // Génération du token et envoi
      const token = jwt.sign({
        id: data[0].userID,
        role: data[0].role,
        tutelle: data[0].tutelle,
        name: data[0].name,
        telephone: data[0].telephone,
        email: data[0].email,
        userImage: data[0].image,
      }, JWT_ACCESS_TOKEN, { expiresIn: "1h"});

      return res.status(200).send({
        access_token: token,
        message: "Utilisateur authtifié avec succès",
        code: 100,
      });

      //console.log(data[0].email)
    })
    } catch (err) {
      return res.status(200).send({ 
        access_token: token,
        message: 'Échec du processus d’ouverture de session', error: err,
        code: 104
      })
    }
      
  }
   
  export const recoveryEmail = async (req, res) => {
    const email = req.body.recipient_email;
    const otpsend = req.body.otpSend;
  
    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      function (err, result) {
        if (err) throw err;
        
        if (result.length > 0 && result[0].is_verified == 0) {
          resendEmailVerify({
            recipient_email: email,
            otp: otpsend,
            administrateur: result[0].name,
          })
          
          return res.status(200).send({
            msg: "Email vérifié avec succès",
            code: 100,
          });
        } else if (result.length > 0 && result[0].is_verified == 1) {
          return res.status(203).send({
            msg: "Compte déjà vérifié",
            code: 101,
          });
        } else {
          res.status(203).send({
            msg: "Aucun compte correspondant",
            code: 102,
          });
        }
      }
    );
  };
  export const resetEmailPassword = async (req, res) => {
    const email = req.body.recipient_email;
    const otpsend = req.body.otpSend;
  
    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      function (err, result) {
        if (err) throw err;
        
        if (result.length > 0) {
          sendEmailVerify({
            recipient_email: email,
            otp: otpsend,
            administrateur: result[0].name,
          })
          
          return res.status(200).send({
            msg: "Email vérifié avec succès",
            code: 100,
          });
        } else {
          res.status(203).send({
            msg: "Aucun compte correspondant",
            code: 102,
          });
        }
      }
    );
  };
  export function sendEmailVerify({ recipient_email, otp, administrateur }) {
    return new Promise((resolve, reject) => {
      let mailSubject = "RMCI-GEST Récuperation de compte";
      const mailOptions = {
        from: EMAIL_USER,
        to: recipient_email,
        subject: mailSubject,
        html: `<!doctype html>
        <html lang="en-US">
        
        <head>
          <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
          <title>Récuperation de compte</title>
          <meta name="description" content="Récupération de compte.">
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
                                              <h1 style="color:#2a2185; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">Récupération de compte RMCI-GEST</h1>
                                              <span
                                                  style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                              <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                                  Bonjour ${administrateur}, </p>
                                                  <p>Nous vous remercions d'avoir choisi RMCIGEST. Vous souhaitez reinitialiser votre compte, veuillez utiliser le code OTP suivant et suivez les instructions pour recupérer votre compte. Ce code OTP est valide pendant 1 minute
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
          return reject({ message: `An error has occured` });
        }
        return resolve({ message: "Email sent succesfuly" });
      });
    });
  }

  export const updatePassword = async (req, res) => {
    const email = req.body.email;
    req.body.newPassword;

    const saltRounds = 10;


    const password = bcrypt.hashSync(req.body.newPassword, saltRounds);

    

    if (!req.body.email) {
      return res.status(203).send({
        msg: "Absence d'email veuillez reéssayer",
        code: 101,
      });
    }


    try {
      db.query(
        "SELECT * FROM users WHERE email = ?",
        [req.body.email],
        (err,result) => {
          if (err) throw err;

          if (result.length == 0) {
            return res.status(203).send({
              msg: "Compte inexistant",
              code: 102,
            });
          }

          
  
        if (result.length > 0) {
          db.query(
            `UPDATE users SET password = '${password}' WHERE email = '${email}'`,
            (err, resultat) => {
              if (err) throw err;

              if (resultat) {
                return res.status(200).send({
                  msg: "Compte réinitalisé avec succès. Veuillez vous connecter",
                  code: 100,
                });
              }
            }
          );
        } else {
          res.status(203).send({
            msg: "Erreur lors de la reinitialisation du compte",
            code: 103,
          });
        }

        }
      )
    } catch (error) {
      
    }
  }
  
  export const logger = async (req, res, next) => {
    const event = new Date();
    console.log("AUTH Time:", event.toString());
    next();
  };


  

  

  
  