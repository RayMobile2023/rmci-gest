import fs from "fs";
import { db } from "../config/Database.js";
import moment from "moment";



export const addVersement = async (req, res) => {
  const status = "Effectue";
  let obsArret;
  let nbre_arret;
  let obsRepos;
  let nbre_repos;

  const heure_arret = req.body.arret;
  const temps_repos = req.body.repos;
  const jour = moment(req.body.dateDepart).format("dddd");

  let sqlEventEnd =
    "select * from calendar_event WHERE event_driver = ? AND event_status = ? order by event_id desc limit 1";
  db.query(
    sqlEventEnd,
    [req.body.chauffeur, req.body.status],
    (errors, resultats) => {
      if (errors) throw errors;

      //Si c'est le 1er enregistrement
      if (resultats == 0) {
        nbre_repos = 0;
        obsRepos = "";

        //Si c'est le 1er enregistrement et weekend
        if (jour == "Friday" || jour == "Saturday") {
          //Arret pas important
          nbre_arret = 0;
          obsArret = "";
        } else {
          //Si c'est le 1er enregistrement et jour ouvrés arret dans le temps
          if (req.body.arret >= req.body.heureFin) {
            nbre_arret = 0;
            obsArret = "";
          } else {
            //Si c'est le 1er enregistrement et jour ouvrés arret plus que le temps

            // start time and end time
            var startTime = moment(req.body.arret, "HH:mm");
            var endTime = moment(req.body.heureFin, "HH:mm");

            // calculate total duration
            var duration = moment.duration(endTime.diff(startTime));

            // duration in hours
            var hours = parseInt(duration.asHours());

            // duration in minutes
            var minutes = parseInt(duration.asMinutes()) % 60;
            nbre_arret = 1;
            obsArret = hours + " heure et " + minutes + " minutes.";
          }
        }
      } else {
        //Si ce n'est pas le 1er enregistrement calculer temps arret
        //console.log(results[0].event_end_hours)
        // start time and end time
        var endTime = moment(req.body.heureDepart, "HH:mm");
        var startTime = moment(resultats[0].event_end_hours, "HH:mm");

        // calculate total duration
        var duration = moment.duration(endTime.diff(startTime));

        // duration in hours
        var hours = parseInt(duration.asHours());

        // duration in minutes
        var minutes = parseInt(duration.asMinutes()) % 60;

        const arretHeure = hours + " heure et " + minutes + " minutes.";
        let resRepos = moment(hours + ":" + minutes, "h:mm A").format("HH:mm");

        //Si ce n'est pas le 1er enregistrement et jour ouvrés temps de repos
        if (resRepos >= req.body.repos) {
          //Si ce n'est pas le 1er enregistrement et jour ouvrés temps de repos respecté
          obsRepos = "";
          nbre_repos = 0;
        } else {
          //Si ce n'est pas le 1er enregistrement et jour ouvrés temps de repos non-respecté
          obsRepos = hours + " heure et " + minutes + " minutes.";
          nbre_repos = 1;
        }

        //Si ce n'est pas le 1er enregistrement et weekend temps de repos respecté
        if (jour == "Friday" || jour == "Saturday") {
          nbre_arret = 0;
          obsArret = "";
          //console.log(results[0].event_end_hours)
          // start time and end time
          var endTime = moment(req.body.heureDepart, "HH:mm");
          var startTime = moment(resultats[0].event_end_hours, "HH:mm");

          // calculate total duration
          var duration = moment.duration(endTime.diff(startTime));

          // duration in hours
          var hours = parseInt(duration.asHours());

          // duration in minutes
          var minutes = parseInt(duration.asMinutes()) % 60;

          const arretHeure = hours + " heure et " + minutes + " minutes.";
          let resRepos = moment(hours + ":" + minutes, "h:mm A").format(
            "HH:mm"
          );

          if (resRepos >= req.body.repos) {
            //Si ce n'est pas le 1er enregistrement et weekend temps de repos respecté
            obsRepos = "";
            nbre_repos = 0;
          } else {
            //Si ce n'est pas le 1er enregistrement et weekend temps de repos non-respecté
            obsRepos = hours + " heure et " + minutes + " minutes.";
            nbre_repos = 1;
          }
        } else {
          //Si c'est le 1er enregistrement et jour ouvrés arret dans le temps
          if (req.body.arret >= req.body.heureFin) {
            nbre_arret = 0;
            obsArret = "";
          } else {
            //Si c'est le 1er enregistrement et jour ouvrés arret plus que le temps

            // start time and end time
            var startTime = moment(req.body.arret, "HH:mm");
            var endTime = moment(req.body.heureFin, "HH:mm");

            // calculate total duration
            var duration = moment.duration(endTime.diff(startTime));

            // duration in hours
            var hours = parseInt(duration.asHours());

            // duration in minutes
            var minutes = parseInt(duration.asMinutes()) % 60;
            nbre_arret = 1;
            obsArret = hours + " heure et " + minutes + " minutes.";
          }
        }
      }

      let query = "SELECT * FROM calendar_event WHERE event_id = ?";
      db.query(query, [req.body.eventID], (err, data) => {
        if (err) throw err;

        // Evenement trouvé
        if (data.length == 1) {
          const sql =
            "UPDATE calendar_event SET `event_driver` = ?, `event_car` = ?, `event_departure_place` = ?, `event_start_date` = ?, `event_start_hours` = ?, `event_place_arrival` = ?, `event_end_date` = ?, `event_end_hours` = ?, `event_status` = ?, `userID` = ?, `tutelle` = ?  WHERE event_id=?";
          db.query(
            sql,
            [
              req.body.chauffeur,
              req.body.vehicule,
              req.body.lieuDepart,
              req.body.dateDepart,
              req.body.heureDepart,
              req.body.lieuFin,
              req.body.dateFin,
              req.body.heureFin,
              req.body.status,
              req.body.userID,
              req.body.tutelle,
              req.body.eventID,
            ],
            (errs, result) => {
              if (errs) throw errs;

              if (result.affectedRows == 1) {
                let checkEvent = "SELECT * FROM versements WHERE event_id = ?";
                db.query(
                  checkEvent,
                  [req.body.eventID],
                  (errEvent, dataEvent) => {
                    if (errEvent) throw errEvent;

                    if (dataEvent == 0) {
                      let addQuery =
                        "INSERT INTO versements (`event_id`,`versement_driver`,`versement_car`,`montant_versement`,`date_versement`,`userID`,`tutelle`) VALUE (?)";
                      const values = [
                        req.body.eventID,
                        req.body.chauffeur,
                        req.body.vehicule,
                        req.body.recette,
                        req.body.dateFin,
                        req.body.userID,
                        req.body.tutelle,
                      ];

                      db.query(addQuery, [values], (error, resultat) => {
                        if (error) throw error;

                        if (resultat.affectedRows == 1) {
                          let addManqQuery =
                            "INSERT INTO manquement (`eventID`,`date_manquement`,`driver_id`,`arret`,`nbre_arret`,`repos`,`nbre_repos`,`userID`,`tutelle`) VALUE (?)";
                          const addManqValues = [
                            req.body.eventID,
                            req.body.dateFin,
                            req.body.chauffeur,
                            obsArret,
                            nbre_arret,
                            obsRepos,
                            nbre_repos,
                            req.body.userID,
                            req.body.tutelle,
                          ];

                          db.query(
                            addManqQuery,
                            [addManqValues],
                            (erreur, response) => {
                              if (erreur) throw erreur;

                              return res.status(200).send({
                                msg: "versement éffectué avec succès ",
                                code: 100,
                              });
                            }
                          );
                        } else {
                          return res.status(203).send({
                            msg: "Impossible d'effectué le versement' !",
                            code: 101,
                          });
                        }
                      });
                    }
                  }
                );
              } else {
                return res.status(203).send({
                  msg: "Impossible de mettre à jour cette planification !",
                  code: 102,
                });
              }
            }
          );
        } else {
          return res.status(203).send({
            msg: "Impossible de trouver cette planification !",
            code: 103,
          });
        }
      });
    }
  );
};

export const Manquement = async (req, res) => {
  //let allManquery = "SELECT * FROM `chauffeur` INNER JOIN `calendar_event` ON `chauffeur`.`numero_permis`=`calendar_event`.`event_driver` INNER JOIN `manquement` ON  `manquement`.`eventID`=`calendar_event`.`event_id`";
  let allManquery =
    "SELECT *, SUM(nbre_arret) AS totalArret, SUM(nbre_repos) AS totalRepos FROM  `manquement` INNER JOIN `chauffeur` ON `manquement`.`driver_id`=`chauffeur`.`numero_permis` WHERE (nbre_arret = 1) OR (nbre_repos = 1) OR (nbre_repos =1 AND nbre_arret = 1) GROUP BY `manquement`.`driver_id`";
  //let allManquery = "SELECT *, SUM(nbre_arret + nbre_repos) AS totalManQ, SUM(nbre_arret) AS totalArret, SUM(nbre_repos) AS totalRepos FROM `manquement` INNER JOIN `chauffeur` ON `manquement`.`driver_id`=`chauffeur`.`numero_permis` GROUP BY `manquement`.`driver_id` HAVING totalArret  > 0 OR totalRepos > 0 AND totalManQ > 0";
  db.query(allManquery, (err, rows) => {
    if (!err) {
      res.send(rows);
    } else {
      console.log(err);
    }
  });
};

export const getAllVersement = async (req, res) => {
  let allManquery =
    "SELECT * FROM `chauffeur` INNER JOIN `calendar_event` ON `chauffeur`.`numero_permis`=`calendar_event`.`event_driver` INNER JOIN `versements` ON  `versements`.`event_id`=`calendar_event`.`event_id` WHERE `calendar_event`.`event_status` = ? ORDER BY date_versement DESC";
  db.query(allManquery, ["Effectue"], (err, rows, fields) => {
    if (!err) {
      console.log(rows);
      res.send(rows);
    } else {
      console.log(err);
    }
  });
};

export const getAllVersementByWeek = async (req, res) => {
  /*let allManquery = "SELECT * FROM `chauffeur` INNER JOIN `calendar_event` ON `chauffeur`.`numero_permis`=`calendar_event`.`event_driver` INNER JOIN `versements` ON  `versements`.`event_id`=`calendar_event`.`event_id` WHERE `calendar_event`.`event_status` = ?";
  db.query(allManquery, ["Effectue"], (err, rows, fields) => {
    if (!err) {
      console.log(rows)
      res.send(rows);
    } else {
      console.log(err);
    }
  });*/
  let allManquery =
    "SELECT * FROM `versements` INNER JOIN `calendar_event` ON `versements`.`event_id` = `calendar_event`.`event_id` INNER JOIN `chauffeur` ON `versements`.`versement_driver` = `chauffeur`.`numero_permis` WHERE `calendar_event`.`event_status` = ? AND DAYOFWEEK(`versements`.`date_versement`) BETWEEN '2' AND '8'";
  db.query(allManquery, ["Effectue"], (err, rows, fields) => {
    if (!err) {
      res.send(rows);
    } else {
      console.log(err);
    }
  });
};

export const getAllOrders = async (req, res) => {
  let query =
    "SELECT SUM(montant_versement) AS total_versements FROM versements";
  db.query(query, (err, rows) => {
    if (err) throw err;
    return res.status(200).json(rows);
  });
};
