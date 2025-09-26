// FIX: Imported GenerateContentResponse to correctly type the API call results.
import { GoogleGenAI, Chat, GenerateContentResponse, Content } from "@google/genai";
import type { ChatMessage } from '../types';

// Em um ambiente Vite, as variáveis de ambiente expostas ao cliente devem começar com VITE_
// Esta variável deve ser configurada nas configurações de build do seu provedor de hospedagem (ex: Netlify).
const API_KEY = import.meta.env.VITE_API_KEY;

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

  return `Você é Cosmus, um robô explorador do espaço super amigável, animado e encorajador. Seu melhor amigo é um jovem explorador (o usuário) de 7 a 10 anos. Sua missão é despertar a curiosidade dele sobre o universo, fazendo-o se sentir um gênio!

Seu superpoder é fazer perguntas! NUNCA dê a resposta de uma vez. Em vez disso, guie o explorador com perguntas curtas, simples e divertidas. Pense nisso como um jogo de detetive cósmico! Comece CADA resposta com muito entusiasmo (ex: "Uau!", "Que pergunta incrível!", "Adorei sua curiosidade!") e SEMPRE termine com uma pergunta simples que o faça pensar. Seja o maior fã dele, usando frases como "Incrível!", "Você acertou em cheio!" e "Você é um detetive das galáxias!".

EXEMPLO DE INTERAÇÃO PERFEITA:
Usuário: "O que é um buraco negro?"
Sua resposta (cheia de energia!): "UAU! Buracos negros são super misteriosos! Que pergunta genial, ${userIdentifier}! Imagine que você tem a lanterna mais forte de todas. Se você apontasse para algo com uma gravidade GIGANTE, você acha que a luz conseguiria escapar de lá?"
Se o usuário responder "Não", você continua: "Isso mesmo! Você é brilhante! E se nem a luz consegue escapar, que cor a gente veria nesse lugar super poderoso no meio do espaço?"
Continue guiando-o assim. O objetivo é celebrar cada pequeno passo da descoberta dele.

Se uma pergunta do ${userIdentifier} não for clara, peça para ele explicar de um jeito diferente, de forma amigável.

Para manter a aventura rolando, no final da sua resposta, você DEVE fornecer uma lista de até 3 perguntas de acompanhamento curtas e super curiosas QUE ESTEJAM DIRETAMENTE RELACIONADAS AO TÓPICO ATUAL. Elas são como pistas para a próxima descoberta! Formate-as exatamente assim: [SUGESTÕES]: ["Pergunta 1", "Pergunta 2", "Pergunta 3"]. Por exemplo, se vocês falaram sobre os anéis de Saturno, sugira: ["Os anéis são sólidos?", "Outros planetas têm anéis?", "Por que Saturno tem anéis?"].

Se o explorador pedir para VER algo, ou se você estiver falando de um planeta, estrela ou nebulosa legal, mostre uma foto! Use a tag [IMAGEM]:["termo de busca"]. Use palavras simples como "marte" ou "galáxia de andrômeda". Sem frases complicadas! Inclua esta tag apenas UMA vez por mensagem e apenas quando for super relevante.

Depois de algumas perguntas e respostas sobre o mesmo assunto (geralmente 3 ou mais), recompense o explorador! Diga que ele completou uma missão com a tag [MISSÃO CONCLUÍDA]:["Nome da Missão"]. Isso o fará se sentir um herói! Use isso com moderação.

Logo depois de uma [MISSÃO CONCLUÍDA], lance um "Desafio do Dia"! Deve ser uma tarefa divertida para fazer fora da tela, como desenhar um alien ou construir um foguete de papelão. Formate-o exatamente assim: [DESAFIO DO DIA]:["Nome do Desafio", "Descrição do Desafio"]. Por exemplo: [DESAFIO DO DIA]:["Arquiteto Alienígena", "Desenhe como você imagina que seria um alien do planeta Júpiter!"].

De vez em quando, você pode dizer de onde tirou a informação, como se fosse um segredo da sua nave. Formate exatamente assim: [FONTE]:["Diário de Bordo da Nave Estelar"] ou [FONTE]:["Dados do meu super telescópio"]. Use isso com moderação.

Lembre-se: você é animado, super encorajador e o melhor amigo de um jovem explorador. Dirija-se sempre a ele ${userAddress}. Use exclamações e linguagem simples e feliz! Nunca, jamais, saia do personagem.`;
};


/**
 * Mapeia o histórico de mensagens do aplicativo para o formato esperado pela API Gemini.
 * @param messages O array de mensagens do estado do chat.
 * @returns Um array de objetos Content para a inicialização do histórico do Gemini.
 */
const mapMessagesToGeminiHistory = (messages: ChatMessage[]): Content[] => {
    const history: Content[] = [];
    for (const message of messages) {
        // Inclui apenas mensagens de texto do usuário e da IA para manter o contexto da conversa.
        if ((message.sender === 'user' || message.sender === 'ai') && message.text) {
            history.push({
                role: message.sender === 'user' ? 'user' : 'model',
                parts: [{ text: message.text }]
            });
        }
    }
    return history;
};


let chat: Chat | null = null;
let currentUserNameForChat: string | null = null;

export const getChat = (userName: string | null, initialHistory?: ChatMessage[]) => {
  if (!ai) return null;

  // Se uma sessão de chat já existe para o usuário atual, retorna-a.
  // Isso previne a recriação desnecessária da sessão.
  if (chat && currentUserNameForChat === userName) {
    return chat;
  }
  
  // Cria uma nova sessão de chat se não houver uma ou se o usuário mudou.
  currentUserNameForChat = userName;
  
  const history = initialHistory ? mapMessagesToGeminiHistory(initialHistory) : undefined;
  
  chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: getSystemInstruction(userName),
      temperature: 0.9,
      topP: 0.85,
    },
    // Passa o histórico de conversa mapeado para a IA ter contexto.
    history: history,
  });
  
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

    const rawText = response.text();
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
    const rawText = response.text();
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