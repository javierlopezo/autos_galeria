'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Vehiculo, VehiculoImagen } from '@/types';
import ImageUploader from './ImageUploader';

interface VehiculoFormProps {
  vehiculo?: Vehiculo;
  isEditing?: boolean;
}

interface PendingImage {
  file: File;
  preview: string;
}

const CLASES = ['Automovil', 'Camioneta', 'Campero', 'Microbus', 'Bus', 'Camion', 'Motocicleta'];
const COMBUSTIBLES = ['Gasolina', 'Diesel', 'Hibrido', 'Electrico', 'Gas Natural'];
const SERVICIOS = ['Particular', 'Publico', 'Diplomatico', 'Oficial'];
const TRANSMISIONES = ['Automatica', 'Manual', 'CVT', 'Doble embrague'];
const TRACCIONES = ['4x2', '4x4', 'AWD', 'RWD', 'FWD'];
const COJINERIAS = ['Cuero', 'Tela', 'Semi-cuero', 'Vinilo'];
const RINES = ['Acero', 'Aluminio', 'Aleacion'];
const DIRECCIONES = ['Hidraulica', 'Electroasistida', 'Mecanica'];
const VIDRIOS = ['Electricos', 'Manuales'];

// Departamentos y ciudades de Colombia
const DEPARTAMENTOS_CIUDADES: Record<string, string[]> = {
  'Amazonas': ['Leticia'],
  'Antioquia': ['Medellin', 'Bello', 'Itagui', 'Envigado', 'Rionegro', 'Apartado', 'Turbo'],
  'Arauca': ['Arauca', 'Saravena'],
  'Atlantico': ['Barranquilla', 'Soledad', 'Malambo', 'Sabanalarga'],
  'Bolivar': ['Cartagena', 'Magangue', 'Turbaco'],
  'Boyaca': ['Tunja', 'Duitama', 'Sogamoso', 'Chiquinquira'],
  'Caldas': ['Manizales', 'La Dorada', 'Chinchina'],
  'Caqueta': ['Florencia'],
  'Casanare': ['Yopal', 'Aguazul', 'Villanueva'],
  'Cauca': ['Popayan', 'Santander de Quilichao'],
  'Cesar': ['Valledupar', 'Aguachica'],
  'Choco': ['Quibdo'],
  'Cordoba': ['Monteria', 'Cerete', 'Lorica'],
  'Cundinamarca': ['Bogota', 'Soacha', 'Zipaquira', 'Facatativa', 'Chia', 'Fusagasuga', 'Girardot', 'Madrid', 'Mosquera'],
  'Guainia': ['Inirida'],
  'Guaviare': ['San Jose del Guaviare'],
  'Huila': ['Neiva', 'Pitalito', 'Garzon'],
  'La Guajira': ['Riohacha', 'Maicao'],
  'Magdalena': ['Santa Marta', 'Cienaga'],
  'Meta': ['Villavicencio', 'Acacias', 'Granada'],
  'Narino': ['Pasto', 'Tumaco', 'Ipiales'],
  'Norte de Santander': ['Cucuta', 'Ocana', 'Pamplona'],
  'Putumayo': ['Mocoa', 'Puerto Asis'],
  'Quindio': ['Armenia', 'Calarca'],
  'Risaralda': ['Pereira', 'Dosquebradas', 'Santa Rosa de Cabal'],
  'San Andres y Providencia': ['San Andres'],
  'Santander': ['Bucaramanga', 'Floridablanca', 'Giron', 'Piedecuesta', 'Barrancabermeja'],
  'Sucre': ['Sincelejo', 'Corozal'],
  'Tolima': ['Ibague', 'Espinal', 'Melgar'],
  'Valle del Cauca': ['Cali', 'Buenaventura', 'Palmira', 'Tulua', 'Buga', 'Cartago', 'Jamundi'],
  'Vaupes': ['Mitu'],
  'Vichada': ['Puerto Carreno'],
};

export default function VehiculoForm({ vehiculo, isEditing = false }: VehiculoFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [consultandoRunt, setConsultandoRunt] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManualForm, setShowManualForm] = useState(isEditing);
  const [imagenes, setImagenes] = useState<VehiculoImagen[]>(vehiculo?.imagenes || []);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    // Datos RUNT
    placa: vehiculo?.placa || '',
    clase: vehiculo?.clase || '',
    modelo: vehiculo?.modelo || '',
    cilindraje: vehiculo?.cilindraje || '',
    marca: vehiculo?.marca || '',
    linea: vehiculo?.linea || '',
    color: vehiculo?.color || '',
    combustible: vehiculo?.combustible || '',
    servicio: vehiculo?.servicio || '',
    transito: vehiculo?.transito || '',
    puertas: vehiculo?.puertas || 4,
    prenda: vehiculo?.prenda || false,
    // Datos adicionales
    kilometraje: vehiculo?.kilometraje || 0,
    cojineria: vehiculo?.cojineria || '',
    rines: vehiculo?.rines || '',
    blindaje: vehiculo?.blindaje || false,
    nivel_blindaje: vehiculo?.nivel_blindaje || '',
    direccion_tipo: vehiculo?.direccion_tipo || '',
    soat_vigente: vehiculo?.soat_vigente || '',
    rtm_vigente: vehiculo?.rtm_vigente || '',
    vidrios: vehiculo?.vidrios || '',
    traccion: vehiculo?.traccion || '',
    transmision: vehiculo?.transmision || '',
    // Booleanos
    sunroof: vehiculo?.sunroof || false,
    radio: vehiculo?.radio || false,
    velocidad_crucero: vehiculo?.velocidad_crucero || false,
    aviso_luces: vehiculo?.aviso_luces || false,
    computador: vehiculo?.computador || false,
    frenos_abs: vehiculo?.frenos_abs || false,
    sensor_parqueo: vehiculo?.sensor_parqueo || false,
    camara_reversa: vehiculo?.camara_reversa || false,
    // Contacto
    contacto_nombre: vehiculo?.contacto_nombre || '',
    contacto_telefono: vehiculo?.contacto_telefono || '',
    contacto_email: vehiculo?.contacto_email || '',
    contacto_departamento: vehiculo?.contacto_departamento || '',
    contacto_ciudad: vehiculo?.contacto_ciudad || '',
    // Metadata
    precio: vehiculo?.precio || 0,
    descripcion: vehiculo?.descripcion || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const consultarRunt = async () => {
    if (!formData.placa) {
      setError('Ingrese la placa del vehiculo');
      return;
    }

    setConsultandoRunt(true);
    setError(null);

    try {
      const res = await fetch('/api/runt/consulta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placa: formData.placa,
          cedula: '', // Se obtiene de la sesion en el servidor
        }),
      });

      const data = await res.json();

      if (data.success && data.data) {
        setFormData(prev => ({
          ...prev,
          ...data.data,
        }));
        setShowManualForm(true);
      } else {
        setError(data.error || 'No se encontro informacion en el RUNT');
        setShowManualForm(true);
      }
    } catch (err) {
      console.error('RUNT error:', err);
      setError('Error al consultar RUNT. Ingrese los datos manualmente.');
      setShowManualForm(true);
    } finally {
      setConsultandoRunt(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = '/api/vehiculos';
      const method = isEditing ? 'PUT' : 'POST';
      const body = isEditing ? { ...formData, id: vehiculo?.id } : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        // Si hay imagenes pendientes y es un vehiculo nuevo, subirlas
        if (!isEditing && pendingImages.length > 0) {
          await uploadPendingImages(data.vehiculo.id);
        }

        // Si hay imagenes marcadas para eliminar (modo edicion), eliminarlas
        if (isEditing && imagesToDelete.length > 0) {
          await deleteMarkedImages();
        }

        router.push('/mis-vehiculos');
        router.refresh();
      } else {
        setError(data.error || 'Error al guardar vehiculo');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('Error al guardar vehiculo');
    } finally {
      setLoading(false);
    }
  };

  const handleImageAdded = (imagen: VehiculoImagen) => {
    setImagenes(prev => [...prev, imagen]);
  };

  const handleImageRemoved = (imagenId: string) => {
    // Quitar del estado local
    setImagenes(prev => prev.filter(img => img.id !== imagenId));
    // Marcar para eliminar del servidor al guardar
    setImagesToDelete(prev => [...prev, imagenId]);
  };

  // Eliminar imagenes marcadas del servidor
  const deleteMarkedImages = async () => {
    for (const imagenId of imagesToDelete) {
      try {
        await fetch(`/api/vehiculos/imagenes?id=${imagenId}`, {
          method: 'DELETE',
        });
      } catch (err) {
        console.error('Error deleting image:', err);
      }
    }
  };

  // Manejar seleccion de imagenes pendientes (para vehiculos nuevos)
  const handlePendingImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: PendingImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validar tipo
      if (!file.type.startsWith('image/')) {
        setError('Solo se permiten archivos de imagen');
        continue;
      }

      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Las imagenes no pueden superar 5MB');
        continue;
      }

      newImages.push({
        file,
        preview: URL.createObjectURL(file),
      });
    }

    setPendingImages(prev => [...prev, ...newImages]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePendingImage = (index: number) => {
    setPendingImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  // Subir imagenes pendientes al servidor
  const uploadPendingImages = async (vehiculoId: string) => {
    for (const pending of pendingImages) {
      try {
        const formData = new FormData();
        formData.append('file', pending.file);
        formData.append('vehiculo_id', vehiculoId);

        await fetch('/api/vehiculos/imagenes', {
          method: 'POST',
          body: formData,
        });
      } catch (err) {
        console.error('Error uploading image:', err);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Consulta RUNT */}
      {!isEditing && !showManualForm && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Consultar datos del vehiculo</h2>
          <p className="text-gray-600 mb-4">
            Ingrese la placa para consultar los datos del vehiculo en el RUNT.
          </p>
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                name="placa"
                value={formData.placa}
                onChange={handleChange}
                placeholder="Ej: ABC123"
                className="input uppercase"
                maxLength={6}
              />
            </div>
            <button
              type="button"
              onClick={consultarRunt}
              disabled={consultandoRunt}
              className="btn btn-primary"
            >
              {consultandoRunt ? 'Consultando...' : 'Consultar RUNT'}
            </button>
            <button
              type="button"
              onClick={() => setShowManualForm(true)}
              className="btn btn-secondary"
            >
              Ingresar manualmente
            </button>
          </div>
        </div>
      )}

      {/* Formulario completo */}
      {showManualForm && (
        <>
          {/* Datos del vehiculo (RUNT) */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Datos del vehiculo</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Placa *</label>
                <input
                  type="text"
                  name="placa"
                  value={formData.placa}
                  onChange={handleChange}
                  className="input uppercase"
                  required
                  maxLength={6}
                  disabled={isEditing}
                />
              </div>
              <div>
                <label className="label">Clase</label>
                <select name="clase" value={formData.clase} onChange={handleChange} className="input">
                  <option value="">Seleccionar</option>
                  {CLASES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Modelo (Ano)</label>
                <input
                  type="number"
                  name="modelo"
                  value={formData.modelo}
                  onChange={handleChange}
                  className="input"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
              </div>
              <div>
                <label className="label">Marca</label>
                <input
                  type="text"
                  name="marca"
                  value={formData.marca}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Linea</label>
                <input
                  type="text"
                  name="linea"
                  value={formData.linea}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Cilindraje (cc)</label>
                <input
                  type="text"
                  name="cilindraje"
                  value={formData.cilindraje}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Color</label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Combustible</label>
                <select name="combustible" value={formData.combustible} onChange={handleChange} className="input">
                  <option value="">Seleccionar</option>
                  {COMBUSTIBLES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Servicio</label>
                <select name="servicio" value={formData.servicio} onChange={handleChange} className="input">
                  <option value="">Seleccionar</option>
                  {SERVICIOS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Transito</label>
                <input
                  type="text"
                  name="transito"
                  value={formData.transito}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Puertas/capacidad</label>
                <input
                  type="number"
                  name="puertas"
                  value={formData.puertas}
                  onChange={handleChange}
                  className="input"
                  min="2"
                  max="5"
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  name="prenda"
                  checked={formData.prenda}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <label className="text-sm">Tiene prenda</label>
              </div>
            </div>
          </div>

          {/* Datos adicionales */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Especificaciones adicionales</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Kilometraje</label>
                <input
                  type="number"
                  name="kilometraje"
                  value={formData.kilometraje}
                  onChange={handleChange}
                  className="input"
                  min="0"
                />
              </div>
              <div>
                <label className="label">Cojineria</label>
                <select name="cojineria" value={formData.cojineria} onChange={handleChange} className="input">
                  <option value="">Seleccionar</option>
                  {COJINERIAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Rines</label>
                <select name="rines" value={formData.rines} onChange={handleChange} className="input">
                  <option value="">Seleccionar</option>
                  {RINES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Direccion</label>
                <select name="direccion_tipo" value={formData.direccion_tipo} onChange={handleChange} className="input">
                  <option value="">Seleccionar</option>
                  {DIRECCIONES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Traccion</label>
                <select name="traccion" value={formData.traccion} onChange={handleChange} className="input">
                  <option value="">Seleccionar</option>
                  {TRACCIONES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Transmision</label>
                <select name="transmision" value={formData.transmision} onChange={handleChange} className="input">
                  <option value="">Seleccionar</option>
                  {TRANSMISIONES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Vidrios</label>
                <select name="vidrios" value={formData.vidrios} onChange={handleChange} className="input">
                  <option value="">Seleccionar</option>
                  {VIDRIOS.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="label">SOAT vigente hasta</label>
                <input
                  type="date"
                  name="soat_vigente"
                  value={formData.soat_vigente}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div>
                <label className="label">RTM vigente hasta</label>
                <input
                  type="date"
                  name="rtm_vigente"
                  value={formData.rtm_vigente}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  name="blindaje"
                  checked={formData.blindaje}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <label className="text-sm">Blindado</label>
              </div>
              {formData.blindaje && (
                <div>
                  <label className="label">Nivel de blindaje</label>
                  <input
                    type="text"
                    name="nivel_blindaje"
                    value={formData.nivel_blindaje}
                    onChange={handleChange}
                    placeholder="Ej: B4, B6"
                    className="input"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Equipamiento */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Equipamiento</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'sunroof', label: 'Sunroof' },
                { name: 'radio', label: 'Radio' },
                { name: 'velocidad_crucero', label: 'Velocidad crucero' },
                { name: 'aviso_luces', label: 'Aviso de luces' },
                { name: 'computador', label: 'Computador de viaje' },
                { name: 'frenos_abs', label: 'Frenos ABS' },
                { name: 'sensor_parqueo', label: 'Sensor de parqueo' },
                { name: 'camara_reversa', label: 'Camara de reversa' },
              ].map(item => (
                <label key={item.name} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name={item.name}
                    checked={formData[item.name as keyof typeof formData] as boolean}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Precio y descripcion */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Precio y descripcion</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Precio (COP)</label>
                <input
                  type="number"
                  name="precio"
                  value={formData.precio}
                  onChange={handleChange}
                  className="input"
                  min="0"
                  step="100000"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="label">Descripcion adicional</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                className="input min-h-[100px]"
                placeholder="Describa el estado general del vehiculo, mantenimientos realizados, etc."
              />
            </div>
          </div>

          {/* Datos de contacto */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Datos de contacto</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Nombre *</label>
                <input
                  type="text"
                  name="contacto_nombre"
                  value={formData.contacto_nombre}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Telefono *</label>
                <input
                  type="tel"
                  name="contacto_telefono"
                  value={formData.contacto_telefono}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  name="contacto_email"
                  value={formData.contacto_email}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Departamento *</label>
                <select
                  name="contacto_departamento"
                  value={formData.contacto_departamento}
                  onChange={(e) => {
                    const newDepto = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      contacto_departamento: newDepto,
                      // Resetear ciudad si no pertenece al nuevo departamento
                      contacto_ciudad: '',
                    }));
                  }}
                  className="input"
                  required
                >
                  <option value="">Seleccionar departamento</option>
                  {Object.keys(DEPARTAMENTOS_CIUDADES).sort().map(depto => (
                    <option key={depto} value={depto}>{depto}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Ciudad *</label>
                <select
                  name="contacto_ciudad"
                  value={formData.contacto_ciudad}
                  onChange={handleChange}
                  className="input"
                  required
                  disabled={!formData.contacto_departamento}
                >
                  <option value="">
                    {formData.contacto_departamento ? 'Seleccionar ciudad' : 'Primero seleccione departamento'}
                  </option>
                  {formData.contacto_departamento &&
                    DEPARTAMENTOS_CIUDADES[formData.contacto_departamento]?.map(ciudad => (
                      <option key={ciudad} value={ciudad}>{ciudad}</option>
                    ))
                  }
                </select>
              </div>
            </div>
          </div>

          {/* Imagenes del vehiculo */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Imagenes del vehiculo</h2>
            {isEditing && vehiculo ? (
              <ImageUploader
                vehiculoId={vehiculo.id}
                imagenes={imagenes}
                onImageAdded={handleImageAdded}
                onImageRemoved={handleImageRemoved}
              />
            ) : (
              <div className="space-y-4">
                {/* Selector de archivos */}
                <div className="flex items-center gap-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePendingImageSelect}
                    className="hidden"
                    id="pending-image-upload"
                  />
                  <label
                    htmlFor="pending-image-upload"
                    className="btn btn-outline cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Agregar imagenes
                  </label>
                  <span className="text-sm text-gray-500">
                    {pendingImages.length} imagen(es) seleccionada(s) | Max 5MB por imagen
                  </span>
                </div>

                {/* Previsualizacion de imagenes pendientes */}
                {pendingImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {pendingImages.map((img, index) => (
                      <div key={index} className="relative group">
                        <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden">
                          <Image
                            src={img.preview}
                            alt={`Imagen ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                          {index === 0 && (
                            <span className="absolute top-1 left-1 bg-[#A8004A] text-white text-xs px-2 py-0.5 rounded">
                              Principal
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemovePendingImage(index)}
                          className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Eliminar imagen"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {pendingImages.length === 0 && (
                  <p className="text-sm text-gray-500">
                    Las imagenes se guardaran junto con el vehiculo al publicar.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Guardando...' : isEditing ? 'Actualizar vehiculo' : 'Publicar vehiculo'}
            </button>
          </div>
        </>
      )}
    </form>
  );
}
