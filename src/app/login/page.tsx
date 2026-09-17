import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-cepin-700 to-cepin-900 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center text-white">
          <h1 className="text-2xl font-bold">CEPIN</h1>
          <p className="text-sm text-cepin-100">
            Centro de Pesquisa e Inovação em Inteligência Artificial e Robótica
            Agrícola
          </p>
          <p className="mt-1 text-xs text-cepin-200">IFSP - Câmpus Araraquara</p>
        </div>
        <div className="card p-6">
          <h2 className="mb-1 text-lg font-semibold text-gray-900">
            Gestão do Drone Multiespectral
          </h2>
          <p className="mb-4 text-sm text-gray-500">
            Entre com seu e-mail institucional para acessar o sistema.
          </p>
          <LoginForm />
        </div>
        <p className="mt-4 text-center text-xs text-cepin-100">
          Acesso restrito a usuários autorizados pelo CEPIN.
        </p>
      </div>
    </div>
  );
}
