import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reportLovableError } from "@/lib/lovable-error-reporting";

interface Props {
  /** Título curto exibido dentro do card quando algo falha. */
  title?: string;
  /** Mensagem em português exibida ao usuário. */
  message?: string;
  /** Identificador para telemetria (não exposto ao usuário). */
  boundaryId?: string;
  children: ReactNode;
}

interface State {
  error: Error | null;
  attempt: number;
}

/**
 * ErrorBoundary local — usado para isolar áreas frágeis (ex.: motor
 * biomecânico) para que uma falha nelas não derrube a página inteira.
 * Nunca deve substituir a UX principal: apenas contém o dano.
 */
export class LocalErrorBoundary extends Component<Props, State> {
  state: State = { error: null, attempt: 0 };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[LocalErrorBoundary]", this.props.boundaryId ?? "unnamed", error, info);
    try {
      reportLovableError(error, {
        boundary: `local:${this.props.boundaryId ?? "unnamed"}`,
      });
    } catch {
      /* telemetria não deve derrubar o boundary */
    }
  }

  private handleRetry = () => {
    this.setState((s) => ({ error: null, attempt: s.attempt + 1 }));
  };

  render() {
    if (this.state.error) {
      return (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 text-amber-300" />
            <div className="flex-1 space-y-2">
              <div className="font-medium text-amber-100">
                {this.props.title ?? "Recurso indisponível"}
              </div>
              <p className="text-amber-100/80">
                {this.props.message ??
                  "Este recurso ficou indisponível no momento. O restante da avaliação continua funcionando normalmente."}
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={this.handleRetry}
                className="border-amber-400/40 text-amber-100 hover:bg-amber-500/20"
              >
                <RefreshCcw className="mr-2 h-3 w-3" /> Tentar novamente
              </Button>
            </div>
          </div>
        </div>
      );
    }
    // `key` força remontagem limpa dos filhos após retry.
    return <div key={this.state.attempt}>{this.props.children}</div>;
  }
}

export default LocalErrorBoundary;
