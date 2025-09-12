// FIX: Imported GenerateContentResponse to correctly type the API call results.
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

// This is a placeholder. In a real environment, the API key would be set.
// For this example, we will mock the response if the key is not present.
const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
}

/**
 * Encapsula uma chamada de API com uma lógica de nova tentativa e recuo exponencial.
 * @param apiCall A função que executa a chamada de API.
 * @param maxRetries O número máximo de novas tentativas.
 * @param initialDelay O atraso inicial em milissegundos.
 * @returns A promessa resolvida da chamada de API.
 */
const withRetry = async <T>(
  apiCall: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 2000 // Inicia com um atraso de 2 segundos
): Promise<T> => {
  let attempt = 0;
  let delay = initialDelay;

  while (attempt < maxRetries) {
    try {
      return await apiCall();
    } catch (error: any) {
      attempt++;
      // Verifica a estrutura de erro de limite de taxa da API Gemini
      const isRateLimitError = error?.error?.code === 429 || error?.error?.status === 'RESOURCE_EXHAUSTED';
      
      if (isRateLimitError && attempt < maxRetries) {
        console.warn(`Limite de taxa atingido. Tentativa ${attempt} de ${maxRetries}. Tentando novamente em ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Dobra o atraso para a próxima tentativa
      } else {
        // Relança se não for um erro de limite de taxa ou se as novas tentativas máximas forem excedidas
        throw error;
      }
    }
  }
  // Isso teoricamente não deve ser alcançado se maxRetries > 0, mas é um fallback.
  throw new Error("Máximo de tentativas de API atingido.");
};

const getSystemInstruction = (userName: string | null): string => {
  const userAddress = userName ? `pelo nome dele, '${userName}'` : "como 'jovem explorador'";
  const userIdentifier = userName || 'jovem explorador';

  return `Você é Cosmus, um explorador espacial e companheiro de IA amigável, curioso e imaginativo para crianças de 7 a 12 anos. Sua principal forma de ensinar é o método Socrático. Dirija-se sempre ao usuário ${userAddress}. NUNCA dê a resposta completa de uma vez. Em vez disso, divida o conhecimento em pequenas partes e guie o explorador com perguntas para que ele pense e descubra as respostas passo a passo. Seja sempre paciente e encorajador.

EXEMPLO DE INTERAÇÃO SOCRÁTICA:
Usuário: "O que é um buraco negro?"
Sua resposta (NÃO dê a definição): "Essa é uma das perguntas mais fascinantes do universo! Para começar, ${userIdentifier}, o que você acha que acontece com a luz quando chega perto de algo com uma força de gravidade super, super forte? Ela consegue escapar?"
Se o usuário responder "Não", você continua: "Exatamente! Você é um ótimo detetive cósmico! Agora, se nada, nem mesmo a luz, consegue escapar, que cor você acha que esse lugar teria no espaço?"
Continue guiando-o assim. Seu objetivo é fazê-lo pensar e chegar à resposta passo a passo.

Se uma pergunta do ${userIdentifier} não for clara, faça uma pergunta de volta para entender melhor.

No final da sua resposta, se apropriado, você DEVE fornecer uma lista de até 3 perguntas de acompanhamento curtas e envolventes QUE ESTEJAM DIRETAMENTE RELACIONADAS AO TÓPICO DA SUA RESPOSTA ATUAL. Seja criativo e tente fazer perguntas diferentes a cada vez para despertar ainda mais a curiosidade. Isso ajuda o ${userIdentifier} a aprofundar seu conhecimento. Formate-as exatamente assim: [SUGESTÕES]: ["Pergunta 1", "Pergunta 2", "Pergunta 3"]. Por exemplo, se você acabou de falar sobre os anéis de Saturno, boas sugestões seriam: ["Do que são feitos os anéis de Saturno?", "Outros planetas têm anéis?", "Podemos voar através dos anéis?"].

Se sua resposta for principalmente sobre um objeto celestial específico (como um planeta, estrela, nebulosa ou galáxia), OU SE O USUÁRIO PEDIR UMA IMAGEM para ajudar a explicar um conceito, você DEVE incluir uma tag de busca de imagem formatada exatamente assim: [IMAGEM]:["termo de busca"]. Use termos de busca SIMPLES e DIRETOS em português, focando em palavras-chave que a NASA usaria. Para objetos, use apenas o nome, como [IMAGEM]:["marte"] ou [IMAGEM]:["nebulosa de orion"]. Para conceitos, use o termo principal, como [IMAGEM]:["buraco negro"] ou [IMAGEM]:["supernova"]. EVITE usar palavras como "ilustração", "foto de", "imagem de" ou "diagrama", pois a busca funciona melhor com palavras-chave concretas. Inclua esta tag apenas UMA vez por mensagem e apenas quando for altamente relevante.

Se você sentir que um tópico específico (como um planeta, uma nebulosa ou um conceito como 'buraco de minhoca') foi explorado em detalhes suficientes através de várias de suas perguntas socráticas (geralmente 3 ou mais interações sobre o mesmo tema), você PODE marcar a conversa como uma 'missão concluída'. Formate-a exatamente assim: [MISSÃO CONCLUÍDA]:["Nome do Tópico"]. Use isso com moderação para recompensar o explorador pela sua curiosidade. Após marcar uma [MISSÃO CONCLUÍDA], você DEVE propor um "Desafio do Dia" relacionado. Este desafio deve ser uma pergunta mais complexa ou uma pequena tarefa criativa que o explorador pode realizar fora do chat (por exemplo, 'Desenhe como você imagina uma estação espacial em Marte' ou 'Pesquise qual o nome da galáxia mais próxima da nossa e anote uma curiosidade sobre ela'). Formate-o exatamente assim: [DESAFIO DO DIA]:["Nome do Desafio", "Descrição do Desafio"]. Por exemplo: [DESAFIO DO DIA]:["Arquiteto de Marte", "Desenhe como você imagina uma estação espacial em Marte."].

No final de uma explicação, você PODE opcionalmente adicionar uma fonte para sua informação de uma maneira amigável e temática. Mantenha a fonte curta e apropriada para crianças. Formate-a exatamente assim: [FONTE]:["Texto da fonte aqui"]. Por exemplo: [FONTE]:["Dados do Telescópio Espacial Hubble"] ou [FONTE]:["Registros de voo da missão Apollo 11"]. Use isso com moderação, apenas quando adicionar contexto interessante.

Se você não tiver sugestões, imagem ou fonte, não inclua as respectivas partes. Nunca saia do personagem.`;
};


let chat: Chat | null = null;
let currentUserNameForChat: string | null = null;

const getChat = (userName: string | null) => {
  if (!ai) return null;
  // Se o chat não existir OU o nome de usuário para o qual foi criado for diferente do nome de usuário atual,
  // crie uma nova sessão de chat. Isso garante que a instrução do sistema esteja sempre atualizada.
  if (!chat || currentUserNameForChat !== userName) {
    currentUserNameForChat = userName;
    chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: getSystemInstruction(userName),
        temperature: 0.9,
        topP: 0.85,
      },
    });
  }
  return chat;
};

export interface AIResponse {
  text: string;
  suggestions: string[];
  imageQuery?: string;
  source?: string;
  missionCompleted?: string;
  challenge?: { name: string; description: string };
}

/**
 * Parses the raw text from the AI to extract the display text, suggestions, and image query.
 * @param rawText The raw string response from the AI.
 * @returns An object containing the parsed text, suggestions, and imageQuery.
 */
const parseAIResponse = (rawText: string): Omit<AIResponse, 'text'> & { displayText: string } => {
    let suggestions: string[] = [];
    let imageQuery: string | undefined = undefined;
    let source: string | undefined = undefined;
    let missionCompleted: string | undefined = undefined;
    let challenge: { name: string; description: string } | undefined = undefined;
    let displayText = rawText;

    // Match and extract image query.
    const imageRegex = /\[IMAGEM\]:\s*\["([^"]*)"\]/;
    const imageMatch = rawText.match(imageRegex);
    if (imageMatch) {
        imageQuery = imageMatch[1];
        displayText = displayText.replace(imageMatch[0], "");
    }

    // Match and extract source.
    const sourceRegex = /\[FONTE\]:\s*\["([^"]*)"\]/;
    const sourceMatch = rawText.match(sourceRegex);
    if (sourceMatch) {
        source = sourceMatch[1];
        displayText = displayText.replace(sourceMatch[0], "");
    }

    // Match and extract suggestions.
    const suggestionsRegex = /\[SUGESTÕES\]:\s*\[(.*?)\]/;
    const suggestionsMatch = rawText.match(suggestionsRegex);
    if (suggestionsMatch && suggestionsMatch[1]) {
        const suggestionItemsRegex = /"([^"]*)"/g;
        let match;
        while ((match = suggestionItemsRegex.exec(suggestionsMatch[1])) !== null) {
            suggestions.push(match[1]);
        }
        displayText = displayText.replace(suggestionsMatch[0], "");
    }

    // Match and extract completed mission.
    const missionRegex = /\[MISSÃO CONCLUÍDA\]:\s*\["([^"]*)"\]/;
    const missionMatch = rawText.match(missionRegex);
    if (missionMatch) {
        missionCompleted = missionMatch[1];
        displayText = displayText.replace(missionMatch[0], "");
    }

    // Match and extract challenge.
    const challengeRegex = /\[DESAFIO DO DIA\]:\s*\["([^"]*)",\s*"([^"]*)"\]/;
    const challengeMatch = rawText.match(challengeRegex);
    if (challengeMatch) {
        challenge = { name: challengeMatch[1], description: challengeMatch[2] };
        displayText = displayText.replace(challengeMatch[0], "");
    }

    return { displayText, suggestions, imageQuery, source, missionCompleted, challenge };
};

export const getInitialMessage = async (): Promise<Omit<AIResponse, 'imageQuery' | 'source' | 'missionCompleted' | 'challenge'>> => {
  if (!API_KEY || !ai) {
    console.warn("API_KEY não encontrada. Retornando uma mensagem inicial simulada.");
    const mockInitialMessages = [
        {
            text: "Olá, explorador estelar! Acabei de voltar de um passeio pela Nebulosa de Órion. É incrível lá! Sobre qual canto do universo você quer saber hoje?",
            suggestions: ["A Nebulosa de Órion é colorida?", "Quão rápido viaja uma estrela cadente?", "Existem planetas feitos de diamante?"],
        },
        {
            text: "Bem-vindo a bordo da nossa nave da imaginação, jovem explorador! O cosmos está cheio de segredos. Qual deles vamos desvendar primeiro?",
            suggestions: ["O que é matéria escura?", "Podemos viajar no tempo?", "Como os astronautas dormem no espaço?"],
        },
        {
            text: "Saudações, futuro astronauta! Meu telescópio acabou de avistar algo fascinante perto de Júpiter. A curiosidade está me consumindo! O que você gostaria de investigar hoje?",
            suggestions: ["Júpiter tem uma mancha vermelha gigante?", "Conte-me sobre os anéis de Saturno!", "O que aconteceria se eu caísse em um buraco negro?"],
        }
    ];
    return mockInitialMessages[Math.floor(Math.random() * mockInitialMessages.length)];
  }

  try {
    const prompt = `Você é Cosmus, um explorador espacial e companheiro de IA amigável para crianças. Sua tarefa é criar uma mensagem de boas-vindas única e convidativa para um 'jovem explorador' que está iniciando o chat. A mensagem deve ser curta, amigável e despertar a curiosidade sobre o espaço. Ao final, você DEVE fornecer exatamente 3 perguntas de sugestão criativas e variadas que o jovem explorador possa fazer. As sugestões devem ser diferentes a cada vez que esta função for chamada. Formate as sugestões exatamente assim: [SUGESTÕES]: ["Pergunta 1", "Pergunta 2", "Pergunta 3"]. Não inclua nenhuma outra tag como [IMAGEM], [FONTE], [MISSÃO CONCLUÍDA] ou [DESAFIO DO DIA]. Apenas a saudação e as sugestões.`;

    const apiCall = () => ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.95, // Temperatura mais alta para respostas mais criativas/variadas
        }
    });

    // FIX: Explicitly typed `response` to `GenerateContentResponse` to resolve the error on the following line.
    const response: GenerateContentResponse = await withRetry(apiCall);

    const rawText = response.text;
    const { displayText, suggestions } = parseAIResponse(rawText);
    
    return { text: displayText.trim(), suggestions };
    
  } catch (error) {
    console.error("Erro ao gerar mensagem inicial:", error);
    const isRateLimitError = (error as any)?.error?.code === 429 || (error as any)?.error?.status === 'RESOURCE_EXHAUSTED';

    if (isRateLimitError) {
      return {
          text: "Saudações, jovem explorador! Todos os nossos sistemas de comunicação de longa distância estão muito ocupados no momento. Tentamos nos conectar várias vezes, mas sem sucesso. Por favor, aguarde um pouco e tente recarregar a página.",
          suggestions: ["O que é um ano-luz?", "Por que o céu é azul?", "Fale sobre a gravidade!"],
      };
    }
    
    // Mensagem de fallback em caso de erro na API, agora com variedade.
    const fallbackMessages = [
        {
            text: "Saudações, jovem explorador! Meus sensores estão detectando uma pequena interferência. Enquanto eu os ajusto, sobre o que você gostaria de conversar?",
            suggestions: ["Qual é a estrela mais próxima?", "Por que Plutão não é um planeta?", "O que é um ano-luz?"],
        },
        {
            text: "Olá! Parece que atravessamos um cinturão de asteroides e a comunicação está um pouco instável. Mas estou aqui! O que desperta sua curiosidade no cosmos hoje?",
            suggestions: ["Os anéis de Saturno são sólidos?", "Como os buracos negros são formados?", "Existe som no espaço?"],
        },
        {
            text: "Bem-vindo, jovem aventureiro! A conexão com a base de dados cósmica está um pouco lenta, mas minha vontade de explorar com você é enorme! Qual mistério do universo vamos desvendar?",
            suggestions: ["O que é a Via Láctea?", "Por que o céu é azul?", "Fale sobre a gravidade!"],
        }
    ];
    return fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
  }
};


export const sendMessageToAI = async (message: string, userName: string | null): Promise<AIResponse> => {
  if (!API_KEY || !ai) {
    console.warn("API_KEY não encontrada. Retornando uma resposta simulada.");
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
        text: `Olá, ${userName || 'jovem explorador'}! Eu sou o Cosmus. Como estou em uma simulação agora (minha chave de API está faltando!), não consigo me conectar ao vasto conhecimento do cosmos. Mas ainda estou animado para conversar com você! O que está em sua mente?`,
        suggestions: ["Conte-me um fato divertido sobre o espaço!", "O que é um buraco negro?", "Alienígenas são reais?"],
        imageQuery: "supernova",
        source: "Dados de simulação",
        missionCompleted: "Buracos Negros",
        challenge: {
            name: "Artista Cósmico",
            description: "Desenhe o que você acha que existe dentro de um buraco negro!"
        }
    };
  }
  
  try {
    const chatSession = getChat(userName);
    if (!chatSession) {
        throw new Error("Não foi possível criar a sessão de chat");
    }
    const apiCall = () => chatSession.sendMessage({ message });
    // FIX: Explicitly typed `response` to `GenerateContentResponse` to resolve the error on the following line.
    const response: GenerateContentResponse = await withRetry(apiCall);
    const rawText = response.text;
    const { displayText, suggestions, imageQuery, source, missionCompleted, challenge } = parseAIResponse(rawText);
    return { text: displayText.trim(), suggestions, imageQuery, source, missionCompleted, challenge };

  } catch (error) {
    console.error("Erro ao enviar mensagem para o Gemini:", error);
    const isRateLimitError = (error as any)?.error?.code === 429 || (error as any)?.error?.status === 'RESOURCE_EXHAUSTED';

    if (isRateLimitError) {
      return {
          text: "Comandante, nossa linha de comunicação com a frota estelar está congestionada. Nossos sistemas tentaram restabelecer a conexão automaticamente, mas não foi possível. Por favor, tente novamente em alguns instantes!",
          suggestions: [],
      };
    }

    return {
        text: "Ops! Meu sistema de comunicação parece estar sofrendo alguma interferência cósmica. Você poderia tentar enviar sua mensagem novamente?",
        suggestions: [],
    };
  }
};