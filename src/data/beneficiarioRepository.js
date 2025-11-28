const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/config');

class BeneficiarioRepository {
  constructor() {
    this.dataPath = path.resolve(config.database.jsonPath);
  }

  async _readFile() {
    try {
      const data = await fs.readFile(this.dataPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        await this._writeFile([]);
        return [];
      }
      throw error;
    }
  }

  async _writeFile(data) {
    await fs.writeFile(this.dataPath, JSON.stringify(data, null, 2), 'utf-8');
  }

  async getAllBeneficiarios() {
    return await this._readFile();
  }

  async saveBeneficiarios(beneficiarios) {
    await this._writeFile(beneficiarios);
  }

  async createBeneficiario(beneficiarioData) {
    const beneficiarios = await this._readFile();

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
    await this._writeFile(beneficiarios);

    return newBeneficiario;
  }

  async findBeneficiarioByCPF(cpf) {
    const beneficiarios = await this._readFile();
    return beneficiarios.find(b => b.cpf === cpf);
  }

  async findBeneficiarioById(id) {
    const beneficiarios = await this._readFile();
    return beneficiarios.find(b => b.id === id);
  }

  async updateBeneficiario(id, updateData) {
    const beneficiarios = await this._readFile();
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

    await this._writeFile(beneficiarios);
    return beneficiarios[index];
  }

  async deleteBeneficiario(id) {
    const beneficiarios = await this._readFile();
    const filteredBeneficiarios = beneficiarios.filter(b => b.id !== id);

    if (beneficiarios.length === filteredBeneficiarios.length) {
      throw new Error('Beneficiário não encontrado');
    }

    await this._writeFile(filteredBeneficiarios);
    return true;
  }
}

module.exports = new BeneficiarioRepository();
