import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/exercicios")({
  beforeLoad: () => {
    throw redirect({ to: "/avaliacoes/nova" });
  },
});