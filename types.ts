export interface ChatMedia {
  type: 'image' | 'video';
  title: string;
  preview: string; // URL de baixa resolução/thumb para imagem, ou a própria URL do vídeo para pré-visualização
  display: string; // URL de resolução média para a mensagem de chat ou fundo
  full: string;    // URL de alta resolução para visualização em tela cheia no modal
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  suggestions?: string[];
  media?: ChatMedia;
  source?: string;
  challenge?: { name: string; description: string; };
}