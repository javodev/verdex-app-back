import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { RecyclableMaterial } from '../models/RecyclableMaterial';

export class MaterialController {
  private materialRepository = AppDataSource.getRepository(RecyclableMaterial);

  getMaterials = async (req: Request, res: Response) => {
    try {
      const materials = await this.materialRepository.find({
        order: { name: 'ASC' }
      });

      res.json(materials);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener materiales' });
    }
  };

  getMaterialById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const material = await this.materialRepository.findOne({
        where: { id: parseInt(id) }
      });

      if (!material) {
        return res.status(404).json({ message: 'Material no encontrado' });
      }

      res.json(material);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener material' });
    }
  };

  createMaterial = async (req: Request, res: Response) => {
    try {
      const { name, description } = req.body;

      // Verificar si ya existe
      const existing = await this.materialRepository.findOne({
        where: { name }
      });

      if (existing) {
        return res.status(400).json({ message: 'El material ya existe' });
      }

      const material = this.materialRepository.create({
        name,
        description
      });

      await this.materialRepository.save(material);

      res.status(201).json({
        message: 'Material creado exitosamente',
        material
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al crear material' });
    }
  };

  updateMaterial = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, description, active } = req.body;

      const material = await this.materialRepository.findOne({
        where: { id: parseInt(id) }
      });

      if (!material) {
        return res.status(404).json({ message: 'Material no encontrado' });
      }

      // Verificar si otro material tiene el mismo nombre
      if (name && name !== material.name) {
        const existing = await this.materialRepository.findOne({
          where: { name }
        });
        if (existing) {
          return res.status(400).json({ message: 'Ya existe un material con ese nombre' });
        }
        material.name = name;
      }

      if (description !== undefined) material.description = description;
      if (active !== undefined) material.active = active;

      await this.materialRepository.save(material);

      res.json({
        message: 'Material actualizado exitosamente',
        material
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al actualizar material' });
    }
  };

  deleteMaterial = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const material = await this.materialRepository.findOne({
        where: { id: parseInt(id) }
      });

      if (!material) {
        return res.status(404).json({ message: 'Material no encontrado' });
      }

      // Soft delete - solo desactivar
      material.active = false;
      await this.materialRepository.save(material);

      res.json({
        message: 'Material desactivado exitosamente'
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al eliminar material' });
    }
  };
}