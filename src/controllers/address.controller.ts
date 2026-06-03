import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppDataSource } from '../config/database';
import { Address } from '../models/Address';

export class AddressController {
  private addressRepository = AppDataSource.getRepository(Address);

  createAddress = async (req: AuthRequest, res: Response) => {
    try {
      const { alias, address_text, latitude, longitude } = req.body;
      const userId = req.user!.userId;

      const address = this.addressRepository.create({
        userId,
        alias,
        addressText: address_text,
        latitude,
        longitude
      });

      await this.addressRepository.save(address);

      res.status(201).json({
        message: 'Dirección creada exitosamente',
        address
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al crear dirección' });
    }
  };

  getUserAddresses = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.userId;

      const addresses = await this.addressRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' }
      });

      res.json(addresses);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener direcciones' });
    }
  };
}