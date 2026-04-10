import { signupUser } from '@/lib/actions/auth'
import Link from 'next/link'

export default async function RegisterPage(props: { searchParams: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
      <div className="z-10 w-full max-w-md overflow-hidden rounded-2xl border border-gray-100 shadow-xl">
        <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-200 bg-white px-4 py-6 pt-8 text-center sm:px-16">
          <h3 className="text-xl font-semibold">Crear cuenta en Claria</h3>
          <p className="text-sm text-gray-500">Empieza a facturar de forma profesional</p>
        </div>

        {searchParams?.error && (
          <div className="bg-red-50 p-4 border-b border-red-100">
            <p className="text-sm text-red-600 text-center">{searchParams.error}</p>
          </div>
        )}

        <div className="flex flex-col space-y-4 bg-gray-50 px-4 py-8 sm:px-16">
          <form action={signupUser} className="flex flex-col space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs font-medium text-gray-700">
                Nombre Completo
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Pedro Sánchez"
                autoComplete="name"
                required
                className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-700">
                Correo Electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="pedro@ejemplo.com"
                autoComplete="email"
                required
                className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-700">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                minLength={6}
                required
                className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="confirm_password" className="block text-xs font-medium text-gray-700">
                Confirmar Contraseña
              </label>
              <input
                id="confirm_password"
                name="confirm_password"
                type="password"
                minLength={6}
                required
                className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="flex h-10 w-full items-center justify-center rounded-md bg-black text-sm font-semibold text-white transition-all hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              >
                Crear Cuenta
              </button>
            </div>
          </form>

          <p className="text-center text-sm text-gray-500">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="font-semibold text-black hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
