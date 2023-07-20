import express from "express";
import { create } from "../controllers/compte.js";
import { logger, login, recoveryEmail, resendOTP, resendPasswordOTP, resetEmailPassword, updatePassword, verifyMail } from "../controllers/auth.js";
import { addCars, deleteCarsID, editCarAvatar, editCars, getCarAvatar, getCars, getCarsID } from "../controllers/cars.js";
import { addCuratif, getCuratifID, getCuratifs, updateCuratif } from "../controllers/curatif.js";
import { getAllDepenseByVehicule, getDepense, getDepenseByVehicule, getFirstDepenseCar } from "../controllers/depense.js";
import { addDriver, driverEdit, editDriverAvatar, getDriverAvatar, getDriverID, getDrivers, removeDriverAvatar } from "../controllers/drivers.js";
import { addEvent, editEvent, getAllEvent,  getEventByDateCar, getEventByID } from "../controllers/events.js";
import { addPreventif, getPreventifID, getPreventifs, updatePreventif } from "../controllers/preventif.js";
import { createUser, editUser, getAllUsers, getUserID } from "../controllers/users.js";
import { checkTokenMiddleware } from "../middleware/auth_check.js";
import { Manquement, addVersement, getAllOrders, getAllVersement, getAllVersementByWeek } from "../controllers/order.js";

const router = express.Router();

router.get("/", checkTokenMiddleware, logger);
//=======================> Compte <====================
router.post("/api/compte/create-account", create);

//=======================> Auth <====================
router.post("/api/auth/resend-otp", resendOTP);
router.post("/api/auth/resend-email-otp", resendPasswordOTP);
router.post("/api/auth/verify-email", verifyMail);
router.post("/api/auth/login", login);
router.post("/api/auth/recovery-email", recoveryEmail);
router.post("/api/auth/reset-email", resetEmailPassword);
router.put("/api/auth/reset-password", updatePassword);

//=======================> Car <====================
router.get("/api/cars/cars-list", getCars);
router.post("/api/cars/cars-add", addCars);
router.get("/api/cars/find-car/:vehiculeId", getCarsID);
router.put("/api/cars/edit-car/:vehiculeId", editCars);
router.put("/api/cars/edit-avatar/:vehiculeId", editCarAvatar);
router.delete("/api/cars/delete-car/:vehiculeId", deleteCarsID);
router.get("/api/cars/find-image/:numAvatar", getCarAvatar);

//=======================> Curatif <====================
router.get("/api/curatif/entretien-list", getCuratifs);
router.post("/api/curatif/curatif-add", addCuratif);
router.get("/api/curatif/find-curatif/:curatifId", getCuratifID);
router.patch("/api/curatif/edit-curatif/:curatifId", updateCuratif);

//=======================> Depense <====================
router.get("/api/depenses/all-depenses", getDepense);
router.get("/api/depenses/first-depense/:vehiculeId", getFirstDepenseCar);
router.get("/api/depenses/depense-by-car/:vehiculeId", getDepenseByVehicule);
router.get("/api/depenses/all-depense-by-car/:vehiculeId", getAllDepenseByVehicule);

//=======================> Drivers <====================
router.get("/api/drivers/drivers-list", getDrivers);
router.post("/api/drivers/drivers-add", addDriver);
router.get("/api/drivers/find-driver/:numDriver", getDriverID);
router.get("/api/drivers/find-image/:numAvatar", getDriverAvatar);
router.put("/api/drivers/edit-avatar/:numDriver", editDriverAvatar);
router.delete("/api/drivers/delete-avatar/:numAvatar", removeDriverAvatar);
router.put("/api/drivers/edit-driver/:numDriver", driverEdit);

//=======================> Events <====================
router.post("/api/events/add-event", addEvent);
router.get("/api/events/events-list", getAllEvent);
router.get("/api/events/find-event/:eventID", getEventByID);
router.put("/api/events/edit-event/:eventID", editEvent);
router.get("/api/events/find-event-by/:eventCar/:eventStart", getEventByDateCar);

//=======================> Versement <====================
router.post("/api/order/add-payment", addVersement);
router.get("/api/order/all-faute", Manquement);
router.get("/api/order/week-versement", getAllVersementByWeek);
router.get("/api/order/all-versements", getAllVersement);
router.get("/api/order/all-sum-order", getAllOrders);

//=======================> Preventif <====================
router.get("/api/preventif/entretien-list", getPreventifs);
router.post("/api/preventif/preventif-add", addPreventif);
router.get("/api/preventif/find-preventif/:preventifId", getPreventifID);
router.patch("/api/preventif/edit-preventif", updatePreventif);

//=======================> Users <====================
router.post("/api/users/users-add", createUser);
router.get("/api/users/users-list", getAllUsers);
router.get("/api/users/find-user/:userID", getUserID);
router.put("/api/users/edit-user/:userID", editUser);



export default router;
