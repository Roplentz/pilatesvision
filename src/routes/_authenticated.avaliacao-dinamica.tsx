import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/avaliacao-dinamica")({
  beforeLoad: () => {
    throw redirect({ to: "/avaliacoes/nova" });
  },
});