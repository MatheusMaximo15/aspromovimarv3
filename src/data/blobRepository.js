const { put, list, del } = require('@vercel/blob');

class BlobRepository {
  constructor() {
    this.token = process.env.BLOB_READ_WRITE_TOKEN;
  }

  /**
   * Lê dados de um blob
   * @param {string} blobName - Nome do blob (ex: 'eventos.json')
   * @returns {Promise<Array>} - Dados parseados
   */
  async _readBlob(blobName) {
    try {
      // Buscar todos os blobs com esse prefixo (pode haver versões antigas com sufixo)
      const { blobs } = await list({
        token: this.token,
        prefix: blobName,
        limit: 100
      });

      if (blobs.length === 0) {
        // Blob não existe, retornar array vazio
        console.log(`⚠️  Blob ${blobName} não encontrado, retornando array vazio`);
        return [];
      }

      // Se houver múltiplos blobs, ordenar por data de upload (mais recente primeiro)
      const sortedBlobs = blobs.sort((a, b) =>
        new Date(b.uploadedAt) - new Date(a.uploadedAt)
      );

      // Pegar o blob mais recente
      const mostRecentBlob = sortedBlobs[0];
      console.log(`📖 Lendo blob: ${mostRecentBlob.pathname} (total: ${blobs.length} blobs encontrados)`);

      const response = await fetch(mostRecentBlob.url);
      const data = await response.json();

      console.log(`📊 Dados lidos: ${Array.isArray(data) ? data.length + ' items' : 'não é array'}`);

      return data;
    } catch (error) {
      console.error(`Erro ao ler blob ${blobName}:`, error);
      return [];
    }
  }

  /**
   * Escreve dados em um blob
   * @param {string} blobName - Nome do blob (ex: 'eventos.json')
   * @param {Array} data - Dados a serem salvos
   */
  async _writeBlob(blobName, data) {
    try {
      // Primeiro, deletar o blob existente (se houver)
      const { blobs } = await list({
        token: this.token,
        prefix: blobName,
        limit: 100
      });

      // Deletar todos os blobs com esse prefixo
      for (const blob of blobs) {
        await del(blob.url, { token: this.token });
        console.log(`🗑️  Blob antigo deletado: ${blob.pathname}`);
      }

      // Agora criar o novo blob
      const jsonData = JSON.stringify(data, null, 2);
      const newBlob = await put(blobName, jsonData, {
        token: this.token,
        access: 'public',
        contentType: 'application/json'
      });
      console.log(`✅ Blob ${blobName} salvo com sucesso`);
      return newBlob;
    } catch (error) {
      console.error(`Erro ao escrever blob ${blobName}:`, error);
      throw error;
    }
  }
}

module.exports = BlobRepository;
