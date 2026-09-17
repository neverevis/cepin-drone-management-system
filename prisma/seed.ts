import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { AccessoryType } from "../src/lib/enums";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "cepin@2024";
const DEMO_NOTE = "Registro de demonstração (dados fictícios) criado pelo seed do sistema.";

async function upsertUser(params: {
  name: string;
  email: string;
  role: string;
  registration: string;
  position: string;
}) {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  return prisma.user.upsert({
    where: { email: params.email },
    update: {},
    create: {
      name: params.name,
      email: params.email,
      passwordHash,
      role: params.role,
      registration: params.registration,
      position: params.position,
      sector: "CEPIN",
    },
  });
}

async function main() {
  const admin = await upsertUser({
    name: "Administrador do Sistema",
    email: "admin@cepin.ifsp.edu.br",
    role: "ADMIN",
    registration: "0000",
    position: "Administrador do Sistema",
  });

  await upsertUser({
    name: "Coordenador(a) do CEPIN",
    email: "responsavel@cepin.ifsp.edu.br",
    role: "RESPONSAVEL_CEPIN",
    registration: "0001",
    position: "Responsável pelo CEPIN",
  });

  await upsertUser({
    name: "Pesquisador(a) Demonstração",
    email: "pesquisador@cepin.ifsp.edu.br",
    role: "USUARIO_AUTORIZADO",
    registration: "0002",
    position: "Pesquisador(a) / Bolsista",
  });

  await upsertUser({
    name: "Técnico Conferente",
    email: "conferente@cepin.ifsp.edu.br",
    role: "OPERADOR_CONFERENTE",
    registration: "0003",
    position: "Técnico de Laboratório",
  });

  const project = await prisma.project.upsert({
    where: { id: "demo-project-seed" },
    update: {},
    create: {
      id: "demo-project-seed",
      name: "Agricultura de Precisão - Projeto Demonstração",
      description:
        "Projeto fictício criado apenas para fins de demonstração e testes do sistema.",
      active: true,
    },
  });
  void project;

  // Equipamento principal: DJI Mavic 3 Multispectral
  const drone = await prisma.equipment.upsert({
    where: { serialNumber: "M3M-AERO-0001" },
    update: {},
    create: {
      name: "Drone DJI Mavic 3 Multispectral",
      manufacturer: "DJI",
      model: "Mavic 3M",
      patrimonyNumber: null,
      serialNumber: "M3M-AERO-0001",
      unit: "IFSP Câmpus Araraquara",
      sector: "CEPIN",
      acquisitionDate: new Date("2024-01-15"),
      status: "DISPONIVEL",
      notes:
        "Câmera RGB (20MP) + câmera multiespectral (5MP: NIR 860nm, Red Edge 730nm, Red 650nm, Green 560nm) e sensor de luz solar espectral. Peso ~951g com hélices e módulo RTK. " +
        DEMO_NOTE,
    },
  });

  const accessories: Array<{
    type: AccessoryType;
    name: string;
    identifier: string;
    serialNumber?: string;
    notes?: string;
  }> = [
    {
      type: "CONTROLE_REMOTO",
      name: "Controle Remoto DJI RC Pro Enterprise",
      identifier: "ACC-RC-001",
      serialNumber: "M3M-RC-0001",
      notes: "Bateria 5000mAh, até 3h de uso, alcance máx. 8km.",
    },
    {
      type: "MODULO_RTK",
      name: "Módulo RTK",
      identifier: "ACC-RTK-001",
      notes: "Acoplado à aeronave para posicionamento de alta precisão.",
    },
    {
      type: "HELICES",
      name: "Jogo de Hélices Sobressalente",
      identifier: "ACC-PROP-001",
    },
    {
      type: "FILTRO_ND",
      name: "Kit de Filtros ND",
      identifier: "ACC-NDF-001",
    },
    {
      type: "CARREGADOR",
      name: "Carregador / Hub de Carga",
      identifier: "ACC-CHG-001",
      notes: "Fonte 100-240V. Carregamento completo em ~1h20min por bateria.",
    },
    {
      type: "CABO",
      name: "Cabo USB-C (aeronave/controle)",
      identifier: "ACC-CABLE-001",
    },
    {
      type: "MALETA",
      name: "Maleta / Case de Transporte",
      identifier: "ACC-CASE-001",
      notes: "Maleta rígida original DJI para transporte de todo o kit.",
    },
  ];

  for (const acc of accessories) {
    const existing = await prisma.accessory.findFirst({
      where: { identifier: acc.identifier },
    });
    if (!existing) {
      await prisma.accessory.create({
        data: {
          equipmentId: drone.id,
          type: acc.type,
          name: acc.name,
          identifier: acc.identifier,
          serialNumber: acc.serialNumber,
          notes: [acc.notes, DEMO_NOTE].filter(Boolean).join(" "),
        },
      });
    }
  }

  // 4 baterias inteligentes: 1 principal + 3 extras
  const batteries = [
    { code: "BAT-1", isPrimary: true, serialNumber: "M3M-BAT-0001" },
    { code: "BAT-2", isPrimary: false, serialNumber: "M3M-BAT-0002" },
    { code: "BAT-3", isPrimary: false, serialNumber: "M3M-BAT-0003" },
    { code: "BAT-4", isPrimary: false, serialNumber: "M3M-BAT-0004" },
  ];

  for (const bat of batteries) {
    await prisma.battery.upsert({
      where: { code: bat.code },
      update: {},
      create: {
        code: bat.code,
        isPrimary: bat.isPrimary,
        serialNumber: bat.serialNumber,
        model: "DJI Intelligent Flight Battery (15,4V / 5000mAh)",
        nominalCapacityMah: 5000,
        acquisitionDate: new Date("2024-01-15"),
        status: "DISPONIVEL",
        currentChargePercent: 100,
        cycleCount: 0,
        notes:
          "Vida útil recomendada pela DJI: até 200 ciclos de carga. " + DEMO_NOTE,
      },
    });
  }

  console.log("Seed concluído com sucesso.");
  console.log("---------------------------------------------------------");
  console.log("Usuários de demonstração (todos com a senha: " + DEMO_PASSWORD + ")");
  console.log("  Administrador:        admin@cepin.ifsp.edu.br");
  console.log("  Responsável CEPIN:    responsavel@cepin.ifsp.edu.br");
  console.log("  Usuário Autorizado:   pesquisador@cepin.ifsp.edu.br");
  console.log("  Operador/Conferente:  conferente@cepin.ifsp.edu.br");
  console.log("---------------------------------------------------------");
  console.log(
    "ATENÇÃO: os dados acima (usuários, projeto e números de série) são" +
      " fictícios e servem apenas para demonstração/testes. Substitua pelos" +
      " dados reais do CEPIN antes de usar o sistema em produção."
  );
  void admin;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
