import { db } from "./config/Database.js";
import session from "express-session";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import route from "./router/route.js"
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import session from 'cookie-session'
import RedisStore from "connect-redis";
import { createClient } from "redis";
import { createProxyMiddleware } from "http-proxy-middleware";


const app = express();
dotenv.config();

const PORT = process.env.PORT || 4000;
const SESSION_SECRET = process.env.SESSION_SECRET;
const sixtyDaysInSeconds = 5184000; // 60 * 24 * 60 * 60


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 

app.use(express.static(path.join(__dirname)))

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(cookieParser()); // any string ex: 'keyboard cat'

app.use(
  cors({
    credentials: true,
    origin: true,
  })
);

app.use(
  "/api",
  createProxyMiddleware({
    target: "http://localhost:8080",
    changeOrigin: true,
  })
);

const redisClient = createClient();
redisClient.connect().catch(console.error);

const redisStore = new RedisStore({
  client: redisClient,
  prefix: "prefix:",
});

//-momery unleaked---------
app.set('trust proxy', 1);

app.use(
  session({
    cookie: {
      secure: true,
      maxAge: 60000,
    },
    store: redisStore,
    secret: SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

app.use(function(req,res,next){
if(!req.session){
    return next(new Error('Oh no')) //handle error
}
next() //otherwise continue
});

app.use(
  session({
    name: "session_id",
    saveUninitialized: true,
    resave: false,
    secret: SESSION_SECRET, // Secret key,
    cookie: {
      path: "/",
      httpOnly: true,
      maxAge: 1 * 60 * 1000,
      sameSite: "none",
      secure: true,
    },
  })
);

// app middleware
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.json());

app.use(
  cors({
    origin: [process.env.ORIGIN_FRONTEND_SERVER],
    methods: ["GET,OPTIONS,PATCH,DELETE,POST,PUT,FETCH"],
    allowedHeaders:
      "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, application/pdf",
    //allowedHeaders: ["Access-Control-Allow-Origin", "*"],
    allowedHeaders: "Access-Control-Allow-Methods",
    allowedHeaders: ["Access-Control-Allow-Headers", ""],
    //allowedHeaders: ["Access-Control-Allow-Credentials", true],
    credentials: true, // enable set cookie
    optionsSuccessStatus: 200,
    credentials: true,
  })
);

app.post("/", function (req, res, next) {
  // Handle the post for this route
});

app.use(
  "/uploads",
  express.static(path.join(__dirname, "public/uploads/vehicules"))
);

app.use(
  "/uploads",
  express.static(path.join(__dirname, "public/uploads/drivers/avatars"))
);

app.use(
  "/uploads",
  express.static(path.join(__dirname, "public/uploads/drivers/contrats"))
);

const storageCar = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/vehicules");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const storageDriver = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/drivers/avatars");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const storageContrat = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/drivers/contrats");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const uploadCar = multer({ storage: storageCar });
const uploadDriver = multer({ storage: storageDriver });
const uploadContrat = multer({ storage: storageContrat });

app.post("/api/upload-car", uploadCar.single("file"), (req, res) => {
  const file = req.file;
  res.status(200).json(file.filename);
});

app.post("/api/upload-driver", uploadDriver.single("file"), (req, res) => {
  const file = req.file;
  res.status(200).json(file.filename);
});

app.post("/api/upload-contrat", uploadContrat.single("file"), (req, res) => {
  const file = req.file;
  res.status(200).json(file.filename);
});

app.get("/", (req, res) => {
  res.send("Route pour le backend");
});
app.use("/", route);

try {
  await db.authenticate();
  console.log("Base de donnée connectée");
} catch (error) {
  console.error();
}

app.listen(PORT, () => console.log(`Serveur fonctionne sur le port ${PORT}`));

function initial() {
  Role.create({
    id: 1,
    name: "Administrateur",
  });

  Role.create({
    id: 2,
    name: "Comptabilité",
  });

  Role.create({
    id: 3,
    name: "Logistique",
  });
}