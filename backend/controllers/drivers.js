import fs from "fs";
import { db } from "../config/Database.js";

export const getDrivers = async (req, res) => {
  db.query("select * from chauffeur", (err, rows, fields) => {
    if (!err) {
      res.send(rows);
    } else {
      console.log(err);
    }
  });
};

export const addDriver = async (req, res) => {
  const numero_permis = req.body.numero_permis;
  const nom = req.body.nom;
  const prenom = req.body.prenom;
  const date_naissance = req.body.date_naissance;
  const lieu_naissance = req.body.lieu_naissance;
  const genre = req.body.genre;
  const date_recrutement = req.body.date_recrutement;
  const userID = req.body.userID;
  const categorie_permis = req.body.categorie_permis;
  const date_delivrance_pc = req.body.date_delivrance_pc;
  const date_expiration_pc = req.body.date_expiration_pc;
  const type_piece = req.body.type_piece;
  const numero_piece = req.body.numero_piece;
  const date_piece = req.body.date_piece;
  const adresse_chauffeur = req.body.adresse_chauffeur;
  const contact_chauffeur = req.body.contact_chauffeur;
  const nom_proche = req.body.nom_proche;
  const contact_proche = req.body.contact_proche;
  const driverImage = req.body.driverImage;
  const vehicule = req.body.vehicule;

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

  const createdDate =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();

  try {
    var sql = `INSERT INTO chauffeur(numero_permis, nom, prenom, date_naissance, lieu_naissance, genre, date_recrutement, categorie_permis, date_delivrance_pc, date_expiration_pc, type_piece, numero_piece, date_piece, adresse_chauffeur, contact_chauffeur, nom_proche, contact_proche, tutelle, driverImage, driverContrat, vehicule, userID, enregistrement) 
        VALUES("${req.body.numero_permis}", "${req.body.nom}","${req.body.prenom}", "${req.body.date_naissance}", "${req.body.lieu_naissance}", "${req.body.genre}", "${req.body.date_recrutement}", "${req.body.categorie_permis}", "${req.body.date_delivrance_pc}", "${req.body.date_expiration_pc}", "${req.body.type_piece}", "${req.body.numero_piece}", "${req.body.date_piece}", "${req.body.adresse_chauffeur}", "${req.body.contact_chauffeur}", "${req.body.nom_proche}", "${req.body.contact_proche}", "${req.body.tutelle}", "${req.body.driverImage}", "${req.body.driverContrat}", "${req.body.vehicule}", "${req.body.userID}", "${created_at}" )`;

    db.query(sql, (err, result) => {
      if (err)
        throw res.status(500).send({
          msg: err,
        });

      if (result)
        return res.status(200).send({
          msg: "Conducteur ajouté avec succès",
          code: 100,
        });
    });
  } catch (error) {
    return res.status(203).send({
      msg: "Impossible d'ajouter ce conducteur",
      code: 102,
    });
  }
};

export const getDriverID = (req, res) => {
  const numDriver = req.params.numDriver;

  //var sql = `SELECT vehicule.modele_vehicule, vehicule.type_vehicule, vehicule.marque, vehicule.energie, vehicule.etat, vehicule.cout_achat, vehicule.recette, vehicule.type_transport, vehicule.numero_chassis, vehicule.carte_grise, vehicule.enregistrement, vehicule.userID, vehicule.userID AS vehicule, mise_circulation_vehicule.vignette, AS mise_circulation_vehicule, depense.auteur AS depense FROM vehicule JOIN mise_circulation_vehicule ON vehicule.immatriculation= mise_circulation_vehicule.immatriculation JOIN depense ON mise_circulation_vehicule.immatriculation = depense.immatriculation`;
  var sql = "SELECT * FROM chauffeur WHERE numero_permis = ?";

  db.query(sql, [req.params.numDriver], (err, result) => {
    if (err) return res.json({ Message: "Error inside server" });
    return res.json(result);
  });
};

export const getDriverAvatar = (req, res) => {
  const numDriver = req.params.numAvatar;

  //var sql = `SELECT vehicule.modele_vehicule, vehicule.type_vehicule, vehicule.marque, vehicule.energie, vehicule.etat, vehicule.cout_achat, vehicule.recette, vehicule.type_transport, vehicule.numero_chassis, vehicule.carte_grise, vehicule.enregistrement, vehicule.userID, vehicule.userID AS vehicule, mise_circulation_vehicule.vignette, AS mise_circulation_vehicule, depense.auteur AS depense FROM vehicule JOIN mise_circulation_vehicule ON vehicule.immatriculation= mise_circulation_vehicule.immatriculation JOIN depense ON mise_circulation_vehicule.immatriculation = depense.immatriculation`;
  var sql = "SELECT * FROM chauffeur WHERE driverImage = ?";

  db.query(sql, [req.params.numAvatar], (err, result) => {
    if (err) return res.json({ Message: "Error inside server" });
    return res.json(result);
  });
};

export const editDriverAvatar = (req, res) => {
  const driverImage = req.body.driverImage;
  const oldImage = req.body.oldImage;
  const userID = req.body.userID;
  //console.log(driverImage, oldImage)
  db.query(
    "SELECT * FROM chauffeur where numero_permis = ?",
    [req.params.numDriver],
    function (error, result) {
      if (error)
        throw res.status(500).send({
          msg: error,
        });

      if (result) {
        const sql =
          "UPDATE chauffeur SET `driverImage` = ?, `userID` = ?  WHERE numero_permis=?";
        db.query(
          sql,
          [req.body.driverImage, req.body.userID, req.params.numDriver],
          (err, resultat) => {
            if (resultat.affectedRows == 1) {
              fs.unlinkSync(
                `../rmci-gestion/public/uploads/drivers/avatars/${req.body.oldImage}`,
                (err, resultats) => {
                  if (err) {
                    console.error(err);
                    return;
                  }

                  if (resultats) {
                    console.log(resultats);
                  }
                }
              );
              return res.status(200).send({
                msg: "Image modifiée avec succès",
                code: 100,
              });
            } else {
              return res.status(203).send({
                msg: "Impossible de modifier la photo ce conducteur",
                code: 101,
              });
            }
          }
        );
      } else {
        return res.status(203).send({
          msg: "Impossible de trouver ce conducteur",
          code: 102,
        });
      }

      /*const sql = 'UPDATE chauffeur SET `driverImage` = ?  WHERE numero_permis=?';
        db.query(sql, [req.body.driverImage,req.params.numDriver], (err, resultat) => {
          if (err) return res.json({Message: "Erreur à l’intérieur du serveur"});

          console.log(resultat)

          if (resultat.affectedRows == 1) {
          
            fs.unlinkSync(`../rmcigest/public/uploads/drivers/avatars/${req.body.oldImage}`, (err, result) => {
              if (err) {
                console.error(err);
                return;
              }
            
              console.log(result);
            });

            return res.status(200).send({
              msg: "Image modifiée avec succès",
              code: 100,
            });
          } else {
            return res.status(203).send({
              msg: "Conducteur inexistant",
              code: 102,
            });
          }
        });*/
    }
  );
};

export const removeDriverAvatar = (req, res) => {
  const fileName = req.params.numAvatar;
  const directoryPath =
    __basedir + "../../rmci-gestion/public/uploads/drivers/avatars";

  fs.unlink(directoryPath + fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Impossible de supprimer le fichier. " + err,
      });
    }

    res.status(200).send({
      message: "File is deleted.",
    });
  });
};

export const driverEdit = (req,res) => {
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

    const sql = 'UPDATE chauffeur SET `numero_permis` = ?, `nom` = ?, `prenom` = ?, `date_naissance` = ?, `lieu_naissance` = ?, `genre` = ?, `date_recrutement` = ?, `categorie_permis` = ?, `date_delivrance_pc` = ?, `date_expiration_pc` = ?, `type_piece` = ?, `numero_piece` = ?, `date_piece` = ?, `adresse_chauffeur` = ?, `contact_chauffeur` = ?, `nom_proche` = ?, `contact_proche` = ?, `tutelle` = ?, `driverImage` = ?, `driverContrat` = ?, `vehicule` = ?, `userID` = ?, `enregistrement` = ? WHERE numero_permis=?';
  db.query(sql, [req.body.numero_permis,req.body.nom,req.body.prenom,req.body.date_naissance,req.body.lieu_naissance,req.body.genre,req.body.date_recrutement,req.body.categorie_permis,req.body.date_delivrance_pc,req.body.date_expiration_pc,req.body.type_piece,req.body.numero_piece,req.body.date_piece,req.body.adresse_chauffeur,req.body.contact_chauffeur,req.body.nom_proche,req.body.contact_proche,req.body.tutelle,req.body.driverImage,req.body.driverContrat,req.body.vehicule,req.body.userID,req.body.enregistrement,req.params.numDriver], (err, resultat) => {
    if (err) 
      return res.json({Message: "Erreur à l’intérieur du serveur"});
      
      if (resultat.affectedRows == 1) {
        return res.status(200).send({
          msg: "Conducteur modifié avec succès",
          code: 100,
        });
      } else {
        return res.status(203).send({
          msg: "Erreur lors de la modification du conducteur",
          code: 101,
        });
      }
  });
}
