import { useEffect, useState } from "react";
import {
  registrarUsuario,
} from "../../services/api";
import { Input } from "../forms/Input";
import { Select } from "../forms/Select";
import { Button } from "../forms/Button";

const initialForm = {
  nombre: "",
  apellido: "",
  tipoDocumento: "",
  numeroDocumento: "",
  direccion: "",
  telefono: "",
  email: "",
  password: "",
  passwordConfirmation: "",
};

const initialErrors = {
  nombre: "",
  apellido: "",
  tipoDocumento: "",
  numeroDocumento: "",
  direccion: "",
  telefono: "",
  email: "",
  password: "",
  passwordConfirmation: "",
};

export function RegisterModal({ isOpen, onClose }) {
  const [form, setForm] = useState(initialForm);

  const [errors, setErrors] = useState(initialErrors);

  const [success, setSuccess] = useState(false);

  const documentOptions = [
    {
      value: "CC",
      label: "Cédula de ciudadanía",
    },

    {
      value: "TI",
      label: "Tarjeta de identidad",
    },

    {
      value: "CE",
      label: "Cédula de extranjería",
    },

    {
      value: "PAS",
      label: "Pasaporte",
    },
  ];

  const validateField = (name, value, currentForm = form) => {
    switch (name) {
      case "nombre": {
        if (!value.trim()) {
          return "El nombre es obligatorio.";
        }

        if (value.length < 2) {
          return "Debe tener mínimo 2 caracteres.";
        }

        const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/;

        if (!regex.test(value)) {
          return "Solo se permiten letras.";
        }

        return "";
      }

      case "apellido": {
        if (!value.trim()) {
          return "El apellido es obligatorio.";
        }

        if (value.length < 2) {
          return "Debe tener mínimo 2 caracteres.";
        }

        const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/;

        if (!regex.test(value)) {
          return "Solo se permiten letras.";
        }

        return "";
      }

      case "tipoDocumento": {
        if (!value) {
          return "Selecciona un tipo de documento.";
        }

        return "";
      }

      case "numeroDocumento": {
        if (!value.trim()) {
          return "El documento es obligatorio.";
        }

        const regex = /^[0-9]{6,12}$/;

        if (!regex.test(value)) {
          return "Debe tener entre 6 y 12 números.";
        }

        return "";
      }

      case "direccion": {
        if (!value.trim()) {
          return "La dirección es obligatoria.";
        }

        if (value.length < 5) {
          return "Debe tener mínimo 5 caracteres.";
        }

        return "";
      }

      case "telefono": {
        if (!value.trim()) {
          return "El teléfono es obligatorio.";
        }

        const regex = /^[0-9]{10}$/;

        if (!regex.test(value)) {
          return "Debe contener exactamente 10 números.";
        }

        return "";
      }

      case "email": {
        if (!value.trim()) {
          return "El correo es obligatorio.";
        }

        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!regex.test(value)) {
          return "Ingresa un correo válido.";
        }

        return "";
      }

      case "password": {
        if (!value) {
          return "La contraseña es obligatoria.";
        }

        if (value.length < 8) {
          return "Debe tener mínimo 8 caracteres.";
        }

        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,30}$/;

        if (!regex.test(value)) {
          return "Debe incluir mayúscula, minúscula y número.";
        }

        return "";
      }

      case "passwordConfirmation": {
        if (!value) {
          return "Confirma la contraseña.";
        }

        if (value !== currentForm.password) {
          return "Las contraseñas no coinciden.";
        }

        return "";
      }

      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    let cleanValue = value;

    if (name === "numeroDocumento" || name === "telefono") {
      cleanValue = value.replace(/\D/g, "");
    }

    const updatedForm = {
      ...form,
      [name]: cleanValue,
    };

    setForm(updatedForm);

    setErrors((prev) => ({
      ...prev,

      [name]: validateField(name, cleanValue, updatedForm),
    }));

    if (name === "password" && updatedForm.passwordConfirmation) {
      setErrors((prev) => ({
        ...prev,

        passwordConfirmation: validateField(
          "passwordConfirmation",
          updatedForm.passwordConfirmation,
          updatedForm,
        ),
      }));
    }

    setSuccess(false);
  };

  const validateForm = () => {
    const newErrors = {};

    Object.keys(form).forEach((field) => {
      newErrors[field] = validateField(field, form[field], form);
    });

    setErrors(newErrors);

    return !Object.values(newErrors).some(Boolean);
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const isValid =
    validateForm();

  if (!isValid) {
    return;
  }

  try {
    const data = {
      nombre:
        form.nombre,

      apellido:
        form.apellido,

      tipo_documento:
        form.tipoDocumento,

      numero_documento:
        form.numeroDocumento,

      direccion:
        form.direccion,

      telefono:
        form.telefono,

      email:
        form.email,

      password:
        form.password,
    };

    await registrarUsuario(
      data
    );

    setSuccess(true);

    setForm(initialForm);

    setErrors(
      initialErrors
    );
  } catch (error) {
    alert(
      error.message
    );
  }
};

  const handleClose = () => {
    setForm(initialForm);

    setErrors(initialErrors);

    setSuccess(false);

    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);

      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-md"
      onMouseDown={handleClose}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-[#080b11]/95 p-6 text-white shadow-[0_35px_120px_rgba(0,0,0,0.65)] backdrop-blur-2xl md:p-9"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-cyan-500/[0.07] blur-[100px]" />

        <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-violet-600/8 blur-[100px]" />

        <button
          type="button"
          onClick={handleClose}
          aria-label="Cerrar modal"
          className="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xl text-white/60 backdrop-blur-xl transition hover:border-red-400/30 hover:bg-red-400/8 hover:text-white"
        >
          ×
        </button>

        <div className="relative z-10 mb-8 pr-12">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/60">
            Nuevo jugador
          </p>

          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Crear una cuenta
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-white/35">
            Completa tus datos para registrarte en GameZone.
          </p>
        </div>

        {success && (
          <div className="relative z-10 mb-6 rounded-xl border border-emerald-400/20 bg-emerald-400/6 px-4 py-3 text-sm text-emerald-300">
            Registro realizado correctamente.
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="relative z-10 grid grid-cols-1 gap-x-5 gap-y-3 md:grid-cols-2"
        >
          <Input
            label="Nombre"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Ej. Juan"
            error={errors.nombre}
            maxLength={40}
            required
          />

          <Input
            label="Apellido"
            name="apellido"
            value={form.apellido}
            onChange={handleChange}
            placeholder="Ej. Pérez"
            error={errors.apellido}
            maxLength={40}
            required
          />

          <Select
            label="Tipo de documento"
            name="tipoDocumento"
            value={form.tipoDocumento}
            onChange={handleChange}
            options={documentOptions}
            error={errors.tipoDocumento}
            required
          />

          <Input
            label="Número de documento"
            name="numeroDocumento"
            value={form.numeroDocumento}
            onChange={handleChange}
            placeholder="1020304050"
            error={errors.numeroDocumento}
            maxLength={12}
            required
          />

          <div className="md:col-span-2">
            <Input
              label="Dirección"
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              placeholder="Calle 10 # 20-30"
              error={errors.direccion}
              maxLength={100}
              required
            />
          </div>

          <Input
            label="Teléfono"
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
            placeholder="3001234567"
            error={errors.telefono}
            maxLength={10}
            required
          />

          <Input
            label="Correo electrónico"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="correo@ejemplo.com"
            error={errors.email}
            maxLength={100}
            required
          />

          <Input
            label="Contraseña"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Mínimo 8 caracteres"
            error={errors.password}
            maxLength={30}
            required
          />

          <Input
            label="Confirmar contraseña"
            type="password"
            name="passwordConfirmation"
            value={form.passwordConfirmation}
            onChange={handleChange}
            placeholder="Repite la contraseña"
            error={errors.passwordConfirmation}
            maxLength={30}
            required
          />

          <div className="md:col-span-2 rounded-xl border border-white/6 bg-white/2.5 px-4 py-3">
            <p className="text-xs leading-5 text-white/30">
              La contraseña debe contener mínimo 8 caracteres, una mayúscula,
              una minúscula y un número.
            </p>
          </div>

          <div className="pt-3 md:col-span-2">
            <Button type="submit">Crear cuenta</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
