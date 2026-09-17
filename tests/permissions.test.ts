import { describe, it, expect } from "vitest";
import { can } from "@/lib/permissions";

describe("matriz de permissões", () => {
  it("Administrador pode gerenciar usuários, equipamentos e configurações", () => {
    expect(can("ADMIN", "users.manage")).toBe(true);
    expect(can("ADMIN", "equipment.manage")).toBe(true);
    expect(can("ADMIN", "settings.manage")).toBe(true);
    expect(can("ADMIN", "reservations.review")).toBe(true);
  });

  it("Usuário Autorizado não pode gerenciar usuários nem equipamentos", () => {
    expect(can("USUARIO_AUTORIZADO", "users.manage")).toBe(false);
    expect(can("USUARIO_AUTORIZADO", "equipment.manage")).toBe(false);
  });

  it("Usuário Autorizado pode solicitar retirada e registrar uso", () => {
    expect(can("USUARIO_AUTORIZADO", "reservations.create")).toBe(true);
    expect(can("USUARIO_AUTORIZADO", "flightlogs.register")).toBe(true);
  });

  it("Responsável pelo CEPIN pode aprovar solicitações mas não gerenciar equipamentos", () => {
    expect(can("RESPONSAVEL_CEPIN", "reservations.review")).toBe(true);
    expect(can("RESPONSAVEL_CEPIN", "equipment.manage")).toBe(false);
  });

  it("Operador/Conferente pode registrar retiradas e devoluções físicas, mas não aprovar solicitações", () => {
    expect(can("OPERADOR_CONFERENTE", "withdrawals.register")).toBe(true);
    expect(can("OPERADOR_CONFERENTE", "returns.register")).toBe(true);
    expect(can("OPERADOR_CONFERENTE", "reservations.review")).toBe(false);
    expect(can("OPERADOR_CONFERENTE", "users.manage")).toBe(false);
  });

  it("papel desconhecido não recebe nenhuma permissão", () => {
    expect(can("PAPEL_INEXISTENTE", "equipment.view")).toBe(false);
  });
});
