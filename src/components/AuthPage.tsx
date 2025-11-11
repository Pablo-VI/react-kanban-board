// src/components/AuthPage.tsx
import React, { useState } from "react";
import { supabase } from "../supabase";
import { toast } from "react-hot-toast";

const EmailIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
    />
  </svg>
);

const LockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
    />
  </svg>
);

const GoogleIcon = () => (
  <svg
    className="w-5 h-5 mr-2"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
  >
    <path
      fill="#FFC107"
      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
    ></path>
    <path
      fill="#FF3D00"
      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
    ></path>
    <path
      fill="#4CAF50"
      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
    ></path>
    <path
      fill="#1976D2"
      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.71,36.438,44,30.85,44,24C44,22.659,43.862,21.35,43.611,20.083z"
    ></path>
  </svg>
);

const GitHubIcon = () => (
  <svg
    className="w-5 h-5 mr-2"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    fill="currentColor"
  >
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path>
  </svg>
);

const EyeOpenIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
    />
  </svg>
);

const EyeClosedIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L6.228 6.228"
    />
  </svg>
);

function translateAuthError(message: string): string {
  if (message.includes("Invalid login credentials")) {
    return "Credenciales inválidas. Revisa tu email y contraseña.";
  }
  if (message.includes("Email not confirmed")) {
    return "Email no confirmado. Por favor, revisa tu bandeja de entrada.";
  }
  if (message.includes("User already registered")) {
    return "Este email ya está registrado. Intenta iniciar sesión.";
  }
  if (message.includes("Unable to validate email address: invalid format")) {
    return "El formato del email no es válido.";
  }
  if (message.includes("Signup requires a valid password")) {
    return "La contraseña no puede estar vacía.";
  }
  if (
    message.includes("Password should contain at least one character of each")
  ) {
    return "La contraseña no es segura. Debe contener al menos: una minúscula, una mayúscula, un número y un símbolo (ej. !@#$%).";
  }
  if (message.includes("Password should be at least 8 characters")) {
    return "La contraseña debe tener al menos 8 caracteres.";
  }
  if (message.includes("Email rate limit exceeded")) {
    return "Has superado el límite de intentos. Por favor, espera un momento.";
  }
  if (message.includes("Too many requests")) {
    return "Demasiadas solicitudes. Por favor, inténtalo de nuevo más tarde.";
  }
  if (message.includes("OAuth state cookie not found")) {
    return "Error de autenticación (cookie no encontrada). Por favor, inténtalo de nuevo.";
  }
  if (message.includes("Error getting user from external provider")) {
    return "No se pudo obtener la información de tu proveedor (Google, GitHub, etc.).";
  }
  if (message.includes("NetworkError when attempting to fetch resource")) {
    return "Error de red. No se pudo conectar con el servidor.";
  }
  console.error("Error de Supabase no traducido:", message);
  return "Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.";
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function AuthPage() {
  const [tab, setTab] = useState<"signup" | "login">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!EMAIL_REGEX.test(email)) {
      toast.error(
        "El formato del email no es válido (ej. usuario@dominio.com)"
      );
      return;
    }

    setLoading(true);

    try {
      if (tab === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;

        toast.success("¡Registro exitoso!");

        setTab("login");
        setShowPassword(false);
      } else {
        sessionStorage.setItem("login_event", "true");
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          sessionStorage.removeItem("login_event");
          throw signInError;
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        const friendlyMessage = translateAuthError(err.message);
        toast.error(friendlyMessage);
      } else {
        toast.error("Ocurrió un error inesperado");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: "google" | "github") => {
    setLoading(true);
    sessionStorage.setItem("login_event", "true");
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: provider,
    });
    if (oauthError) {
      sessionStorage.removeItem("login_event");
      const friendlyMessage = translateAuthError(oauthError.message);
      toast.error(friendlyMessage);
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-black min-h-screen flex items-center justify-center font-sans">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-zinc-800 rounded-lg overflow-hidden shadow-2xl border border-zinc-700">
          <div className="text-center py-6 bg-gradient-to-r from-blue-700 to-purple-800 text-white">
            <h1 className="text-3xl font-bold">¡Bienvenido!</h1>
            <p className="mt-2 text-zinc-300">Únete a tu espacio de trabajo</p>
          </div>

          <div className="p-8">
            <div className="flex justify-center mb-6">
              <button
                onClick={() => {
                  setTab("signup");
                  setShowPassword(false);
                }}
                className={`px-4 py-2 rounded-l-md focus:outline-none transition-colors duration-300 ${
                  tab === "signup"
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                }`}
              >
                Registrarse
              </button>
              <button
                onClick={() => {
                  setTab("login");
                  setShowPassword(false);
                }}
                className={`px-4 py-2 rounded-r-md focus:outline-none transition-colors duration-300 ${
                  tab === "login"
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                }`}
              >
                Iniciar Sesión
              </button>
            </div>

            {tab === "signup" && (
              <form onSubmit={handleAuth} className="space-y-4" noValidate>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-zinc-400">
                    <EmailIcon />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 text-zinc-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10 placeholder-zinc-400"
                    placeholder="Email"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-zinc-400">
                    <LockIcon />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 text-zinc-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10 pr-10 placeholder-zinc-400"
                    placeholder="Contraseña"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-200 focus:outline-none"
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                  >
                    {showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-700 text-white py-2 rounded-md hover:opacity-90 transition-opacity duration-300 disabled:opacity-50"
                >
                  {loading ? "Registrando..." : "Crear Cuenta"}
                </button>
              </form>
            )}

            {tab === "login" && (
              <form onSubmit={handleAuth} className="space-y-4" noValidate>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-zinc-400">
                    <EmailIcon />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 text-zinc-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10 placeholder-zinc-400"
                    placeholder="Email"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-zinc-400">
                    <LockIcon />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 text-zinc-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10 pr-10 placeholder-zinc-400"
                    placeholder="Contraseña"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-200 focus:outline-none"
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                  >
                    {showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-700 text-white py-2 rounded-md hover:opacity-90 transition-opacity duration-300 disabled:opacity-50"
                >
                  {loading ? "Iniciando..." : "Iniciar Sesión"}
                </button>
              </form>
            )}

            <div className="mt-6">
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-zinc-800 text-zinc-400">
                    O continuar con
                  </span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={() => handleOAuthLogin("google")}
                  disabled={loading}
                  className="flex items-center justify-center w-full sm:w-auto bg-zinc-700 text-white px-4 py-2 rounded-md hover:bg-zinc-600 transition-colors duration-300 disabled:opacity-50"
                >
                  <GoogleIcon /> Google
                </button>
                <button
                  onClick={() => handleOAuthLogin("github")}
                  disabled={loading}
                  className="flex items-center justify-center w-full sm:w-auto bg-zinc-900 border border-zinc-700 text-white px-4 py-2 rounded-md hover:bg-black transition-colors duration-300 disabled:opacity-50"
                >
                  <GitHubIcon /> GitHub
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
