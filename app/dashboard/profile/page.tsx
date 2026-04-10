import { getProfile } from '@/lib/actions/profile'
import ProfileForm from './ProfileForm'

export default async function ProfilePage() {
  const profile = await getProfile()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Perfil del Autónomo</h1>
        <p className="text-gray-500 mt-2">Configura tus datos fiscales y logotipo. Estos se mostrarán en la cabecera de tus facturas enviadas a clientes.</p>
      </div>

      <ProfileForm initialData={profile} />
    </div>
  )
}
