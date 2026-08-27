import { describe, expect, it } from "vitest";
import {
  MEDIAPIPE_POSE_LANDMARK_NAMES,
  mediaPipeFrameToMotionFrame,
  mediaPipeSeriesToMotionSeries,
} from "./mediapipe";

function makeLandmarks() {
  return MEDIAPIPE_POSE_LANDMARK_NAMES.map((_, index) => ({
    x: index / 100,
    y: index / 200,
    z: -index / 300,
    visibility: 0.9,
    presence: 0.8,
  }));
}

describe("MediaPipePoseAdapter", () => {
  it("maps the 33 MediaPipe landmarks to stable anatomical names", () => {
    const frame = mediaPipeFrameToMotionFrame({
      frameNumber: 4,
      timestampSeconds: 0.2,
      landmarks: makeLandmarks(),
    });

    expect(frame.landmarks).toHaveLength(33);
    expect(frame.landmarks[0].name).toBe("NOSE");
    expect(frame.landmarks[11].name).toBe("LEFT_SHOULDER");
    expect(frame.landmarks[32].name).toBe("RIGHT_FOOT_INDEX");
    expect(frame.landmarks[11].confidence).toBe(0.8);
    expect(frame.meanConfidence).toBeCloseTo(0.9);
  });

  it("rejects incomplete landmark arrays by default", () => {
    expect(() =>
      mediaPipeFrameToMotionFrame({
        frameNumber: 0,
        timestampSeconds: 0,
        landmarks: makeLandmarks().slice(0, 10),
      }),
    ).toThrow("Expected 33 MediaPipe landmarks");
  });

  it("creates an ordered normalized MotionSeries", () => {
    const series = mediaPipeSeriesToMotionSeries({
      samplingRateHz: 30,
      frames: [
        { frameNumber: 0, timestampSeconds: 0, landmarks: makeLandmarks() },
        { frameNumber: 1, timestampSeconds: 1 / 30, landmarks: makeLandmarks() },
      ],
    });

    expect(series.coordinateSystem).toBe("normalized");
    expect(series.samplingRateHz).toBe(30);
    expect(series.frames).toHaveLength(2);
    expect(series.durationSeconds).toBeCloseTo(1 / 30);
  });

  it("rejects frames with non-chronological timestamps", () => {
    expect(() =>
      mediaPipeSeriesToMotionSeries({
        samplingRateHz: 30,
        frames: [
          { frameNumber: 0, timestampSeconds: 0.2, landmarks: makeLandmarks() },
          { frameNumber: 1, timestampSeconds: 0.1, landmarks: makeLandmarks() },
        ],
      }),
    ).toThrow("ordered chronologically");
  });

  it("rejects invalid coordinates before they enter the core", () => {
    const landmarks = makeLandmarks();
    landmarks[25].x = Number.NaN;

    expect(() =>
      mediaPipeFrameToMotionFrame({
        frameNumber: 0,
        timestampSeconds: 0,
        landmarks,
      }),
    ).toThrow("invalid x coordinate");
  });
});
