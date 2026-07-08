import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/nova-avaliacao")({
  beforeLoad: () => {
    throw redirect({ to: "/avaliacoes/nova" });
  },
});