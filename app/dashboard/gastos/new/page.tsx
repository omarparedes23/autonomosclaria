import Link from 'next/link'
import GastoForm from './GastoForm'

export default function NuevoGastoPage() {
  return (
    <div>
      <div className="mb-8">
        <Link href="/dashboard/gastos" className="text-gray-500 hover:text-black hover:underline mb-4 inline-block">
          &larr; Volver a Gastos
        </Link>
        <h1 className="text-3xl font-bold">Nuevo Gasto Deducible</h1>
      </div>
      <GastoForm />
    </div>
  )
}
