'use client'

import { useState } from 'react'
import { updateProfile } from '@/lib/actions/profile'
import Image from 'next/image'

export default function ProfileForm({ initialData }: { initialData: any }) {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [preview, setPreview] = useState<string | null>(initialData?.logo_url || null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMsg({ type: '', text: '' })
    
    const formData = new FormData(e.currentTarget)
    
    const res = await updateProfile(formData)
    
    setLoading(false)
    if (res.error) {
      setMsg({ type: 'error', text: res.error })
    } else {
      setMsg({ type: 'success', text: 'Perfil actualizado exitosamente.' })
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPreview(URL.createObjectURL(file))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
      {msg.text && (
        <div className={`p-4 rounded-lg text-sm font-semibold ${msg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {msg.text}
        </div>
      )}

      <input type="hidden" name="current_logo_url" value={initialData?.logo_url || ''} />

      <div className="flex items-center space-x-6">
        <div className="shrink-0">
          {preview ? (
            <div className="h-24 w-24 object-cover rounded-full border border-gray-200 overflow-hidden relative">
              {/* Fallback to simple img if Next.js Image throws host errors without whitelist */}
              <img src={preview} alt="Logo preview" className="h-full w-full object-cover" />
            </div>
          ) : (
             <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
               Sin Logo
             </div>
          )}
        </div>
        <label className="block">
          <span className="sr-only">Elegir logo</span>
          <input 
            type="file" 
            name="logo" 
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800 transition-colors"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Fiscal o Comercial</label>
          <input required type="text" name="name" defaultValue={initialData?.name} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-black focus:border-black" placeholder="Ej. Juan Pérez" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">NIF / CIF</label>
          <input required type="text" name="nif" defaultValue={initialData?.nif} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-black focus:border-black" placeholder="12345678A" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Dirección Fiscal Completa</label>
        <textarea required name="fiscal_address" defaultValue={initialData?.fiscal_address} rows={3} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-black focus:border-black" placeholder="Calle Ejemplo 123, 28001 Madrid" />
      </div>

      <div className="pt-4 flex justify-end">
        <button type="submit" disabled={loading} className="bg-black text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50">
          {loading ? 'Guardando...' : 'Guardar Perfil'}
        </button>
      </div>
    </form>
  )
}
