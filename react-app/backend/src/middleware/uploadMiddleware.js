import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(
  process.cwd(),
  "uploads",
  "products"
);

/* =========================
   CREAR CARPETA SI NO EXISTE
========================= */

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}

/* =========================
   ALMACENAMIENTO
========================= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    const originalName = path
      .basename(
        file.originalname,
        extension
      )
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      )
      .replace(
        /[^a-zA-Z0-9-_]/g,
        "-"
      )
      .replace(
        /-+/g,
        "-"
      );

    const safeName =
      originalName || "producto";

    const filename =
      `${Date.now()}-${safeName}${extension}`;

    cb(null, filename);
  },
});

/* =========================
   TIPOS PERMITIDOS
========================= */

const fileFilter = (
  req,
  file,
  cb
) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (
    !allowedMimeTypes.includes(
      file.mimetype
    )
  ) {
    return cb(
      new Error(
        "Solo se permiten imágenes JPG, JPEG, PNG o WEBP."
      )
    );
  }

  cb(null, true);
};

/* =========================
   MULTER
========================= */

export const uploadProductImage =
  multer({
    storage,

    fileFilter,

    limits: {
      fileSize:
        5 * 1024 * 1024,
    },
  });