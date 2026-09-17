import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "CEPIN | Gestão do Drone Multiespectral",
  description:
    "Sistema de controle de retiradas, utilização, devolução e manutenção do drone DJI Mavic 3 Multispectral do CEPIN - IFSP Câmpus Araraquara",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
