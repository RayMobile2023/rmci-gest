import { db } from "../config/Database.js";

export const getCuratifs = async (req, res) => {
  db.query("select * from curatif", (err, rows, fields) => {
    if (!err) {
      res.send(rows);
    } else {
      console.log(err);
    }
  });
};

export const addCuratif = async (req, res) => {
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
  if (req.body.date_entre > req.body.date_sortie) {
    return res.status(203).send({
      msg: "Désolé la date de sortie est inférieure à la date d'entrée",
      code: 101,
    });
  } else {
    try {
      var sql = `INSERT INTO curatif(montant_curatif, lieu_curatif, libelle_curatif, immatriculation, date_entre, date_sortie, userID, tutelle) 
    VALUES("${req.body.montant}", "${req.body.lieu}","${req.body.libelle}", "${req.body.vehicule}", "${req.body.date_entre}", "${req.body.date_sortie}", "${req.body.userID}", "${req.body.tutelle}")`;
      db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);

        if (result) {
          const query =
            "INSERT INTO depense (`auteur`,`motif_depense`,`date_depense`,`montant_depense`,`id_type_depense`,`enregistrement`,`userID`) VALUE (?)";
          const values = [
            req.body.vehicule,
            `Entretien curatif du ${req.body.date_entre}`,
            req.body.date_entre,
            req.body.montant,
            "ENTRETIEN CURATIF",
            created_at,
            req.body.userID,
          ];
          db.query(query, [values], (err, resultats) => {
            if (err) return res.status(500).json(err);

            if (resultats)
              return res.status(200).send({
                msg: "Entretien curatif ajouté avec succès",
                code: 100,
              });
          });
        }
      });
    } catch (error) {
      return res.status(203).send({
        msg: "Impossible d'ajouter cet entretien",
        code: 102,
      });
    }
  }
};

export const getCuratifID = async (req, res) => {
  const preventifId = req.params.curatifId;

  var sql = "SELECT * FROM curatif WHERE id_curatif = ?";

  db.query(sql, [req.params.curatifId], (err, result) => {
    if (err) return res.json({ Message: "Error inside server" });

    if (result) {
      return res.status(203).send({
        msg: "Entretien curatif modifié avec succès",
        code: 100,
      });
    }
  });
};

export const updateCuratif = async (req, res) => {
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

  if (req.body.date_entre > req.body.date_sortie) {
    return res.status(203).send({
      msg: "Désolé la date de sortie est inférieure à la date d'entrée",
      code: 101,
    });
  } else {
    const sql =
      "UPDATE curatif SET `montant_curatif` = ?, `lieu_curatif` = ?, `libelle_curatif` = ?, `immatriculation` = ?, `date_entre` = ?, `date_sortie` = ?, `userID` = ?, `tutelle` = ? WHERE id_curatif =?";
    db.query(
      sql,
      [
        req.body.montant,
        req.body.lieu,
        req.body.libelle,
        req.body.vehicule,
        req.body.date_entre,
        req.body.date_sortie,
        req.body.userID,
        req.body.tutelle,
        req.body.id_curatif,
      ],
      (err, resultat) => {
        if (err)
          return res.json({ Message: "Erreur à l’intérieur du serveur" });

        if (resultat.affectedRows == 1) {
          return res.status(200).send({
            msg: "Entretien curatif modifié avec succès",
            code: 100,
          });
        } else {
          return res.status(203).send({
            msg: "Erreur lors de la modification de l'entretien",
            code: 101,
          });
        }
      }
    );
  }
};

export const trashCuratif = async (req, res) => {
  const preventifId = req.params.preventifId;

  var sql = "SELECT * FROM curatif WHERE id_curatif = ?";

  db.query(sql, [req.params.preventifId], (err, result) => {
    if (err) return res.json({ Message: "Error inside server" });

    if (result.length == 1) {
      var sqlDel = "DELETE FROM curatif WHERE id_curatif = ?";
      db.query(sqlDel, [req.params.preventifId], (error, resultat) => {
        if (error) return res.json({ Message: "Error inside server" });

        if (resultat) {
          return res.status(200).send({
            msg: "Entretien curatif supprimé avec succès",
            code: 100,
          });
        } else {
          return res.status(203).send({
            msg: "Entretien inexistant",
            code: 101,
          });
        }
      });
    }
  });
};
