export interface Usuario {
  id: string;
  cedula: string;
  password_hash: string;
  nombre: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  is_admin: boolean;
  created_at: string;
}

export interface Vehiculo {
  id: string;
  usuario_cedula: string;
  // Datos del RUNT/Formulario
  placa: string;
  clase: string | null;
  modelo: string | null;
  cilindraje: string | null;
  marca: string | null;
  linea: string | null;
  color: string | null;
  combustible: string | null;
  servicio: string | null;
  transito: string | null;
  puertas: number | null;
  prenda: boolean | null;
  // Datos adicionales del usuario
  kilometraje: number | null;
  cojineria: string | null;
  rines: string | null;
  blindaje: boolean | null;
  nivel_blindaje: string | null;
  direccion_tipo: string | null;
  soat_vigente: string | null;
  rtm_vigente: string | null;
  vidrios: string | null;
  traccion: string | null;
  transmision: string | null;
  // Campos booleanos
  sunroof: boolean | null;
  radio: boolean | null;
  velocidad_crucero: boolean | null;
  aviso_luces: boolean | null;
  computador: boolean | null;
  frenos_abs: boolean | null;
  sensor_parqueo: boolean | null;
  camara_reversa: boolean | null;
  // Datos de contacto vendedor
  contacto_nombre: string | null;
  contacto_telefono: string | null;
  contacto_email: string | null;
  contacto_departamento: string | null;
  contacto_ciudad: string | null;
  // Metadata
  precio: number | null;
  descripcion: string | null;
  estado: string;
  created_at: string;
  updated_at: string;
  // Relaciones
  imagenes?: VehiculoImagen[];
}

export interface VehiculoImagen {
  id: string;
  vehiculo_id: string;
  url: string;
  orden: number;
  created_at: string;
}

export interface SessionData {
  cedula: string;
  nombre: string | null;
  is_admin: boolean;
}

export interface RuntResponse {
  success: boolean;
  data?: {
    placa: string;
    clase: string;
    modelo: string;
    cilindraje: string;
    marca: string;
    linea: string;
    color: string;
    combustible: string;
    servicio: string;
    transito: string;
    puertas: number;
    prenda: boolean;
  };
  error?: string;
}
