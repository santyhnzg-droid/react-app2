import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { Inicio } from "./pages/Inicio";
import { Productos } from "./pages/Productos";
import { Servicios } from "./pages/Servicios";
import { QuienesSomos } from "./pages/QuienesSomos";
import { Contacto } from "./pages/Contacto";
import { Login } from "./pages/Login";
import { RecoverPassword } from "./pages/RecoverPassword";
import { ProductoDetalle } from "./pages/ProductoDetalle";
import { CheckoutSuccess } from "./pages/CheckoutSuccess";
import { CheckoutCancel } from "./pages/CheckoutCancel";

import { AdminDashboard } from "./pages/admin/Dashboard";
import { ProductosAdmin } from "./pages/admin/ProductosAdmin";
import { UsuariosAdmin } from "./pages/admin/UsuariosAdmin";
import { ServiciosAdmin } from "./pages/admin/ServiciosAdmin";
import { VentasHistorial } from "./pages/admin/VentasHistorial";
import { FacturasAdmin } from "./pages/admin/FacturasAdmin";
import { VentasDashboard } from "./pages/admin/VentasDashboard";
import { PQRAdmin } from "./pages/admin/PQRAdmin";
import { PQRCliente } from "./pages/cliente/PQR";

import { EmpleadoDashboard } from "./pages/empleado/Dashboard";
import { ClienteDashboard } from "./pages/cliente/Dashboard";

import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { WhatsAppButton } from "./components/WhatsAppButton/WhatsAppButton";
import { ChatbotWidget } from "./components/Chatbot/ChatbotWidget";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/servicios" element={<Servicios />} />
        <Route path="/productos/:id" element={<ProductoDetalle />} />
        <Route
          path="/quienes-somos"
          element={<QuienesSomos />}
        />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/login" element={<Login />} />
        <Route path="/pago/exitoso" element={<CheckoutSuccess />} />
        <Route path="/pago/cancelado" element={<CheckoutCancel />} />

        <Route
          path="/recover-password"
          element={<RecoverPassword />}
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["Administrador"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/productos"
          element={
            <ProtectedRoute roles={["Administrador"]}>
              <ProductosAdmin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/usuarios"
          element={
            <ProtectedRoute roles={["Administrador"]}>
              <UsuariosAdmin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/servicios"
          element={
            <ProtectedRoute roles={["Administrador"]}>
              <ServiciosAdmin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ventas/historial"
          element={
            <ProtectedRoute roles={["Administrador", "Empleado"]}>
              <VentasHistorial />
            </ProtectedRoute>
          }
        />

        <Route
          path="/facturas"
          element={
            <ProtectedRoute roles={["Administrador", "Empleado"]}>
              <FacturasAdmin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ventas/dashboard"
          element={
            <ProtectedRoute roles={["Administrador", "Empleado"]}>
              <VentasDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/pqr"
          element={
            <ProtectedRoute roles={["Administrador", "Empleado"]}>
              <PQRAdmin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cliente/pqr"
          element={
            <ProtectedRoute roles={["Cliente"]}>
              <PQRCliente />
            </ProtectedRoute>
          }
        />

        <Route
          path="/empleado"
          element={
            <ProtectedRoute roles={["Empleado"]}>
              <EmpleadoDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cliente"
          element={
            <ProtectedRoute roles={["Cliente"]}>
              <ClienteDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>

      <WhatsAppButton />
      <ChatbotWidget />
    </BrowserRouter>
  );
}

export default App;
