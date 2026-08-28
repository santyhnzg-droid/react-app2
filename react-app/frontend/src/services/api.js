const API_URL =
  "http://localhost:3000/api";

/* =========================
   HEADERS
========================= */

function getHeaders(
  authenticated = false
) {
  const headers = {
    "Content-Type":
      "application/json",
  };

  if (authenticated) {
    const token =
      localStorage.getItem(
        "gamezone_token"
      );

    if (token) {
      headers.Authorization =
        `Bearer ${token}`;
    }
  }

  return headers;
}

/* =========================
   RESPONSE
========================= */

async function processResponse(
  response
) {
  let data;

  try {
    data =
      await response.json();
  } catch {
    throw new Error(
      "Respuesta inválida del servidor."
    );
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Error en el servidor."
    );
  }

  return data;
}

/* =========================
   AUTH
========================= */

export async function registrarUsuario(
  data
) {
  const response =
    await fetch(
      `${API_URL}/auth/register`,
      {
        method: "POST",

        headers:
          getHeaders(),

        body:
          JSON.stringify(data),
      }
    );

  return processResponse(
    response
  );
}

export async function loginUsuario(
  data
) {
  const response =
    await fetch(
      `${API_URL}/auth/login`,
      {
        method: "POST",

        headers:
          getHeaders(),

        body:
          JSON.stringify(data),
      }
    );

  return processResponse(
    response
  );
}

export async function getUsuarioActual() {
  const response =
    await fetch(
      `${API_URL}/auth/me`,
      {
        headers:
          getHeaders(true),
      }
    );

  return processResponse(
    response
  );
}

/* =========================
   PRODUCTOS
========================= */

export async function getProductos() {
  const response =
    await fetch(
      `${API_URL}/productos`
    );

  return processResponse(
    response
  );
}

export async function getProducto(
  id
) {
  const response =
    await fetch(
      `${API_URL}/productos/${id}`
    );

  return processResponse(
    response
  );
}

export async function registrarVenta(items) {
  const response = await fetch(
    `${API_URL}/ventas`,
    {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify({ items }),
    }
  );

  return processResponse(response);
}

/* =========================
   SUBIR IMAGEN PRODUCTO
========================= */

export async function subirImagenProducto(
  file
) {
  const token =
    localStorage.getItem(
      "gamezone_token"
    );

  if (!token) {
    throw new Error(
      "Debes iniciar sesión para subir imágenes."
    );
  }

  const formData =
    new FormData();

  formData.append(
    "imagen",
    file
  );

  const response =
    await fetch(
      `${API_URL}/productos/upload-image`,
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${token}`,
        },

        body: formData,
      }
    );

  return processResponse(
    response
  );
}

export async function crearProducto(
  data
) {
  const response =
    await fetch(
      `${API_URL}/productos`,
      {
        method: "POST",

        headers:
          getHeaders(true),

        body:
          JSON.stringify(data),
      }
    );

  return processResponse(
    response
  );
}

export async function actualizarProducto(
  id,
  data
) {
  const response =
    await fetch(
      `${API_URL}/productos/${id}`,
      {
        method: "PUT",

        headers:
          getHeaders(true),

        body:
          JSON.stringify(data),
      }
    );

  return processResponse(
    response
  );
}

export async function cambiarEstadoProducto(
  id,
  estado
) {
  const response =
    await fetch(
      `${API_URL}/productos/${id}/estado`,
      {
        method: "PATCH",

        headers:
          getHeaders(true),

        body:
          JSON.stringify({
            estado,
          }),
      }
    );

  return processResponse(
    response
  );
}

export async function eliminarProducto(
  id
) {
  const response =
    await fetch(
      `${API_URL}/productos/${id}`,
      {
        method:
          "DELETE",

        headers:
          getHeaders(true),
      }
    );

  return processResponse(
    response
  );
}

/* =========================
   USUARIOS
========================= */

export async function getUsuarios() {
  const response =
    await fetch(
      `${API_URL}/usuarios`,
      {
        headers:
          getHeaders(true),
      }
    );

  return processResponse(
    response
  );
}

export async function crearUsuario(
  data
) {
  const response =
    await fetch(
      `${API_URL}/usuarios`,
      {
        method: "POST",

        headers:
          getHeaders(true),

        body:
          JSON.stringify(data),
      }
    );

  return processResponse(
    response
  );
}

export async function actualizarUsuario(
  id,
  data
) {
  const response =
    await fetch(
      `${API_URL}/usuarios/${id}`,
      {
        method: "PUT",

        headers:
          getHeaders(true),

        body:
          JSON.stringify(data),
      }
    );

  return processResponse(
    response
  );
}

export async function cambiarEstadoUsuario(
  id,
  estado
) {
  const response =
    await fetch(
      `${API_URL}/usuarios/${id}/estado`,
      {
        method: "PATCH",

        headers:
          getHeaders(true),

        body:
          JSON.stringify({
            estado,
          }),
      }
    );

  return processResponse(
    response
  );
}

export async function eliminarUsuario(
  id
) {
  const response =
    await fetch(
      `${API_URL}/usuarios/${id}`,
      {
        method:
          "DELETE",

        headers:
          getHeaders(true),
      }
    );

  return processResponse(
    response
  );
}

/* =========================
   SERVICIOS
========================= */

export async function getServicios() {
  const response =
    await fetch(
      `${API_URL}/servicios`
    );

  return processResponse(
    response
  );
}

export async function crearServicio(
  data
) {
  const response =
    await fetch(
      `${API_URL}/servicios`,
      {
        method: "POST",

        headers:
          getHeaders(true),

        body:
          JSON.stringify(data),
      }
    );

  return processResponse(
    response
  );
}

export async function actualizarServicio(
  id,
  data
) {
  const response =
    await fetch(
      `${API_URL}/servicios/${id}`,
      {
        method: "PUT",

        headers:
          getHeaders(true),

        body:
          JSON.stringify(data),
      }
    );

  return processResponse(
    response
  );
}

export async function cambiarEstadoServicio(
  id,
  estado
) {
  const response =
    await fetch(
      `${API_URL}/servicios/${id}/estado`,
      {
        method: "PATCH",

        headers:
          getHeaders(true),

        body:
          JSON.stringify({
            estado,
          }),
      }
    );

  return processResponse(
    response
  );
}

export async function eliminarServicio(
  id
) {
  const response =
    await fetch(
      `${API_URL}/servicios/${id}`,
      {
        method:
          "DELETE",

        headers:
          getHeaders(true),
      }
    );

  return processResponse(
    response
  );
}