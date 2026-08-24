export type SquatState = "standing" | "descending" | "bottom" | "ascending";

export interface SquatStateInput {
  timestampSeconds: number;
  kneeFlexionDeg: number;
  angularVelocityDegPerSecond: number;
  confidence: number;
}

export interface SquatStateMachineConfig {
  minimumConfidence: number;
  standingMaxFlexionDeg: number;
  bottomMinFlexionDeg: number;
  movementVelocityThresholdDegPerSecond: number;
  minimumStateDurationSeconds: number;
}

export interface SquatStateMachineSnapshot {
  state: SquatState;
  repetitionCount: number;
  stateEnteredAt: number;
}

export function nextSquatState(
  snapshot: SquatStateMachineSnapshot,
  input: SquatStateInput,
  config: SquatStateMachineConfig,
): SquatStateMachineSnapshot {
  if (input.confidence < config.minimumConfidence) return snapshot;

  const canTransition =
    input.timestampSeconds - snapshot.stateEnteredAt >= config.minimumStateDurationSeconds;
  if (!canTransition) return snapshot;

  const movingDown =
    input.angularVelocityDegPerSecond >= config.movementVelocityThresholdDegPerSecond;
  const movingUp =
    input.angularVelocityDegPerSecond <= -config.movementVelocityThresholdDegPerSecond;
  let state = snapshot.state;
  let repetitionCount = snapshot.repetitionCount;

  if (state === "standing" && movingDown && input.kneeFlexionDeg > config.standingMaxFlexionDeg)
    state = "descending";
  else if (state === "descending" && input.kneeFlexionDeg >= config.bottomMinFlexionDeg)
    state = "bottom";
  else if (state === "bottom" && movingUp) state = "ascending";
  else if (state === "ascending" && input.kneeFlexionDeg <= config.standingMaxFlexionDeg) {
    state = "standing";
    repetitionCount += 1;
  }

  return state === snapshot.state
    ? snapshot
    : { state, repetitionCount, stateEnteredAt: input.timestampSeconds };
}

export function initialSquatState(): SquatStateMachineSnapshot {
  return { state: "standing", repetitionCount: 0, stateEnteredAt: 0 };
}
