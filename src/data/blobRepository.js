const { put, list } = require('@vercel/blob');

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
      const { blobs } = await list({
        token: this.token,
        prefix: blobName,
        limit: 1
      });

      if (blobs.length === 0) {
        // Blob não existe, retornar array vazio
        console.log(`⚠️  Blob ${blobName} não encontrado, retornando array vazio`);
        return [];
      }

      const response = await fetch(blobs[0].url);
      const data = await response.json();
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
      const jsonData = JSON.stringify(data, null, 2);
      const blob = await put(blobName, jsonData, {
        token: this.token,
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: true
      });
      console.log(`✅ Blob ${blobName} salvo com sucesso`);
      return blob;
    } catch (error) {
      console.error(`Erro ao escrever blob ${blobName}:`, error);
      throw error;
    }
  }
}

module.exports = BlobRepository;
