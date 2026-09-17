import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import { Navbar } from "../../components/Navbar/Navbar";

import {
  getProductImageUrl,
  getProductos,
  getResumenVentas,
  registrarVenta,
} from "../../services/api";

import { useAuth } from "../../context/AuthContext";


export function EmpleadoDashboard() {
  const {
    usuario,
  } = useAuth();

  const [
    productos,
    setProductos,
  ] = useState([]);

  const [
    carrito,
    setCarrito,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    resumenVentas,
    setResumenVentas,
  ] = useState({
    ventas_manuales: 0,
    pagos_stripe_aprobados: 0,
    ventas_totales: 0,
    ingresos_totales: 0,
  });


  async function loadProducts() {
    setLoading(true);
    setError("");

    try {
      const result =
        await getProductos();

      setProductos(
        result.productos || []
      );
    } catch (err) {
      setError(
        err.message
      );
    } finally {
      setLoading(false);
    }
  }


  async function loadSalesSummary() {
    try {
      const result = await getResumenVentas();
      setResumenVentas(result);
    } catch (err) {
      setError(err.message);
    }
  }


  useEffect(() => {
    loadProducts();
    loadSalesSummary();
  }, []);


  function addToCart(product) {
    if (
      product.estado !== "activo" ||
      product.stock <= 0
    ) {
      return;
    }

    setCarrito((current) => {
      const existing =
        current.find(
          (item) =>
            item.id === product.id
        );

      if (existing) {
        if (
          existing.cantidad >=
          product.stock
        ) {
          return current;
        }

        return current.map(
          (item) =>
            item.id === product.id
              ? {
                  ...item,
                  cantidad:
                    item.cantidad + 1,
                }
              : item
        );
      }

      return [
        ...current,
        {
          ...product,
          cantidad: 1,
        },
      ];
    });
  }


  function changeQuantity(
    productId,
    amount
  ) {
    setCarrito((current) =>
      current
        .map((item) => {
          if (
            item.id !== productId
          ) {
            return item;
          }

          const next =
            item.cantidad +
            amount;

          if (next <= 0) {
            return {
              ...item,
              cantidad: 0,
            };
          }

          if (
            next > item.stock
          ) {
            return item;
          }

          return {
            ...item,
            cantidad: next,
          };
        })
        .filter(
          (item) =>
            item.cantidad > 0
        )
    );
  }


  function removeFromCart(
    productId
  ) {
    setCarrito((current) =>
      current.filter(
        (item) =>
          item.id !== productId
      )
    );
  }


  const total = useMemo(
    () =>
      carrito.reduce(
        (sum, item) =>
          sum +
          Number(
            item.precio
          ) *
            item.cantidad,
        0
      ),
    [carrito]
  );


  const totalUnits = useMemo(
    () =>
      carrito.reduce(
        (sum, item) =>
          sum +
          item.cantidad,
        0
      ),
    [carrito]
  );


  const activeProducts =
    useMemo(
      () =>
        productos.filter(
          (product) =>
            product.estado ===
              "activo" &&
            product.stock > 0
        ).length,
      [productos]
    );


  async function confirmSale() {
    if (!carrito.length) {
      setError(
        "Agrega al menos un producto antes de confirmar la venta."
      );

      return;
    }

    setError("");
    setMessage("");
    setSaving(true);

    try {
      const result =
        await registrarVenta({
          items: carrito.map(
            (item) => ({
              producto_id:
                item.id,
              cantidad:
                item.cantidad,
            })
          ),
        });

      setMessage(
        `Venta #${result.venta.id} registrada correctamente por $${Number(
          result.venta.total
        ).toLocaleString(
          "es-CO"
        )}.`
      );

      setCarrito([]);

      await loadProducts();
      await loadSalesSummary();

    } catch (err) {
      setError(
        err.message
      );
    } finally {
      setSaving(false);
    }
  }


  return (
    <main
      className="
        min-h-screen
        overflow-hidden
        bg-[#030509]
        text-white
      "
    >

      <Navbar />


      {/* FONDOS */}
      <div
        className="
          pointer-events-none
          fixed
          inset-0
          overflow-hidden
        "
      >
        <div
          className="
            absolute
            -left-40
            top-20
            h-96
            w-96
            rounded-full
            bg-cyan-500/8
            blur-[130px]
          "
        />

        <div
          className="
            absolute
            right-0
            top-1/3
            h-125
            w-125
            rounded-full
            bg-violet-600/8
            blur-[150px]
          "
        />
      </div>


      <div
        className="
          relative
          z-10
          mx-auto
          max-w-[1600px]
          px-5
          pb-16
          pt-36
          sm:px-8
          lg:px-12
        "
      >

        {/* HEADER */}
        <section
          className="
            relative
            overflow-hidden
            rounded-4xl
            border
            border-white/10
            bg-linear-to-br
            from-white/[0.07]
            to-white/2
            p-7
            shadow-2xl
            backdrop-blur-xl
            md:p-10
          "
        >

          <div
            className="
              absolute
              right-0
              top-0
              h-72
              w-72
              rounded-full
              bg-cyan-400/10
              blur-[100px]
            "
          />

          <div
            className="
              relative
              z-10
              flex
              flex-col
              justify-between
              gap-8
              lg:flex-row
              lg:items-end
            "
          >

            <div>
              <div
                className="
                  mb-4
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-cyan-300/15
                  bg-cyan-400/8
                  px-4
                  py-2
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.2em]
                  text-cyan-300
                "
              >
                <span
                  className="
                    h-2
                    w-2
                    rounded-full
                    bg-cyan-300
                    shadow-[0_0_15px_rgba(103,232,249,.8)]
                  "
                />

                Panel de empleado
              </div>

              <h1
                className="
                  max-w-4xl
                  text-4xl
                  font-black
                  tracking-tight
                  md:text-5xl
                "
              >
                Hola,{" "}
                <span
                  className="
                    bg-linear-to-r
                    from-cyan-300
                    to-violet-400
                    bg-clip-text
                    text-transparent
                  "
                >
                  {usuario?.nombre}
                </span>
              </h1>

              <p
                className="
                  mt-4
                  max-w-2xl
                  text-sm
                  leading-7
                  text-white/45
                  md:text-base
                "
              >
                Gestiona las ventas de
                GameZone, selecciona los
                productos y confirma la
                operación desde una sola
                pantalla.
              </p>
            </div>


            <Link
              to="/"
              className="
                inline-flex
                w-fit
                items-center
                gap-3
                rounded-xl
                border
                border-white/10
                bg-white/5
                px-5
                py-3
                text-sm
                font-bold
                text-white/80
                transition

                hover:-translate-y-0.5
                hover:border-cyan-300/30
                hover:bg-cyan-400/10
                hover:text-white
              "
            >
              ← Página principal
            </Link>

          </div>

        </section>


        {/* ESTADÍSTICAS */}
        <section
          className="
            mt-6
            grid
            gap-4
            sm:grid-cols-2
            xl:grid-cols-5
          "
        >

          <article
            className="
              rounded-2xl
              border
              border-white/8
              bg-white/[0.035]
              p-5
              backdrop-blur-xl
            "
          >
            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-[0.18em]
                text-white/30
              "
            >
              Productos
            </p>

            <p
              className="
                mt-3
                text-3xl
                font-black
              "
            >
              {productos.length}
            </p>

            <p
              className="
                mt-1
                text-xs
                text-white/30
              "
            >
              registrados
            </p>
          </article>


          <article
            className="rounded-2xl border border-amber-300/10 bg-amber-400/4 p-5"
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300/60">
              Ventas registradas
            </p>
            <p className="mt-3 text-3xl font-black text-amber-200">
              {resumenVentas.ventas_totales}
            </p>
            <p className="mt-1 text-xs text-white/30">
              {resumenVentas.pagos_stripe_aprobados} por Stripe
            </p>
          </article>


          <article
            className="
              rounded-2xl
              border
              border-cyan-300/10
              bg-cyan-400/4
              p-5
            "
          >
            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-[0.18em]
                text-cyan-300/50
              "
            >
              Disponibles
            </p>

            <p
              className="
                mt-3
                text-3xl
                font-black
                text-cyan-200
              "
            >
              {activeProducts}
            </p>

            <p
              className="
                mt-1
                text-xs
                text-white/30
              "
            >
              con stock
            </p>
          </article>


          <article
            className="
              rounded-2xl
              border
              border-violet-300/10
              bg-violet-400/4
              p-5
            "
          >
            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-[0.18em]
                text-violet-300/50
              "
            >
              Carrito
            </p>

            <p
              className="
                mt-3
                text-3xl
                font-black
                text-violet-200
              "
            >
              {totalUnits}
            </p>

            <p
              className="
                mt-1
                text-xs
                text-white/30
              "
            >
              unidades
            </p>
          </article>


          <article
            className="
              rounded-2xl
              border
              border-emerald-300/10
              bg-emerald-400/4
              p-5
            "
          >
            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-[0.18em]
                text-emerald-300/50
              "
            >
              Total venta
            </p>

            <p
              className="
                mt-3
                text-3xl
                font-black
                text-emerald-300
              "
            >
              $
              {total.toLocaleString(
                "es-CO"
              )}
            </p>
          </article>

        </section>


        <section className="mt-8 rounded-3xl border border-white/8 bg-white/[0.035] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300/50">
                Seguimiento
              </p>
              <h2 className="mt-2 text-2xl font-black">Últimas ventas confirmadas</h2>
            </div>
            <p className="text-sm text-emerald-300">
              ${Number(resumenVentas.ingresos_totales || 0).toLocaleString("es-CO")} acumulado
            </p>
          </div>
          <div className="mt-5 overflow-x-auto">
            {resumenVentas.ultimas_ventas?.length ? (
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-white/35">
                  <tr>
                    <th className="px-3 py-3">Tipo</th>
                    <th className="px-3 py-3">Referencia</th>
                    <th className="px-3 py-3">Estado</th>
                    <th className="px-3 py-3">Monto</th>
                    <th className="px-3 py-3">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {resumenVentas.ultimas_ventas.map((venta) => (
                    <tr key={`${venta.tipo}-${venta.id}`} className="border-b border-white/5 text-white/70">
                      <td className="px-3 py-3">{venta.tipo === "stripe" ? "Stripe" : "Mostrador"}</td>
                      <td className="px-3 py-3">#{venta.id}</td>
                      <td className="px-3 py-3 text-emerald-300">{venta.estado}</td>
                      <td className="px-3 py-3">${Number(venta.monto).toLocaleString("es-CO")}</td>
                      <td className="px-3 py-3 text-white/45">{venta.fecha ? new Date(venta.fecha).toLocaleString("es-CO") : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="py-6 text-sm text-white/40">Todavía no hay ventas confirmadas.</p>
            )}
          </div>
        </section>


        {/* ALERTAS */}
        {error && (
          <div
            className="
              mt-6
              rounded-2xl
              border
              border-red-400/20
              bg-red-400/10
              px-5
              py-4
              text-sm
              text-red-200
            "
          >
            {error}
          </div>
        )}


        {message && (
          <div
            className="
              mt-6
              rounded-2xl
              border
              border-emerald-400/20
              bg-emerald-400/10
              px-5
              py-4
              text-sm
              text-emerald-200
            "
          >
            {message}
          </div>
        )}


        {/* CONTENIDO */}
        <section
          className="
            mt-8
            grid
            gap-8
            xl:grid-cols-[1fr_390px]
          "
        >

          {/* PRODUCTOS */}
          <div>
            <div
              className="
                mb-5
                flex
                items-end
                justify-between
                gap-4
              "
            >
              <div>
                <p
                  className="
                    text-xs
                    font-bold
                    uppercase
                    tracking-[0.2em]
                    text-cyan-300/50
                  "
                >
                  Catálogo
                </p>

                <h2
                  className="
                    mt-2
                    text-2xl
                    font-black
                  "
                >
                  Productos disponibles
                </h2>
              </div>
            </div>


            {loading ? (
              <div
                className="
                  flex
                  min-h-80
                  items-center
                  justify-center
                  rounded-3xl
                  border
                  border-white/8
                  bg-white/2.5
                "
              >
                <div className="text-center">
                  <div
                    className="
                      mx-auto
                      h-8
                      w-8
                      animate-spin
                      rounded-full
                      border-2
                      border-white/10
                      border-t-cyan-300
                    "
                  />

                  <p
                    className="
                      mt-4
                      text-sm
                      text-white/40
                    "
                  >
                    Cargando productos...
                  </p>
                </div>
              </div>
            ) : productos.length === 0 ? (

              <div
                className="
                  rounded-3xl
                  border
                  border-white/8
                  bg-white/2.5
                  p-12
                  text-center
                "
              >
                <p
                  className="
                    text-lg
                    font-bold
                    text-white/70
                  "
                >
                  No hay productos
                </p>

                <p
                  className="
                    mt-2
                    text-sm
                    text-white/30
                  "
                >
                  No encontramos productos
                  disponibles.
                </p>
              </div>

            ) : (

              <div
                className="
                  grid
                  gap-5
                  sm:grid-cols-2
                  2xl:grid-cols-3
                "
              >

                {productos.map(
                  (product) => {
                    const available =
                      product.estado ===
                        "activo" &&
                      product.stock > 0;

                    return (
                      <article
                        key={product.id}
                        className="
                          group
                          overflow-hidden
                          rounded-3xl
                          border
                          border-white/8
                          bg-white/[0.035]
                          transition-all
                          duration-300

                          hover:-translate-y-1
                          hover:border-cyan-300/20
                          hover:bg-white/5.5
                        "
                      >

                        <div
                          className="
                            relative
                            aspect-16/10
                            overflow-hidden
                            bg-black
                          "
                        >
                          {product.imagen ? (
                            <img
                              src={getProductImageUrl(
                                product.imagen
                              )}
                              alt={
                                product.nombre
                              }
                              className="
                                h-full
                                w-full
                                object-cover
                                transition
                                duration-500
                                group-hover:scale-105
                              "
                            />
                          ) : (
                            <div
                              className="
                                flex
                                h-full
                                items-center
                                justify-center
                                bg-linear-to-br
                                from-cyan-500/10
                                to-violet-500/10
                                text-4xl
                              "
                            >
                              🎮
                            </div>
                          )}

                          <div
                            className="
                              absolute
                              inset-x-0
                              bottom-0
                              h-24
                              bg-linear-to-t
                              from-black
                              to-transparent
                            "
                          />

                          <span
                            className={`
                              absolute
                              left-4
                              top-4
                              rounded-full
                              border
                              px-3
                              py-1
                              text-[10px]
                              font-black
                              uppercase
                              tracking-[0.15em]

                              ${
                                available
                                  ? `
                                    border-emerald-300/20
                                    bg-emerald-400/15
                                    text-emerald-200
                                  `
                                  : `
                                    border-red-300/20
                                    bg-red-400/15
                                    text-red-200
                                  `
                              }
                            `}
                          >
                            {available
                              ? "Disponible"
                              : "Agotado"}
                          </span>
                        </div>


                        <div className="p-5">

                          <h3
                            className="
                              truncate
                              text-lg
                              font-bold
                            "
                          >
                            {product.nombre}
                          </h3>

                          <div
                            className="
                              mt-2
                              flex
                              items-center
                              justify-between
                              gap-3
                            "
                          >
                            <span
                              className="
                                text-xs
                                text-white/35
                              "
                            >
                              Stock:{" "}
                              {product.stock}
                            </span>

                            <span
                              className="
                                text-lg
                                font-black
                                text-cyan-300
                              "
                            >
                              $
                              {Number(
                                product.precio
                              ).toLocaleString(
                                "es-CO"
                              )}
                            </span>
                          </div>


                          <button
                            type="button"
                            onClick={() =>
                              addToCart(
                                product
                              )
                            }
                            disabled={
                              !available
                            }
                            className="
                              mt-5
                              w-full
                              rounded-xl
                              bg-linear-to-r
                              from-cyan-400
                              to-cyan-300
                              px-4
                              py-3
                              text-sm
                              font-black
                              text-[#041014]
                              shadow-lg
                              transition-all

                              hover:-translate-y-0.5
                              hover:shadow-cyan-400/20

                              disabled:cursor-not-allowed
                              disabled:from-white/10
                              disabled:to-white/10
                              disabled:text-white/30
                              disabled:shadow-none
                            "
                          >
                            {available
                              ? "Agregar a la venta"
                              : "Sin disponibilidad"}
                          </button>

                        </div>

                      </article>
                    );
                  }
                )}

              </div>
            )}
          </div>


          {/* CARRITO */}
          <aside
            className="
              h-fit
              rounded-[28px]
              border
              border-white/10
              bg-white/4
              p-5
              shadow-2xl
              backdrop-blur-xl
              xl:sticky
              xl:top-8
            "
          >

            <div
              className="
                flex
                items-start
                justify-between
                gap-3
              "
            >
              <div>
                <p
                  className="
                    text-xs
                    font-bold
                    uppercase
                    tracking-[0.18em]
                    text-violet-300/50
                  "
                >
                  Venta actual
                </p>

                <h2
                  className="
                    mt-2
                    text-2xl
                    font-black
                  "
                >
                  Carrito
                </h2>
              </div>

              <span
                className="
                  flex
                  h-10
                  min-w-10
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-violet-300/15
                  bg-violet-400/10
                  px-3
                  font-black
                  text-violet-200
                "
              >
                {totalUnits}
              </span>
            </div>


            {!carrito.length ? (

              <div
                className="
                  mt-8
                  rounded-2xl
                  border
                  border-dashed
                  border-white/10
                  bg-black/10
                  p-8
                  text-center
                "
              >
                <div className="text-4xl">
                  🛒
                </div>

                <p
                  className="
                    mt-4
                    text-sm
                    font-semibold
                    text-white/60
                  "
                >
                  Tu carrito está vacío
                </p>

                <p
                  className="
                    mt-2
                    text-xs
                    leading-5
                    text-white/25
                  "
                >
                  Selecciona productos del
                  catálogo para registrar una
                  venta.
                </p>
              </div>

            ) : (

              <div
                className="
                  mt-6
                  max-h-107.5
                  space-y-3
                  overflow-y-auto
                  pr-1
                "
              >

                {carrito.map(
                  (item) => (
                    <article
                      key={item.id}
                      className="
                        rounded-2xl
                        border
                        border-white/8
                        bg-black/15
                        p-4
                      "
                    >

                      <div
                        className="
                          flex
                          justify-between
                          gap-3
                        "
                      >
                        <div className="min-w-0">
                          <p
                            className="
                              truncate
                              text-sm
                              font-bold
                            "
                          >
                            {item.nombre}
                          </p>

                          <p
                            className="
                              mt-1
                              text-xs
                              text-white/30
                            "
                          >
                            $
                            {Number(
                              item.precio
                            ).toLocaleString(
                              "es-CO"
                            )}{" "}
                            c/u
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeFromCart(
                              item.id
                            )
                          }
                          className="
                            h-8
                            w-8
                            shrink-0
                            rounded-lg
                            bg-red-400/8
                            text-sm
                            text-red-300/70
                            transition
                            hover:bg-red-400/15
                            hover:text-red-200
                          "
                        >
                          ×
                        </button>
                      </div>


                      <div
                        className="
                          mt-4
                          flex
                          items-center
                          justify-between
                        "
                      >

                        <div
                          className="
                            flex
                            items-center
                            overflow-hidden
                            rounded-xl
                            border
                            border-white/8
                            bg-white/[0.035]
                          "
                        >
                          <button
                            type="button"
                            onClick={() =>
                              changeQuantity(
                                item.id,
                                -1
                              )
                            }
                            className="
                              flex
                              h-9
                              w-9
                              items-center
                              justify-center
                              text-white/50
                              transition
                              hover:bg-white/10
                              hover:text-white
                            "
                          >
                            −
                          </button>

                          <span
                            className="
                              flex
                              h-9
                              min-w-10
                              items-center
                              justify-center
                              border-x
                              border-white/8
                              px-2
                              text-sm
                              font-black
                            "
                          >
                            {item.cantidad}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              changeQuantity(
                                item.id,
                                1
                              )
                            }
                            className="
                              flex
                              h-9
                              w-9
                              items-center
                              justify-center
                              text-white/50
                              transition
                              hover:bg-white/10
                              hover:text-white
                            "
                          >
                            +
                          </button>
                        </div>


                        <p
                          className="
                            text-sm
                            font-black
                            text-cyan-300
                          "
                        >
                          $
                          {(
                            Number(
                              item.precio
                            ) *
                            item.cantidad
                          ).toLocaleString(
                            "es-CO"
                          )}
                        </p>

                      </div>

                    </article>
                  )
                )}

              </div>
            )}


            <div
              className="
                mt-6
                border-t
                border-white/8
                pt-5
              "
            >

              <div
                className="
                  flex
                  items-center
                  justify-between
                "
              >
                <div>
                  <p
                    className="
                      text-xs
                      uppercase
                      tracking-[0.15em]
                      text-white/30
                    "
                  >
                    Total
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-white/25
                    "
                  >
                    {totalUnits} unidades
                  </p>
                </div>

                <p
                  className="
                    text-3xl
                    font-black
                    text-emerald-300
                  "
                >
                  $
                  {total.toLocaleString(
                    "es-CO"
                  )}
                </p>
              </div>


              <button
                type="button"
                onClick={confirmSale}
                disabled={
                  saving ||
                  !carrito.length
                }
                className="
                  mt-5
                  w-full
                  rounded-xl
                  bg-linear-to-r
                  from-emerald-400
                  to-cyan-400
                  px-5
                  py-4
                  text-sm
                  font-black
                  uppercase
                  tracking-[0.08em]
                  text-[#03110e]
                  shadow-xl
                  transition-all

                  hover:-translate-y-0.5
                  hover:shadow-emerald-400/20

                  disabled:cursor-not-allowed
                  disabled:opacity-40
                  disabled:hover:translate-y-0
                "
              >
                {saving
                  ? "Registrando venta..."
                  : "Confirmar venta"}
              </button>

            </div>

          </aside>

        </section>

      </div>

    </main>
  );
}


export default EmpleadoDashboard;
