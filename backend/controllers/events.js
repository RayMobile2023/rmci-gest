import { db } from "../config/Database.js";

export const addEvent = async (req, res) => {
  let query =
    "SELECT * FROM calendar_event WHERE event_driver = ? AND  event_start_date = ?";
  db.query(query, [req.body.chauffeur, req.body.dateDepart], (err, data) => {
    if (err) throw err;

    // Utilisateur trouvé
    if (data.length > 0) {
      return res.status(203).send({
        msg: "Conducteur programmé à cette date !",
        code: 101,
      });
    }

    // Utilisateur trouvé
    if (data.length == 0) {
      let queryDriver = "SELECT * FROM chauffeur WHERE numero_permis = ?";
      db.query(queryDriver, [req.body.chauffeur], (error, result) => {
        if (error) throw error;

        if (!result[0].vehicule) {
          return res.status(203).send({
            msg: "Conducteur sans véhicule attribué !",
            code: 102,
          });
        }

        let addQuery =
          "INSERT INTO calendar_event (`event_driver`,`event_car`,`event_departure_place`,`event_start_date`,`event_start_hours`,`event_place_arrival`,`event_end_date`,`event_end_hours`,`event_status`,`userID`,`tutelle`) VALUE (?)";
        const values = [
          req.body.chauffeur,
          result[0].vehicule,
          req.body.lieuDepart,
          req.body.dateDepart,
          req.body.heureDepart,
          req.body.lieuFin,
          req.body.dateFin,
          req.body.heureFin,
          req.body.status,
          req.body.userID,
          req.body.tutelle,
        ];

        db.query(addQuery, [values], (err, data) => {
          if (err) throw err;

          if (data) {
            return res.status(200).send({
              msg: "Programme éffectué avec succès ",
              code: 100,
            });
          } else {
            return res.status(203).send({
              msg: "Impossible de programmer ce voyage !",
              code: 103,
            });
          }
        });
      });

      //
    }
  });
};

export const editEvent = async (req, res) => {
  let queryDriver = "SELECT * FROM chauffeur WHERE numero_permis = ?";
  db.query(queryDriver, [req.body.chauffeur], (error, result) => {
    if (error) throw error;

    if (!result[0].vehicule)
      return res.status(203).send({
        msg: "Conducteur sans véhicule attribué !",
        code: 102,
      });

    const sql =
      "UPDATE calendar_event SET `event_driver` = ?, `event_car` = ?, `event_departure_place` = ?, `event_start_date` = ?, `event_start_hours` = ?, `event_place_arrival` = ?, `event_end_date` = ?, `event_end_hours` = ?, `event_status` = ?, `userID` = ?, `tutelle` = ?  WHERE event_id=?";
    db.query(
      sql,
      [
        req.body.chauffeur,
        result[0].vehicule,
        req.body.lieuDepart,
        req.body.dateDepart,
        req.body.heureDepart,
        req.body.lieuFin,
        req.body.dateFin,
        req.body.heureFin,
        req.body.status,
        req.body.userID,
        req.body.tutelle,
        req.body.event_id,
      ],
      (err, data) => {
        if (err) throw err;

        if (data) {
          return res.status(200).send({
            msg: "Programme modifié avec succès ",
            code: 100,
          });
        } else {
          return res.status(203).send({
            msg: "Impossible de programmer ce voyage !",
            code: 103,
          });
        }
      }
    );
  });
};

export const getAllEvent = async (req, res) => {
  db.query("select * from calendar_event ORDER BY event_start_date", (err, rows, fields) => {
    if (!err) {
      res.send(rows);
    } else {
      console.log(err);
    }
  });
};

export const getEventByID = async (req, res) => {
  //var sql = "select * from calendar_event WHERE event_id = ?";
  var sql =
    "SELECT * FROM `chauffeur` INNER JOIN `calendar_event` ON `chauffeur`.`numero_permis`=`calendar_event`.`event_driver` INNER JOIN `vehicule` ON  `calendar_event`.`event_car`=`vehicule`.`immatriculation` WHERE `calendar_event`.`event_id` = ? ";

  db.query(sql, [req.params.eventID], (err, result) => {
    if (err) return res.json({ Message: "Error inside server" });
    return res.json(result);
  });
};

export const getEventByDateCar = async (req, res) => {
  //var sql = "select * from calendar_event WHERE event_car = ? AND event_start_date = ? AND event_status = ?";
  var sql =
    "SELECT * FROM `vehicule` INNER JOIN `calendar_event` ON `vehicule`.`immatriculation`=`calendar_event`.`event_car` WHERE `vehicule`.`immatriculation` = ? AND `calendar_event`.`event_start_date` = ? AND `calendar_event`.`event_status` = ?";

  db.query(
    sql,
    [req.params.eventCar, req.params.eventStart, ""],
    (err, result) => {
      if (err) return res.json({ Message: "Error inside server" });
      //console.log(result)
      return res.json(result);
    }
  );
};
