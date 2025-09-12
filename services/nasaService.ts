// services/nasaService.ts
import type { ChatMedia } from '../types';

const NASA_API_URL = 'https://images-api.nasa.gov';

interface NasaItemData {
  title: string;
  description: string;
  media_type?: 'image' | 'video' | 'audio';
}

interface NasaLink {
  href: string;
  rel: string;
  render?: string;
}

interface NasaItem {
  href: string; 
  data: NasaItemData[];
  links?: NasaLink[];
}

interface NasaApiResponse {
  collection: {
    items: NasaItem[];
  }
}

interface NasaImageUrls {
  preview: string;
  display: string;
  full: string;
}


/**
 * Fetches the collection manifest for a NASA image item and extracts the best available URLs.
 * It uses a scoring system to prioritize high-resolution images and selects a suitable low-resolution preview.
 * It also handles both relative and absolute URL paths from the manifest.
 * @param collectionUrl - The URL to the item's collection manifest.
 * @returns An object containing preview and high-resolution image URLs, or null on failure.
 */
const getImageUrlsFromCollection = async (collectionUrl: string): Promise<NasaImageUrls | null> => {
  try {
    const secureUrl = collectionUrl.replace(/^http:/, 'https:');
    const response = await fetch(secureUrl);
    if (!response.ok) {
        console.warn(`Falha ao buscar manifesto da coleção de ${secureUrl}, status: ${response.status}`);
        return null;
    }
    
    const manifestPaths: string[] = await response.json();
    const baseUrl = secureUrl; // The collection URL itself can act as the base for resolution

    const imageLinks = manifestPaths
      .filter(path => /\.(jpg|jpeg|png)$/i.test(path))
      .map(path => {
        try {
            // Use the URL constructor for robust relative path resolution.
            // It correctly handles absolute paths ('http...') as well.
            const url = new URL(path, baseUrl);
            url.protocol = 'https:'; // Ensure HTTPS
            return url.href;
        } catch (e) {
            console.warn(`Não foi possível construir a URL para o caminho "${path}" com a base "${baseUrl}"`, e);
            return null; // Retorna null para caminhos inválidos
        }
      })
      .filter((url): url is string => url !== null); // Filtra quaisquer nulos de construções de URL com falha

    if (imageLinks.length === 0) {
        console.warn(`Nenhuma imagem utilizável encontrada em ${secureUrl}`);
        return null;
    }

    const scoreUrl = (url: string): number => {
        const lowerUrl = url.toLowerCase();
        if (lowerUrl.includes('~orig')) return 5;
        if (lowerUrl.includes('~large')) return 4;
        if (lowerUrl.includes('~medium')) return 3;
        if (lowerUrl.includes('~small')) return 2;
        if (lowerUrl.includes('~thumb')) return 1;
        return 0; // Default score
    };
    
    const sortedLinks = [...imageLinks].sort((a, b) => scoreUrl(b) - scoreUrl(a));

    if (sortedLinks.length === 0) return null;

    const findUrlByScore = (score: number) => sortedLinks.find(link => scoreUrl(link) === score);

    // Estratégia de seleção de URL otimizada:
    // full: A melhor qualidade para o modal. Prioriza 'large' sobre 'orig' para evitar arquivos excessivamente grandes.
    const full = findUrlByScore(4) || findUrlByScore(5) || sortedLinks[0];
    
    // display: Uma imagem de boa qualidade para a mensagem do chat e fundos. Prioriza 'medium'.
    const display = findUrlByScore(3) || findUrlByScore(2) || full;
    
    // preview: A menor imagem possível para o placeholder de carregamento. Prioriza 'thumb'.
    const preview = findUrlByScore(1) || display;

    return {
      preview,
      display,
      full,
    };

  } catch (error) {
    console.error(`Erro ao processar manifesto da coleção de ${collectionUrl}:`, error);
    return null;
  }
}

/**
 * Fetches the collection manifest for a NASA item and extracts a video URL.
 * It prioritizes smaller file sizes for better performance.
 * @param item - A single item from the NASA API search results (must be a video type).
 * @returns A secure (https) URL to an mp4 video, or null if none are found.
 */
const getVideoUrlFromNasaItem = async (item: NasaItem): Promise<string | null> => {
    if (!item.href) return null;
    
    try {
        const collectionUrl = item.href.replace(/^http:/, 'https');
        const response = await fetch(collectionUrl);
        if (!response.ok) {
            console.warn(`Falha ao buscar o manifesto da coleção de vídeos de ${collectionUrl}`);
            return null;
        }

        const videoLinks: string[] = await response.json();
        
        const mobileVideo = videoLinks.find(link => link.endsWith('.mp4') && link.includes('~mobile'));
        if (mobileVideo) return mobileVideo.replace(/^http:/, 'https');

        const smallVideo = videoLinks.find(link => link.endsWith('.mp4') && link.includes('~small'));
        if (smallVideo) return smallVideo.replace(/^http:/, 'https');
        
        const anyMp4 = videoLinks.find(link => link.endsWith('.mp4'));
        if (anyMp4) return anyMp4.replace(/^http:/, 'https');

        return null;

    } catch (error) {
        console.error(`Erro ao processar a coleção de vídeos para o item com href ${item.href}:`, error);
        return null;
    }
}

export const fetchNasaMedia = async (query: string): Promise<ChatMedia | null> => {
  if (!query) return null;

  try {
    const searchUrl = `${NASA_API_URL}/search?q=${encodeURIComponent(query)}&page_size=10`;
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      throw new Error(`A solicitação da API da NASA falhou com o status ${response.status}`);
    }
    
    const data: NasaApiResponse = await response.json();
    
    for (const item of data.collection?.items || []) {
      const mediaType = item.data?.[0]?.media_type;
      const title = item.data?.[0]?.title || "Título indisponível";

      if (item.href && mediaType === 'image') {
        const imageUrls = await getImageUrlsFromCollection(item.href);
        if (imageUrls) {
          return { type: 'image', title, ...imageUrls };
        }
      } else if (item.href && mediaType === 'video') {
          const videoUrl = await getVideoUrlFromNasaItem(item);
          if (videoUrl) {
              // Para vídeos, todas as URLs apontam para o mesmo recurso otimizado.
              return { type: 'video', title, preview: videoUrl, display: videoUrl, full: videoUrl };
          }
      }
    }

    console.warn(`Nenhuma mídia de alta qualidade encontrada para a consulta: "${query}"`);
    return null;
  } catch (error) {
    console.error('Erro ao buscar mídia da API da NASA:', error);
    return null;
  }
};


export const fetchRandomNasaMedia = async (): Promise<ChatMedia | null> => {
    const searchTerms = ['galaxy', 'nebula', 'earth', 'apollo', 'planet', 'stars', 'hubble', 'mars rover', 'space shuttle'];
    const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];

    try {
        const searchUrl = `${NASA_API_URL}/search?q=${encodeURIComponent(randomTerm)}&page_size=100`;
        const response = await fetch(searchUrl);

        if (!response.ok) {
            throw new Error(`A solicitação da API da NASA falhou com o status ${response.status}`);
        }

        const data: NasaApiResponse = await response.json();
        const items = data.collection?.items.filter(item => 
          item.data?.[0]?.media_type && ['image', 'video'].includes(item.data[0].media_type) && item.href
        );
        
        if (!items || items.length === 0) {
            console.warn(`Nenhuma mídia de imagem ou vídeo utilizável encontrada para a consulta aleatória: "${randomTerm}"`);
            return null;
        }

        for (let i = 0; i < 5; i++) {
            const randomItem = items[Math.floor(Math.random() * items.length)];
            
            if (!randomItem.data?.[0] || !randomItem.href) continue;

            const mediaType = randomItem.data[0].media_type as 'image' | 'video';
            const { title } = randomItem.data[0];
            
            if (mediaType === 'image') {
                const imageUrls = await getImageUrlsFromCollection(randomItem.href);
                if (imageUrls) {
                    return {
                        type: 'image',
                        title: title || "Título indisponível",
                        ...imageUrls
                    };
                }
            } else if (mediaType === 'video') {
                const videoUrl = await getVideoUrlFromNasaItem(randomItem);
                if (videoUrl) {
                    return {
                        type: 'video',
                        title: title || "Título indisponível",
                        preview: videoUrl,
                        display: videoUrl,
                        full: videoUrl
                    };
                }
            }
        }
        
        console.warn(`Não foi possível encontrar uma URL de mídia`);
        return null;

    } catch (error) {
        console.error('Erro ao buscar mídia aleatória da NASA:', error);
        return null;
    }
};
