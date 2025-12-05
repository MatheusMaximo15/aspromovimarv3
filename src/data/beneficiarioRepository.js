const { v4: uuidv4 } = require('uuid');
const BlobRepository = require('./blobRepository');

class BeneficiarioRepository extends BlobRepository {
  constructor() {
    super();
    this.BENEFICIARIOS_BLOB = 'beneficiarios.json';
  }

  async getAllBeneficiarios() {
    return await this._readBlob(this.BENEFICIARIOS_BLOB);
  }

  async saveBeneficiarios(beneficiarios) {
    await this._writeBlob(this.BENEFICIARIOS_BLOB, beneficiarios);
  }

  async createBeneficiario(beneficiarioData) {
    const beneficiarios = await this._readBlob(this.BENEFICIARIOS_BLOB);

    const existingByCPF = beneficiarios.find(b => b.cpf === beneficiarioData.cpf);
    if (existingByCPF) {
      throw new Error('CPF já cadastrado');
    }

    const newBeneficiario = {
      id: uuidv4(),
      ...beneficiarioData,
      data_cadastro: new Date().toISOString(),
      status_inscricao: 'pendente',
      acao: beneficiarioData.acao || 'Mesa Brasil 2025'
    };

    beneficiarios.push(newBeneficiario);
    await this._writeBlob(this.BENEFICIARIOS_BLOB, beneficiarios);

    return newBeneficiario;
  }

  async findBeneficiarioByCPF(cpf) {
    const beneficiarios = await this._readBlob(this.BENEFICIARIOS_BLOB);
    return beneficiarios.find(b => b.cpf === cpf);
  }

  async findBeneficiarioById(id) {
    const beneficiarios = await this._readBlob(this.BENEFICIARIOS_BLOB);
    return beneficiarios.find(b => b.id === id);
  }

  async updateBeneficiario(id, updateData) {
    const beneficiarios = await this._readBlob(this.BENEFICIARIOS_BLOB);
    const index = beneficiarios.findIndex(b => b.id === id);

    if (index === -1) {
      throw new Error('Beneficiário não encontrado');
    }

    beneficiarios[index] = {
      ...beneficiarios[index],
      ...updateData,
      id: beneficiarios[index].id,
      data_cadastro: beneficiarios[index].data_cadastro
    };

    await this._writeBlob(this.BENEFICIARIOS_BLOB, beneficiarios);
    return beneficiarios[index];
  }

  async deleteBeneficiario(id) {
    const beneficiarios = await this._readBlob(this.BENEFICIARIOS_BLOB);
    const filteredBeneficiarios = beneficiarios.filter(b => b.id !== id);

    if (beneficiarios.length === filteredBeneficiarios.length) {
      throw new Error('Beneficiário não encontrado');
    }

    await this._writeBlob(this.BENEFICIARIOS_BLOB, filteredBeneficiarios);
    return true;
  }
}

module.exports = new BeneficiarioRepository();
