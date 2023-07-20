import { db } from "../config/Database.js";

export const getDepense = async (req, res) => {
  let query = "SELECT SUM(montant_depense) AS total_depenses FROM depense";
  db.query(query, (err, rows) => {
    if (err) throw err;
    return res.status(200).json(rows);
  });
};



export const getDepenseByVehicule = async (req, res) => {
  const vehiculeId = req.params.vehiculeId;

  let query = "SELECT SUM(montant_depense) AS total_depenses FROM depense WHERE auteur = ?";
  db.query(query, [req.params.vehiculeId], (err, rows) => {
    if (err) throw err;
    return res.status(200).json(rows);
  });
};


export const getAllDepenseByVehicule = async (req, res) => {
  const vehiculeId = req.params.vehiculeId;

  let query = "SELECT * FROM depense WHERE auteur = ?";
  db.query(query, [req.params.vehiculeId], (err, rows) => {
    if (err) throw err;
    return res.status(200).json(rows);
  });
};


export const getFirstDepenseCar = async (req, res) => {
  const {vehiculeId} = req.params.vehiculeId;
  //console.log(vehiculeId)

  //var sql = "SELECT `vignette`, `patente`, `carte_transport`, `carte_station`, `assurance`, `montant_plein_carburant`, `montant_maintenance` AS first_depenses FROM `mise_circulation_vehicule` WHERE immatriculation = ?";
  //const sql = "SELECT * FROM `vehicule` INNER JOIN `mise_circulation_vehicule` ON `vehicule`.`immatriculation`=`mise_circulation_vehicule`.`immatriculation` HAVING (`vehicule`.`immatriculation`) =  "+[vehiculeId]+"";
  var sql = "SELECT * FROM `mise_circulation_vehicule` WHERE `immatriculation`=?";

  db.query(sql, [req.params.vehiculeId], function (error, resultats, fields) {
    if (error) throw error;
    return res.status(200).json(resultats);
  })

  
}

/*export const getDepenseCar = (req, res) => {
  const vehiculeId = req.params.vehiculeId;

  const q = "SELECT * FROM vehicule WHERE immatriculation = ?";

  db.query(q, [vehiculeId], (err, result) => {
    if(err) return res.json({Message: "Error inside server"});
    return res.json(result);
  })
}*/
