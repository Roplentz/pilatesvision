import { useSyncExternalStore } from "react";
import { mockClinic } from "@/lib/mockData";
import type { Clinic } from "@/types/models";

/**
 * Store local de clínicas (in-memory) — inicializado a partir dos mocks.
 * Será substituído por queries Supabase quando a integração for ativada.
 * Persiste apenas durante a sessão do navegador.
 */

const extraClinics: Clinic[] = [
  {
    id: "clinic-002",
    name: "Pilates Vision Rio",
    slug: "pv-rio",
    email: "contato@pilatesvision.rio",
    phone: "+55 21 98888-2020",
    plan: "starter",
    address: {
      street: "Av. Ataulfo de Paiva, 800",
      city: "Rio de Janeiro",
      state: "RJ",
      zip: "22440-035",
      country: "BR",
    },
    createdAt: "2025-03-10T10:00:00.000Z",
  },
  {
    id: "clinic-003",
    name: "Núcleo Movimento BH",
    slug: "nucleo-bh",
    email: "ola@nucleomovimento.com.br",
    phone: "+55 31 99777-3030",
    plan: "enterprise",
    address: {
      street: "Rua Pernambuco, 1500",
      city: "Belo Horizonte",
      state: "MG",
      zip: "30130-152",
      country: "BR",
    },
    createdAt: "2025-05-22T10:00:00.000Z",
  },
];

let clinics: Clinic[] = [mockClinic, ...extraClinics];
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => void listeners.delete(cb);
};

export function useClinics(): Clinic[] {
  return useSyncExternalStore(subscribe, () => clinics, () => clinics);
}

export function getClinic(id: string): Clinic | undefined {
  return clinics.find((c) => c.id === id);
}

export type NewClinicInput = Omit<Clinic, "id" | "createdAt">;

export function addClinic(input: NewClinicInput): Clinic {
  const created: Clinic = {
    ...input,
    id: `clinic-${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
  };
  clinics = [created, ...clinics];
  emit();
  return created;
}