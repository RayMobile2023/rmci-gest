import { db } from "../config/Database.js";

export const getPreventifs = async (req, res) => {
    db.query("select * from preventif", (err, rows, fields) => {
      if (!err) {
        res.send(rows);
      } else {
        console.log(err);
      }
    });
};

export const addPreventif = async (req, res) => {
  try {
    var sql = `INSERT INTO preventif(montant_preventif, lieu_preventif, libelle_entretien, immatriculation, date_preventif, userID, tutelle) 
    VALUES("${req.body.montant}", "${req.body.lieu}","${req.body.libelle}", "${req.body.vehicule}", "${req.body.date}", "${req.body.userID}", "${req.body.tutelle}")`;
    db.query(sql, (err, result) => {
      if (err)
      return res.status(500).json(err);

      if (result) {
        return res.status(200).send({
          msg: "Entretien préventif ajouté avec succès",
          code: 100,
        });
      }
    })
    
  } catch (error) {
    return res.status(203).send({
      msg: "Impossible d'ajouter cet entretien",
      code: 101,
    });
  }
}

export const getPreventifID = async (req, res) => {
  const preventifId = req.params.preventifId;

  var sql = "SELECT * FROM preventif WHERE id_preventif = ?";

  db.query(sql, [req.params.preventifId], (err, result) => {
    if(err) return res.json({Message: "Error inside server"});
    return res.json(result);
  });
}

export const updatePreventif = async (req, res) => {
  const sql = 'UPDATE preventif SET `montant_preventif` = ?, `lieu_preventif` = ?, `libelle_entretien` = ?, `immatriculation` = ?, `date_preventif` = ?, `userID` = ?, `tutelle` = ? WHERE id_preventif =?';
  db.query(sql, [req.body.montant,req.body.lieu,req.body.libelle,req.body.vehicule,req.body.date,req.body.userID,req.body.tutelle,req.body.id_preventif], (err, resultat) => {
    if (err) 
      return res.json({Message: "Erreur à l’intérieur du serveur"});
      
      if (resultat.affectedRows == 1) {
        return res.status(200).send({
          msg: "Entretien préventif modifié avec succès",
          code: 100,
        });
      } else {
        return res.status(203).send({
          msg: "Erreur lors de la modification de l'entretien",
          code: 101,
        });
      }
  });
}

export const trashPreventif = async (req, res) => {
  const preventifId = req.params.preventifId;

  var sql = "SELECT * FROM preventif WHERE id_preventif = ?";

  db.query(sql, [req.params.preventifId], (err, result) => {
    if(err) return res.json({Message: "Error inside server"});

    if (result.length == 1) {
      var sqlDel = "DELETE FROM preventif WHERE id_preventif = ?";
      db.query(sqlDel, [req.params.preventifId], (error, resultat) => {
        if(error) return res.json({Message: "Error inside server"});

        if (resultat) {
          return res.status(200).send({
            msg: "Entretien préventif modifié avec succès",
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
}