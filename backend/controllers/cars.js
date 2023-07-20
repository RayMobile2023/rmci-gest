import fs from "fs";
import { db } from "../config/Database.js";

export const getCars = async (req, res) => {
  db.query("select * from vehicule", (err, rows, fields) => {
    if (!err) {
      res.send(rows);
    } else {
      console.log(err);
    }
  });
};


export const addCars = async (req, res) => {
  const immatriculation = req.body.immatriculation;
  const modele_vehicule = req.body.modele_vehicule;
  const type_vehicule = req.body.type_vehicule;
  const marque = req.body.marque;
  const energie = req.body.energie;
  const etat = req.body.etat;
  const cout_achat = req.body.cout_achat;
  const userID = req.body.user;
  const carImage = req.body.carImage;
  const vignette = req.body.vignette;
  const patente = req.body.patente;
  const carte_transport = req.body.carte_transport;
  const carte_station = req.body.carte_station;
  const type_transport = req.body.type_transport;
  const recette = req.body.recette;
  const assurance = req.body.assurance;
  const carte_grise = req.body.carte_grise;
  const end_time = req.body.end_time;
  const stop_time = req.body.stop_time;
  const numero_chassis = req.body.numero_chassis;
  const date_mise_circulation = req.body.date_circulation;
  const quantite_energie = req.body.quantite_energie;
  const montant_litre_energie = req.body.montant_litre_energie;
  const montant_plein_carburant = (Number(montant_litre_energie) * Number(quantite_energie));
  const montant_maintenance = req.body.montant_maintenance;
  const montant_depense = (Number(vignette) + Number(patente) + Number(carte_transport) + Number(carte_station) + Number(assurance) + Number(montant_plein_carburant) + Number(montant_maintenance) + Number(cout_achat));

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
    var sql = `INSERT INTO vehicule(immatriculation, modele_vehicule, type_vehicule, marque, energie, etat, cout_achat, recette, type_transport, numero_chassis, carte_grise, end_time, stop_time, enregistrement, userID, carImage) 
    VALUES("${immatriculation}", "${modele_vehicule}","${type_vehicule}", "${marque}", "${energie}", "${etat}", "${cout_achat}", "${recette}", "${type_transport}", "${numero_chassis}", "${carte_grise}", "${end_time}", "${stop_time}", "${created_at}", "${userID}", "${carImage}" )`;
    db.query(sql, (err, result) => {
      if (err)
      return res.status(500).json(err);

      if (result.affectedRows > 0) {
        db.query(
          "SELECT * FROM vehicule WHERE immatriculation = ?",
          [req.body.immatriculation],
          function (err, resultat) {
            if (err)
            return res.status(500).json(err);

            if (resultat.length > 0) {
              const q =
                "INSERT INTO mise_circulation_vehicule (`immatriculation`,`vignette`,`patente`,`carte_transport`,`carte_station`,`assurance`,`quantite_energie`,`montant_plein_carburant`,`montant_litre_energie`,`montant_maintenance`,`date_mise_circulation`,`userID`) VALUE (?)";
              const values = [
                immatriculation,
                vignette,
                patente,
                carte_transport,
                carte_station,
                assurance,
                quantite_energie,
                montant_plein_carburant,
                montant_litre_energie,
                montant_maintenance,
                date_mise_circulation,
                userID,
              ];
              db.query(q, [values], (err, data) => {
                if (err) return res.status(500).json(err);

                if (data.affectedRows > 0) {
                  const query =
                    "INSERT INTO depense (`auteur`,`motif_depense`,`date_depense`,`montant_depense`,`id_type_depense`,`enregistrement`,`userID`) VALUE (?)";
                  const values = [
                    immatriculation,
                    `Mise en circulation du ${immatriculation}`,
                    createdDate,
                    montant_depense,
                    "CHARGE ENTREPRISE",
                    created_at,
                    userID,
                  ];
                  db.query(query, [values], (err, resultats) => {
                    if (err) return res.status(500).json(err); 

                    if (resultats)
                      return res.json({
                        Status: "Success",
                      });
                  });
                } else {
                  return res.status(500).json(err);
                }
              });
            } else {
              return res.status(500).json(err);
            }
          }
        );
      } else {
        return res.status(500).json(err);
      }
    });
  } catch (error) {
    console.log(error);
  }
};


export const getCarsID = (req, res) => {
  const vehiculeId = req.params.vehiculeId;

  //var sql = `SELECT vehicule.modele_vehicule, vehicule.type_vehicule, vehicule.marque, vehicule.energie, vehicule.etat, vehicule.cout_achat, vehicule.recette, vehicule.type_transport, vehicule.numero_chassis, vehicule.carte_grise, vehicule.enregistrement, vehicule.userID, vehicule.userID AS vehicule, mise_circulation_vehicule.vignette, AS mise_circulation_vehicule, depense.auteur AS depense FROM vehicule JOIN mise_circulation_vehicule ON vehicule.immatriculation= mise_circulation_vehicule.immatriculation JOIN depense ON mise_circulation_vehicule.immatriculation = depense.immatriculation`;
  var sql = "SELECT * FROM `vehicule` INNER JOIN `mise_circulation_vehicule` ON `vehicule`.`immatriculation`=`mise_circulation_vehicule`.`immatriculation` WHERE `vehicule`.`immatriculation` = ?";

  db.query(sql, [req.params.vehiculeId], (err, result) => {
    if(err) return res.json({Message: "Error inside server"});
    return res.json(result);
  });
  
}

export const editCars = async (req, res) => {
  const vehiculeId = req.params.vehiculeId;
  const immatriculation = req.body.immatriculation;
  const modele_vehicule = req.body.modele_vehicule;
  const type_vehicule = req.body.type_vehicule;
  const marque = req.body.marque;
  const energie = req.body.energie;
  const etat = req.body.etat;
  const cout_achat = req.body.cout_achat;
  const userID = req.body.userID;
  const carImage = req.body.carImage;
  const vignette = req.body.vignette;
  const patente = req.body.patente;
  const carte_transport = req.body.carte_transport;
  const carte_station = req.body.carte_station;
  const type_transport = req.body.type_transport;
  const recette = req.body.recette;
  const assurance = req.body.assurance;
  const carte_grise = req.body.carte_grise;
  const numero_chassis = req.body.numero_chassis;
  const date_mise_circulation = req.body.date_circulation;
  const enregistrement = req.body.enregistrement;
  const quantite_energie = req.body.quantite_energie;
  const montant_litre_energie = req.body.montant_litre_energie;
  const montant_plein_carburant = (Number(montant_litre_energie) * Number(quantite_energie));
  const montant_maintenance = req.body.montant_maintenance;
  const montant_depense = (Number(vignette) + Number(patente) + Number(carte_transport) + Number(carte_station) + Number(assurance) + Number(montant_plein_carburant) + Number(montant_maintenance));
  

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
  

  const sql = 'UPDATE vehicule SET `immatriculation` = ?, `modele_vehicule` = ?, `type_vehicule` = ?, `marque` = ?, `energie` = ?, `etat` = ?, `cout_achat` = ?, `recette` = ?, `type_transport` = ?, `numero_chassis` = ?, `carte_grise` = ?, `end_time` = ?, `stop_time` = ?, `enregistrement` = ?, `userID` = ?, `carImage` = ? WHERE immatriculation=?';
  db.query(sql, [req.body.immatriculation,req.body.modele_vehicule,req.body.type_vehicule,req.body.marque,req.body.energie,req.body.etat,req.body.cout_achat,req.body.recette,req.body.type_transport,req.body.numero_chassis,req.body.carte_grise,req.body.end_time,req.body.stop_time,req.body.enregistrement,req.body.userID,req.body.carImage,req.params.vehiculeId], (err, resultat) => {
    if (err) 
      return res.json({Message: "Erreur à l’intérieur du serveur"});
      
    
      if (resultat.affectedRows == 1) {
        const sqlCirculation = 'UPDATE mise_circulation_vehicule SET `immatriculation` = ?, `vignette` = ?, `patente` = ?, `carte_transport` = ?, `carte_station` = ?, `assurance` = ?, `quantite_energie` = ?, `montant_plein_carburant` = ?, `montant_litre_energie` = ?, `montant_maintenance` = ?, `date_mise_circulation` = ?, `userID` = ? WHERE immatriculation=?';
        db.query(sqlCirculation, [req.body.immatriculation,req.body.vignette,req.body.patente,req.body.carte_transport,req.body.carte_station,req.body.assurance,req.body.quantite_energie,montant_plein_carburant,req.body.montant_litre_energie,req.body.montant_maintenance,req.body.date_circulation,req.body.userID,req.params.vehiculeId], (error, result) => {
          if (error) return res.json({Message: "Erreur à l’intérieur du serveur"});
          

          if (result.affectedRows == 1) {
            const sqlDepense = 'UPDATE depense SET `auteur` = ?, `motif_depense` = ?, `date_depense` = ?, `montant_depense` = ?, `id_type_depense` = ?, `enregistrement` = ?, `userID` = ? WHERE auteur=?';
            db.query(sqlDepense, [req.body.immatriculation,`Mise en circulation du ${req.body.immatriculation}`,createdDate, montant_depense, "CHARGE ENTREPRISE", req.body.enregistrement, req.body.userID,req.params.vehiculeId], (errors, resultats) => {
              if (errors) return res.json({Message: "Erreur à l’intérieur du serveur"});
              
              if (resultats.affectedRows == 1) {
                return res.status(200).send({
                  msg: "Véhicule modifié avec succès",
                  code: 100,
                });
              } else {
                return res.status(203).send({
                  msg: "Erreur lors de la modification de la mise en circultation",
                  code: 101,
                });
              }
            })
          } else {
            return res.status(203).send({
              msg: "Erreur lors de la modification de la mise en circultation",
              code: 102,
            });
          }
          
        })
      } else {
        return res.status(203).send({
          msg: "Erreur lors de la modification du véhicule",
          code: 103,
        });
      }
  });
};


export const deleteCarsID = (req, res) => {
  const vehiculeId = req.params.vehiculeId;

  const q = " DELETE FROM vehicule WHERE immatriculation = ? ";

  db.query(q, [req.params.vehiculeId], (err, result) => {
    if (err) return res.send(err);
    if (result.affectedRows == 1) {
      const sql = " DELETE FROM mise_circulation_vehicule WHERE immatriculation = ? ";

      db.query(sql, [vehiculeId], (error, results) => {
        if (error) return res.send(error);

        if (results.affectedRows == 1) {
          const sqls = " DELETE FROM depense WHERE auteur = ? ";

          db.query(sqls, [vehiculeId], (errors, resultat) => {
            if (error) return res.send(errors);
            if (resultat.affectedRows == 1) {
              return res.status(200).send({
                msg: 'Véhicule supprimé avec succès',
                code: 105,
              });
            } else {
              return res.status(200).send({
                msg: 'Véhicule supprimé avec succès',
                code: 104,
              });
            }
          })
        } else {
          res.status(203).send({
            msg: 'Aucune information de mise en circulation!',
            code: 103,
          });
        }
      })
    } else {
			res.status(203).send({
				msg: 'Aucun véhicule correspondant!',
				code: 102,
			});
    }
  });
  
}

export const getCarAvatar = (req, res) => {
  const numCar = req.params.numAvatar;

  //var sql = `SELECT vehicule.modele_vehicule, vehicule.type_vehicule, vehicule.marque, vehicule.energie, vehicule.etat, vehicule.cout_achat, vehicule.recette, vehicule.type_transport, vehicule.numero_chassis, vehicule.carte_grise, vehicule.enregistrement, vehicule.userID, vehicule.userID AS vehicule, mise_circulation_vehicule.vignette, AS mise_circulation_vehicule, depense.auteur AS depense FROM vehicule JOIN mise_circulation_vehicule ON vehicule.immatriculation= mise_circulation_vehicule.immatriculation JOIN depense ON mise_circulation_vehicule.immatriculation = depense.immatriculation`;
  var sql = "SELECT * FROM vehicule WHERE carImage = ?";

  db.query(sql, [req.params.numAvatar], (err, result) => {
    if (err) return res.json({ Message: "Error inside server" });
    return res.json(result);
  });
};

export const editCarAvatar = (req, res) => {
  const carImage = req.body.carImage;
  const oldImage = req.body.oldImage;
  const userID = req.body.userID;
  
  db.query(
    "SELECT * FROM vehicule where immatriculation = ?",
    [req.params.vehiculeId],
    function (error, result) {
      if (error)
        throw res.status(500).send({
          msg: error,
        });

      if (result) {
        const sql =
          "UPDATE vehicule SET `carImage` = ?, `userID` = ?  WHERE immatriculation=?";
        db.query(
          sql,
          [req.body.carImage, req.body.userID, req.params.vehiculeId],
          (err, resultat) => {
            if (resultat.affectedRows == 1) {
              fs.unlinkSync(
                `public/uploads/vehicules/${req.body.oldImage}`,
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
                msg: "Impossible de modifier la photo ce véhicule",
                code: 101,
              });
            }
          }
        );
      } else {
        return res.status(203).send({
          msg: "Impossible de trouver ce véhicule",
          code: 102,
        });
      }
      }
  );
};

export const removeCarAvatar = (req, res) => {
  const fileName = req.params.numAvatar;
  const directoryPath =
    __basedir + "../../rmci-gestion/public/uploads/vehicules/";

  fs.unlink(directoryPath + fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Impossible de supprimer le fichier. " + err,
      });
    }

    res.status(200).send({
      message: "Image supprimée.",
    });
  });
};
