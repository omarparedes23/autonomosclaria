import { getProfile } from '@/lib/actions/profile'
import ProfileForm from './ProfileForm'
import Link from 'next/link'

export default async function ProfilePage() {
  const profile = await getProfile()
  const isPro = (profile as any)?.plan === 'pro'

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Perfil del Autónomo</h1>
          <p className="text-gray-500 mt-2">Configura tus datos fiscales y logotipo. Estos se mostrarán en la cabecera de tus facturas.</p>
        </div>
        <div className="flex items-center gap-3 mt-1">
          {isPro ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-xs font-semibold rounded-full">
              Pro ✓
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1.5 border border-gray-200 text-gray-500 text-xs font-medium rounded-full">
                Free
              </span>
              <Link
                href="/pricing"
                className="inline-flex items-center px-3 py-1.5 bg-black text-white text-xs font-semibold rounded-full hover:bg-gray-800 transition-colors"
              >
                Actualizar a Pro →
              </Link>
            </div>
          )}
        </div>
      </div>

      <ProfileForm initialData={profile} />
    </div>
  )
}
