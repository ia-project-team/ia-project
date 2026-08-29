import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const createOpenAIMock = vi.fn((options: unknown) => {
  void options;
  return { provider: "mock" };
});

vi.mock("@ai-sdk/openai", () => ({
  createOpenAI: (options: unknown) => createOpenAIMock(options),
}));

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("OpenAI provider", () => {
  it("생성 모델을 GPT-5.6 Luna로 통일한다", async () => {
    vi.stubEnv("MULTITURN_MODEL", "다른-모델");

    const provider = await import("@/server/llm/provider");

    expect(provider.DEFAULT_CHAT_MODEL).toBe("gpt-5.6-luna");
    expect(provider.MULTITURN_MODEL).toBe("gpt-5.6-luna");
    expect(provider.LUNA_PROVIDER_OPTIONS).toEqual({
      openai: { reasoningEffort: "medium", textVerbosity: "low" },
    });
  });

  it("OpenAI API 키 없이 로컬 주소로 우회하지 않는다", async () => {
    vi.stubEnv("OPENAI_BASE_URL", "http://127.0.0.1:9999/v1");
    vi.stubEnv("OPENAI_API_KEY", "");

    const { getOpenAI } = await import("@/server/llm/provider");

    expect(() => getOpenAI()).toThrow("OPENAI_API_KEY is not set");
    expect(createOpenAIMock).not.toHaveBeenCalled();
  });

  it("자동 재시도 제한은 0을 허용하고 잘못된 값을 거부한다", async () => {
    vi.stubEnv("OPENAI_MAX_RETRIES", "0");
    const { getOpenAIMaxRetries } = await import("@/server/llm/provider");
    expect(getOpenAIMaxRetries()).toBe(0);

    vi.stubEnv("OPENAI_MAX_RETRIES", "-1");
    expect(() => getOpenAIMaxRetries()).toThrow("non-negative integer");
  });
});
