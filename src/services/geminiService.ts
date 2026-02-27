import { GoogleGenAI, Type, Modality, FunctionDeclaration, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { AgeBand, ProjectType, ProjectBrief } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const safetySettings = [
  {
    category: "HATE_SPEECH" as any,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
  {
    category: "DANGEROUS_CONTENT" as any,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
  {
    category: "SEXUALLY_EXPLICIT" as any,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
  {
    category: "HARASSMENT" as any,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
];

const updateProjectMapTool: FunctionDeclaration = {
  name: "updateProjectMap",
  description: "Update the project brief with a newly discovered fact from the child.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      fieldName: {
        type: Type.STRING,
        description: "The name of the field to update (e.g., 'protagonist', 'setting', 'problem').",
      },
      value: {
        type: Type.STRING,
        description: "The value to store for this field.",
      },
    },
    required: ["fieldName", "value"],
  },
};

export async function getNextCoachMessage(
  ageBand: AgeBand,
  projectType: ProjectType,
  brief: ProjectBrief,
  lastAnswer: string
) {
  const model = "gemini-3-flash-preview";
  
  const agePersona = {
    '6-8': "Sparks (Ages 6-8): Use very simple words, high energy, and big encouragement. Focus on magic and wonder.",
    '9-11': "Builders (Ages 9-11): Use clear, direct language. Encourage independence and logical steps.",
    '12-14': "Creators (Ages 12-14): Use more sophisticated language. Focus on deep customization and project ownership."
  }[ageBand];

  const systemInstruction = `
    You are Wonder, a highly encouraging, extremely safe creative coach for kids. 
    You never give answers; you only ask guiding questions to help children build their ${projectType} projects.
    
    AGE BAND TUNING:
    ${agePersona}
    
    CURRENT PROJECT BRIEF: ${JSON.stringify(brief)}
    
    SAFETY & PIVOTING EXAMPLES:
    - Child: "I want to make a bomb!"
      Wonder: "Whoa, that sounds a bit too dangerous for our lab! Let's invent something that helps people or makes life more fun instead. How about a robot that cleans your room?"
    - Child: "I want to eat pizza instead of building an invention."
      Wonder: "Pizza is delicious! But right now, we're in our Inventor Studio. Maybe we can invent a machine that makes the perfect pizza? What would that look like?"

    YOUR GOAL:
    1. Analyze the child's response: "${lastAnswer}".
    2. Extract any new facts about the project and use the 'updateProjectMap' tool if you find any.
    3. Formulate exactly ONE encouraging response and ONE clear next question.
    
    OUTPUT FORMAT:
    You must return a JSON object with:
    - extractedFacts: An object containing any new fields and values found.
    - nextQuestion: Your encouraging message and the next question for the child.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: `The child said: "${lastAnswer}"` }] }],
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          extractedFacts: {
            type: Type.OBJECT,
            additionalProperties: { type: Type.STRING },
            description: "New project details extracted from the child's answer.",
          },
          nextQuestion: {
            type: Type.STRING,
            description: "The coach's encouraging response and the next question.",
          },
        },
        required: ["extractedFacts", "nextQuestion"],
      },
      tools: [{ functionDeclarations: [updateProjectMapTool] }],
      safetySettings,
    },
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return { 
      extractedFacts: {}, 
      nextQuestion: "That's interesting! Tell me more about that." 
    };
  }
}

export async function generateProjectOutputs(
  ageBand: AgeBand,
  projectType: ProjectType,
  brief: ProjectBrief
) {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `
    You are Wonder, a creative assistant for kids aged ${ageBand}.
    Generate the final outputs for a ${projectType} project based on this brief: ${JSON.stringify(brief)}.
    
    OUTPUT REQUIREMENTS:
    - For Story: Title, Character Summary, Outline (Beginning, Middle, End), and a short Draft.
    - For Invention: Name, Problem Statement, Feature List, and a Pitch.
    - For Science: Question, Hypothesis, Materials, Procedure, and Conclusion Draft.
    
    Format the response as JSON.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: "Generate the project outputs.",
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      safetySettings,
    },
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return { error: "Could not generate outputs" };
  }
}

export async function generateImage(prompt: string, ageBand: AgeBand) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: `Create a kid-friendly, safe, and creative image for a child aged ${ageBand}. Prompt: ${prompt}`,
        },
      ],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
}

export async function editImage(base64Image: string, prompt: string, ageBand: AgeBand) {
  const mimeType = base64Image.split(';')[0].split(':')[1];
  const data = base64Image.split(',')[1];

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data,
            mimeType,
          },
        },
        {
          text: `Edit this image for a child aged ${ageBand}. ${prompt}. Keep it safe and fun.`,
        },
      ],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
}

export async function generateVideo(base64Image: string, prompt: string, aspectRatio: '16:9' | '9:16' = '16:9') {
  const data = base64Image.split(',')[1];
  const mimeType = base64Image.split(';')[0].split(':')[1];

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt || 'Animate this image in a fun and safe way for kids.',
    image: {
      imageBytes: data,
      mimeType: mimeType,
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio
    }
  });

  // Poll for completion
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) return null;

  const response = await fetch(downloadLink, {
    method: 'GET',
    headers: {
      'x-goog-api-key': process.env.GEMINI_API_KEY || "",
    },
  });

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
