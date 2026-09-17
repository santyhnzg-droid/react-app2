export const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000/api";

export const BACKEND_URL =
  API_URL.replace(/\/api\/?$/, "");


function getHeaders(authenticated = false) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (authenticated) {
    const token = localStorage.getItem(
      "gamezone_token"
    );

    if (token) {
      headers.Authorization =
        `Bearer ${token}`;
    }
  }

  return headers;
}


async function processResponse(response) {
  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      "El servidor devolvió una respuesta inválida."
    );
  }

  if (!response.ok) {
    let message =
      data.message ||
      data.detail ||
      "Error en el servidor.";

    if (Array.isArray(data.detail)) {
      message = data.detail
        .map((error) => error.msg)
        .join(" ");
    }

    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}


/* AUTH */

export async function registrarUsuario(data) {
  const response = await fetch(
    `${API_URL}/usuarios/registro`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }
  );

  return processResponse(response);
}


export async function loginUsuario(data) {
  const response = await fetch(
    `${API_URL}/auth/login`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }
  );

  return processResponse(response);
}


export async function getUsuarioActual() {
  const response = await fetch(
    `${API_URL}/auth/me`,
    {
      headers: getHeaders(true),
    }
  );

  return processResponse(response);
}


export async function solicitarRecuperacionPassword(
  email
) {
  const response = await fetch(
    `${API_URL}/auth/recuperar-password`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ email }),
    }
  );

  return processResponse(response);
}


export async function restablecerPassword(
  token,
  nuevaPassword
) {
  const response = await fetch(
    `${API_URL}/auth/restablecer-password`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        token,
        nueva_password: nuevaPassword,
      }),
    }
  );

  return processResponse(response);
}


/* PRODUCTOS */

export function getProductImageUrl(imagen) {
  if (!imagen) {
    return "";
  }

  if (
    imagen.startsWith("http://") ||
    imagen.startsWith("https://")
  ) {
    return imagen;
  }

  const cleanImage =
    imagen.startsWith("/")
      ? imagen
      : `/uploads/products/${imagen}`;

  return `${BACKEND_URL}${cleanImage}`;
}


export async function getProductos() {
  const response = await fetch(
    `${API_URL}/productos`
  );

  return processResponse(response);
}


export async function getProducto(id) {
  const response = await fetch(
    `${API_URL}/productos/${id}`
  );

  return processResponse(response);
}


export async function subirImagenProducto(file) {
  const token = localStorage.getItem(
    "gamezone_token"
  );

  if (!token) {
    throw new Error(
      "Debes iniciar sesión."
    );
  }

  const formData = new FormData();
  formData.append("imagen", file);

  const response = await fetch(
    `${API_URL}/productos/upload-image`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  return processResponse(response);
}


export async function crearProducto(data) {
  const response = await fetch(
    `${API_URL}/productos`,
    {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify(data),
    }
  );

  return processResponse(response);
}


export async function actualizarProducto(
  id,
  data
) {
  const response = await fetch(
    `${API_URL}/productos/${id}`,
    {
      method: "PUT",
      headers: getHeaders(true),
      body: JSON.stringify(data),
    }
  );

  return processResponse(response);
}


export async function cambiarEstadoProducto(
  id,
  estado
) {
  const response = await fetch(
    `${API_URL}/productos/${id}/estado`,
    {
      method: "PATCH",
      headers: getHeaders(true),
      body: JSON.stringify({ estado }),
    }
  );

  return processResponse(response);
}


export async function eliminarProducto(id) {
  const response = await fetch(
    `${API_URL}/productos/${id}`,
    {
      method: "DELETE",
      headers: getHeaders(true),
    }
  );

  return processResponse(response);
}


/* USUARIOS */

export async function getUsuarios() {
  const response = await fetch(
    `${API_URL}/usuarios`,
    {
      headers: getHeaders(true),
    }
  );

  return processResponse(response);
}


export async function getUsuario(id) {
  const response = await fetch(
    `${API_URL}/usuarios/${id}`,
    {
      headers: getHeaders(true),
    }
  );

  return processResponse(response);
}


export async function crearUsuario(data) {
  const response = await fetch(
    `${API_URL}/usuarios`,
    {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify(data),
    }
  );

  return processResponse(response);
}


export async function actualizarUsuario(
  id,
  data
) {
  const response = await fetch(
    `${API_URL}/usuarios/${id}`,
    {
      method: "PUT",
      headers: getHeaders(true),
      body: JSON.stringify(data),
    }
  );

  return processResponse(response);
}


export async function cambiarEstadoUsuario(
  id,
  estado
) {
  const response = await fetch(
    `${API_URL}/usuarios/${id}/estado`,
    {
      method: "PATCH",
      headers: getHeaders(true),
      body: JSON.stringify({ estado }),
    }
  );

  return processResponse(response);
}


export async function eliminarUsuario(id) {
  const response = await fetch(
    `${API_URL}/usuarios/${id}`,
    {
      method: "DELETE",
      headers: getHeaders(true),
    }
  );

  return processResponse(response);
}


/* SERVICIOS */

export async function getServicios() {
  const response = await fetch(
    `${API_URL}/servicios`
  );

  return processResponse(response);
}


export async function getServicio(id) {
  const response = await fetch(
    `${API_URL}/servicios/${id}`
  );

  return processResponse(response);
}


export async function crearServicio(data) {
  const response = await fetch(
    `${API_URL}/servicios`,
    {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify(data),
    }
  );

  return processResponse(response);
}


export async function actualizarServicio(
  id,
  data
) {
  const response = await fetch(
    `${API_URL}/servicios/${id}`,
    {
      method: "PUT",
      headers: getHeaders(true),
      body: JSON.stringify(data),
    }
  );

  return processResponse(response);
}


export async function cambiarEstadoServicio(
  id,
  estado
) {
  const response = await fetch(
    `${API_URL}/servicios/${id}/estado`,
    {
      method: "PATCH",
      headers: getHeaders(true),
      body: JSON.stringify({ estado }),
    }
  );

  return processResponse(response);
}


export async function eliminarServicio(id) {
  const response = await fetch(
    `${API_URL}/servicios/${id}`,
    {
      method: "DELETE",
      headers: getHeaders(true),
    }
  );

  return processResponse(response);
}


/* VENTAS */

export async function registrarVenta(data) {
  const payload = Array.isArray(data)
    ? { items: data }
    : data;

  const response = await fetch(
    `${API_URL}/ventas`,
    {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify(payload),
    }
  );

  return processResponse(response);
}


export async function getResumenVentas() {
  const response = await fetch(
    `${API_URL}/ventas/resumen`,
    {
      headers: getHeaders(true),
    }
  );

  return processResponse(response);
}


/* PAGOS STRIPE */

export async function crearStripeCheckout(productoId, cantidad = 1) {
  const response = await fetch(
    `${API_URL}/pagos/stripe/checkout`,
    {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify({
        producto_id: productoId,
        cantidad,
      }),
    }
  );

  return processResponse(response);
}


export async function consultarStripeCheckout(sessionId) {
  const response = await fetch(
    `${API_URL}/pagos/stripe/session/${encodeURIComponent(sessionId)}`,
    {
      headers: getHeaders(true),
    }
  );

  return processResponse(response);
}


export async function crearStripeCheckoutCarrito(items) {
  const response = await fetch(
    `${API_URL}/pagos/stripe/cart-checkout`,
    {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify({ items }),
    }
  );

  return processResponse(response);
}
