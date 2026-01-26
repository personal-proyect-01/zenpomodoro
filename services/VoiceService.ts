
/**
 * VoiceService deshabilitado.
 * Se eliminó el código de síntesis de voz según solicitud del usuario.
 */
class VoiceService {
  public async speak(_text: string) {
    // No hace nada
  }
}

export const voiceService = new VoiceService();
