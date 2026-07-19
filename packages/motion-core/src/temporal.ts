export function finiteValues(values: number[]): number[] {
  return values.filter(Number.isFinite);
}

export function mean(values: number[]): number {
  const clean = finiteValues(values);
  return clean.length ? clean.reduce((sum, value) => sum + value, 0) / clean.length : Number.NaN;
}

export function interpolateInvalid(values: number[]): number[] {
  const output = [...values];
  const firstValid = output.findIndex(Number.isFinite);
  if (firstValid < 0) return output.map(() => Number.NaN);

  for (let index = 0; index < firstValid; index += 1) output[index] = output[firstValid];

  let index = firstValid + 1;
  while (index < output.length) {
    if (Number.isFinite(output[index])) {
      index += 1;
      continue;
    }

    const gapStart = index;
    while (index < output.length && !Number.isFinite(output[index])) index += 1;

    if (index >= output.length) {
      for (let cursor = gapStart; cursor < output.length; cursor += 1) {
        output[cursor] = output[gapStart - 1];
      }
      break;
    }

    const left = output[gapStart - 1];
    const right = output[index];
    const span = index - gapStart + 1;
    for (let cursor = gapStart; cursor < index; cursor += 1) {
      output[cursor] = left + ((right - left) * (cursor - gapStart + 1)) / span;
    }
  }

  return output;
}

export function emaZeroPhase(values: number[], alpha = 0.3): number[] {
  if (!values.length) return [];
  const clean = interpolateInvalid(values);
  const forward: number[] = [];
  let previous = clean[0];
  for (const value of clean) {
    previous = alpha * value + (1 - alpha) * previous;
    forward.push(previous);
  }

  const output = new Array<number>(forward.length);
  previous = forward.at(-1) ?? Number.NaN;
  for (let index = forward.length - 1; index >= 0; index -= 1) {
    previous = alpha * forward[index] + (1 - alpha) * previous;
    output[index] = previous;
  }
  return output;
}

export function derivative(values: number[], samplingRateHz: number): number[] {
  if (samplingRateHz <= 0) throw new Error("samplingRateHz must be greater than zero");
  if (values.length < 2) return values.map(() => 0);
  const dt = 1 / samplingRateHz;
  return values.map((value, index) => {
    if (index === 0) return (values[1] - value) / dt;
    if (index === values.length - 1) return (value - values[index - 1]) / dt;
    return (values[index + 1] - values[index - 1]) / (2 * dt);
  });
}
