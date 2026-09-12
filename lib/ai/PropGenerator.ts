export interface PropGenerationInput {
  prompt: string;
}

export interface GeneratedProp {
  url: string;
  width: number;
  height: number;
}

export interface PropGenerator {
  generate(input: PropGenerationInput): Promise<GeneratedProp>;
}
