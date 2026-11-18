// ============================================================================
// ARCHIVO: src/utils/spotifyApi.ts
// DESCRIPCION: Conector oficial con las APIs de Spotify para FitPulse Pro.
// Integra tres mecanismos complementarios:
// 1. Reproductor Oficial Spotify Embed (reproduce las canciones dentro de la app).
// 2. API Publica Spotify oEmbed (obtiene titulo y portada real pegando cualquier link).
// 3. API Spotify Web /v1/me/playlists (importa las playlists de la cuenta del Coach).
// ============================================================================

// Interfaz que define los datos de una playlist de Spotify dentro de la aplicacion.
export interface SpotifyPlaylistItem {
  id: string;          // Identificador alfanumerico unico de la playlist en Spotify
  name: string;        // Titulo oficial de la playlist
  ownerName: string;   // Nombre del creador de la playlist (Spotify o el Coach)
  tracksCount: number; // Numero total de canciones incluidas
  coverUrl: string;    // URL de la imagen de portada de la playlist
  embedUrl: string;    // URL lista para insertarse en un reproductor iframe o WebView
  externalUrl: string; // Enlace directo para abrir la playlist en la app nativa de Spotify
}

// Catalogo predeterminado de playlists reales de entrenamiento verificadas en Spotify.
export const REAL_SPOTIFY_GYM_PLAYLISTS: SpotifyPlaylistItem[] = [
  {
    id: '37i9dQZF1DX76Wlfdnj7AP',
    name: 'Beast Mode (Spotify Oficial)',
    ownerName: 'Spotify',
    tracksCount: 150,
    coverUrl: 'https://i.scdn.co/image/ab67706f000000029249b35f23fb596b6f006a15',
    embedUrl:
      'https://open.spotify.com/embed/playlist/37i9dQZF1DX76Wlfdnj7AP?utm_source=generator&theme=0',
    externalUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX76Wlfdnj7AP',
  },
  {
    id: '37i9dQZF1DWTl4y3vgJOXW',
    name: 'Phonk Workout / PR Mode',
    ownerName: 'Spotify',
    tracksCount: 100,
    coverUrl: 'https://i.scdn.co/image/ab67706f00000002d72ef75e14ca6f60ea2364c2',
    embedUrl:
      'https://open.spotify.com/embed/playlist/37i9dQZF1DWTl4y3vgJOXW?utm_source=generator&theme=0',
    externalUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWTl4y3vgJOXW',
  },
  {
    id: '37i9dQZF1DWUVpAXiEPK8P',
    name: 'Power Workout & Heavy Lifts',
    ownerName: 'Spotify',
    tracksCount: 95,
    coverUrl: 'https://i.scdn.co/image/ab67706f00000002e4b3f58290944c1d1323b129',
    embedUrl:
      'https://open.spotify.com/embed/playlist/37i9dQZF1DWUVpAXiEPK8P?utm_source=generator&theme=0',
    externalUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWUVpAXiEPK8P',
  },
  {
    id: '37i9dQZF1DX70RN3TfWWJh',
    name: 'Cardio & HIIT Energy',
    ownerName: 'Spotify',
    tracksCount: 120,
    coverUrl: 'https://i.scdn.co/image/ab67706f000000025ea54b90b073c2776b966e7b',
    embedUrl:
      'https://open.spotify.com/embed/playlist/37i9dQZF1DX70RN3TfWWJh?utm_source=generator&theme=0',
    externalUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX70RN3TfWWJh',
  },
];

/**
 * Extrae el ID limpio de una playlist a partir de un enlace completo de Spotify
 * (por ejemplo: https://open.spotify.com/playlist/37i9dQZF1DX76Wlfdnj7AP?si=abc).
 * Si el texto no coincide con un enlace valido, devuelve el ID de Beast Mode por defecto.
 */
export function extractSpotifyPlaylistId(inputUrlOrId: string): string {
  const clean = inputUrlOrId.trim();
  // Busca el patron "/playlist/CODIGO" dentro de la URL pegada por el usuario
  const match = clean.match(/playlist\/([a-zA-Z0-9]+)/);
  if (match && match[1]) return match[1];
  // Si el usuario pego directamente el codigo alfanumerico de 15 a 30 caracteres, lo usa
  if (/^[a-zA-Z0-9]{15,30}$/.test(clean)) return clean;
  return '37i9dQZF1DX76Wlfdnj7AP';
}

/**
 * Construye la URL oficial del reproductor embebido de Spotify en modo oscuro (theme=0).
 */
export function buildSpotifyEmbedUrl(inputUrlOrId: string): string {
  const id = extractSpotifyPlaylistId(inputUrlOrId);
  return `https://open.spotify.com/embed/playlist/${id}?utm_source=generator&theme=0`;
}

/**
 * Consulta la API publica oEmbed de Spotify para obtener el nombre real y la foto de portada
 * de cualquier playlist publica sin necesidad de llaves privadas ni servidor intermedio.
 */
export async function fetchSpotifyOEmbedMetadata(playlistUrl: string): Promise<{
  title: string;
  thumbnailUrl: string;
  embedUrl: string;
} | null> {
  try {
    const id = extractSpotifyPlaylistId(playlistUrl);
    const fullUrl = `https://open.spotify.com/playlist/${id}`;
    const res = await fetch(
      `https://open.spotify.com/oembed?url=${encodeURIComponent(fullUrl)}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      title: data.title || 'Spotify Playlist',
      thumbnailUrl: data.thumbnail_url || '',
      embedUrl: buildSpotifyEmbedUrl(id),
    };
  } catch {
    return null;
  }
}

/**
 * Consulta el endpoint oficial GET /v1/me/playlists de la API Web de Spotify
 * cuando el entrenador inicia sesion con su token OAuth para listar todas sus playlists.
 */
export async function fetchUserSpotifyPlaylists(
  accessToken: string
): Promise<SpotifyPlaylistItem[]> {
  try {
    const res = await fetch('https://api.spotify.com/v1/me/playlists?limit=20', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return REAL_SPOTIFY_GYM_PLAYLISTS;
    const data = await res.json();
    return (data.items || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      ownerName: item.owner?.display_name || 'Coach',
      tracksCount: item.tracks?.total || 0,
      coverUrl: item.images?.[0]?.url || '',
      embedUrl: buildSpotifyEmbedUrl(item.id),
      externalUrl: item.external_urls?.spotify || '',
    }));
  } catch {
    return REAL_SPOTIFY_GYM_PLAYLISTS;
  }
}
