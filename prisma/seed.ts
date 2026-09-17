import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { EquipmentType } from "../src/lib/enums";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("cepin@2024", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@cepin.ifsp.edu.br" },
    update: {},
    create: {
      name: "Administrador CEPIN",
      email: "admin@cepin.ifsp.edu.br",
      passwordHash: adminPassword,
      role: "ADMIN",
      registration: "0000",
    },
  });

  const tecnicoPassword = await bcrypt.hash("cepin@2024", 10);
  await prisma.user.upsert({
    where: { email: "tecnico@cepin.ifsp.edu.br" },
    update: {},
    create: {
      name: "Técnico de Manutenção",
      email: "tecnico@cepin.ifsp.edu.br",
      passwordHash: tecnicoPassword,
      role: "TECNICO",
      registration: "0001",
    },
  });

  const pilotoPassword = await bcrypt.hash("cepin@2024", 10);
  await prisma.user.upsert({
    where: { email: "piloto@cepin.ifsp.edu.br" },
    update: {},
    create: {
      name: "Piloto de Demonstração",
      email: "piloto@cepin.ifsp.edu.br",
      passwordHash: pilotoPassword,
      role: "PILOTO",
      registration: "0002",
    },
  });

  // Kit de equipamentos do DJI Mavic 3 Multispectral (Mavic 3M)
  // com base nas especificações técnicas e apresentações do fabricante/revenda
  const equipmentKit: Array<{
    name: string;
    type: EquipmentType;
    serialNumber: string;
    model?: string;
    notes?: string;
    batteryCycles?: number;
    batteryCycleLimit?: number;
  }> = [
    {
      name: "Aeronave DJI Mavic 3 Multispectral",
      type: "AERONAVE",
      serialNumber: "M3M-AERO-001",
      model: "DJI Mavic 3M",
      notes:
        "Câmera RGB (20MP) + câmera multiespectral (5MP: NIR 860nm, Red Edge 730nm, Red 650nm, Green 560nm) e sensor de luz solar espectral. Peso ~951g com hélices e módulo RTK.",
    },
    {
      name: "Módulo RTK",
      type: "MODULO_RTK",
      serialNumber: "M3M-RTK-001",
      model: "DJI RTK Module",
      notes: "Acoplado à aeronave para posicionamento de alta precisão.",
    },
    {
      name: "Controle Remoto DJI RC Pro Enterprise",
      type: "CONTROLE_REMOTO",
      serialNumber: "M3M-RC-001",
      model: "DJI RC Pro",
      notes: "Bateria 5000 mAh, até 3h de uso, alcance máx. 8km.",
    },
    {
      name: "Bateria de Voo Inteligente 1",
      type: "BATERIA",
      serialNumber: "M3M-BAT-001",
      model: "DJI Intelligent Flight Battery (15,4V / 5000mAh)",
      batteryCycles: 0,
      batteryCycleLimit: 200,
      notes: "Vida útil recomendada pela DJI: até 200 ciclos de carga.",
    },
    {
      name: "Bateria de Voo Inteligente 2",
      type: "BATERIA",
      serialNumber: "M3M-BAT-002",
      model: "DJI Intelligent Flight Battery (15,4V / 5000mAh)",
      batteryCycles: 0,
      batteryCycleLimit: 200,
    },
    {
      name: "Bateria de Voo Inteligente 3",
      type: "BATERIA",
      serialNumber: "M3M-BAT-003",
      model: "DJI Intelligent Flight Battery (15,4V / 5000mAh)",
      batteryCycles: 0,
      batteryCycleLimit: 200,
    },
    {
      name: "Jogo de Hélices (par sobressalente)",
      type: "HELICES",
      serialNumber: "M3M-PROP-001",
      notes: "Par reserva para substituição em caso de dano.",
    },
    {
      name: "Filtro ND",
      type: "FILTRO_ND",
      serialNumber: "M3M-NDF-001",
      notes: "Kit de filtros de densidade neutra para câmera RGB.",
    },
    {
      name: "Carregador / Hub de Carga",
      type: "CARREGADOR",
      serialNumber: "M3M-CHG-001",
      notes: "Fonte 100-240V. Carregamento completo em ~1h20min por bateria.",
    },
    {
      name: "Cartão de Memória microSD 128GB",
      type: "CARTAO_MEMORIA",
      serialNumber: "M3M-SD-001",
    },
    {
      name: "Cabo USB-C (aeronave/controle)",
      type: "CABO",
      serialNumber: "M3M-CABLE-001",
    },
    {
      name: "Case / Maleta de Transporte",
      type: "CASE_MALETA",
      serialNumber: "M3M-CASE-001",
      notes: "Maleta rígida original DJI para transporte de todo o kit.",
    },
  ];

  for (const item of equipmentKit) {
    await prisma.equipment.upsert({
      where: { serialNumber: item.serialNumber },
      update: {},
      create: {
        name: item.name,
        type: item.type,
        serialNumber: item.serialNumber,
        model: item.model,
        notes: item.notes,
        batteryCycles: item.batteryCycles,
        batteryCycleLimit: item.batteryCycleLimit,
        acquisitionDate: new Date("2024-01-15"),
      },
    });
  }

  console.log("Seed concluído.");
  console.log("Usuário admin:", admin.email, "| senha: cepin@2024");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
