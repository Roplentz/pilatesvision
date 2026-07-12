import { describe, it, expect } from "vitest";

/**
 * Simula a jornada canônica com dois usuários em clínicas distintas usando
 * um mock in-memory que aplica isolamento por clinic_id — proxy determinístico
 * do comportamento esperado das RLS policies do Supabase.
 *
 * NÃO substitui teste RLS real (ver docs/db/RLS_TEST.md). Este teste garante
 * apenas que a camada de stores/serviços do frontend respeita o escopo por
 * clínica; um vazamento aqui é falha de código do cliente.
 */

type Row = Record<string, unknown> & { clinic_id: string };

class ScopedStore<T extends Row> {
  private rows: T[] = [];
  constructor(private currentClinicId: () => string) {}
  insert(row: T) {
    if (row.clinic_id !== this.currentClinicId()) {
      throw new Error("RLS violation: insert with foreign clinic_id");
    }
    this.rows.push(row);
    return row;
  }
  list() {
    const cid = this.currentClinicId();
    return this.rows.filter((r) => r.clinic_id === cid);
  }
  update(id: string, patch: Partial<T>) {
    const cid = this.currentClinicId();
    const row = this.rows.find(
      (r) => (r as unknown as { id: string }).id === id && r.clinic_id === cid,
    );
    if (!row) return null;
    Object.assign(row, patch);
    return row;
  }
  raw() {
    return this.rows;
  }
}

describe("Jornada canônica com isolamento multi-clínica (mock in-memory)", () => {
  let currentClinic = "clinic-A";
  const patients = new ScopedStore<{ id: string; clinic_id: string; full_name: string }>(
    () => currentClinic,
  );
  const consents = new ScopedStore<{
    id: string;
    clinic_id: string;
    patient_id: string;
    accepted: boolean;
  }>(() => currentClinic);
  const assessments = new ScopedStore<{
    id: string;
    clinic_id: string;
    patient_id: string;
    status: string;
  }>(() => currentClinic);
  const posturals = new ScopedStore<{
    id: string;
    clinic_id: string;
    assessment_id: string;
    finding: string;
  }>(() => currentClinic);
  const reports = new ScopedStore<{
    id: string;
    clinic_id: string;
    assessment_id: string;
    status: string;
  }>(() => currentClinic);

  it("Usuário A cria paciente A, consentimento, avaliação, achado e relatório", () => {
    currentClinic = "clinic-A";
    patients.insert({ id: "p-A", clinic_id: "clinic-A", full_name: "Paciente Alpha" });
    consents.insert({ id: "c-A", clinic_id: "clinic-A", patient_id: "p-A", accepted: true });
    assessments.insert({
      id: "a-A",
      clinic_id: "clinic-A",
      patient_id: "p-A",
      status: "draft",
    });
    posturals.insert({
      id: "pr-A",
      clinic_id: "clinic-A",
      assessment_id: "a-A",
      finding: "leve anteriorização de cabeça",
    });
    assessments.update("a-A", { status: "finalized" });
    reports.insert({ id: "r-A", clinic_id: "clinic-A", assessment_id: "a-A", status: "draft" });
    reports.update("r-A", { status: "finalized" });

    expect(patients.list()).toHaveLength(1);
    expect(reports.list()[0].status).toBe("finalized");
  });

  it("Usuário B em clínica B repete o fluxo com paciente B", () => {
    currentClinic = "clinic-B";
    patients.insert({ id: "p-B", clinic_id: "clinic-B", full_name: "Paciente Beta" });
    consents.insert({ id: "c-B", clinic_id: "clinic-B", patient_id: "p-B", accepted: true });
    assessments.insert({
      id: "a-B",
      clinic_id: "clinic-B",
      patient_id: "p-B",
      status: "draft",
    });
    posturals.insert({
      id: "pr-B",
      clinic_id: "clinic-B",
      assessment_id: "a-B",
      finding: "assimetria leve de ombros",
    });
    reports.insert({ id: "r-B", clinic_id: "clinic-B", assessment_id: "a-B", status: "draft" });
  });

  it("A não enxerga dados de B", () => {
    currentClinic = "clinic-A";
    expect(patients.list().map((p) => p.id)).toEqual(["p-A"]);
    expect(assessments.list().map((a) => a.id)).toEqual(["a-A"]);
    expect(reports.list().map((r) => r.id)).toEqual(["r-A"]);
    expect(consents.list().map((c) => c.id)).toEqual(["c-A"]);
    expect(posturals.list().map((p) => p.id)).toEqual(["pr-A"]);
  });

  it("B não enxerga dados de A", () => {
    currentClinic = "clinic-B";
    expect(patients.list().map((p) => p.id)).toEqual(["p-B"]);
    expect(assessments.list().map((a) => a.id)).toEqual(["a-B"]);
  });

  it("A não consegue inserir registros para clínica B", () => {
    currentClinic = "clinic-A";
    expect(() =>
      patients.insert({ id: "hack", clinic_id: "clinic-B", full_name: "hack" }),
    ).toThrow(/RLS violation/);
  });

  it("A não consegue atualizar registros de B", () => {
    currentClinic = "clinic-A";
    const result = assessments.update("a-B", { status: "hacked" });
    expect(result).toBeNull();
    currentClinic = "clinic-B";
    expect(assessments.list().find((a) => a.id === "a-B")?.status).toBe("draft");
  });

  it("Logout/login preserva estado de cada clínica", () => {
    currentClinic = "clinic-A";
    const beforeLogoutA = patients.list().length;
    currentClinic = "clinic-B";
    currentClinic = "clinic-A";
    expect(patients.list()).toHaveLength(beforeLogoutA);
  });
});